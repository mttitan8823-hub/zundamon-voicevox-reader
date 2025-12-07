const VOICVOX_ENGINE_URL = "http://127.0.0.1:50021";
const ZUNDAMON_SPEAKER_ID = 3; 
const OFFSCREEN_PATH = 'offscreen.html';

// 1. 右クリックメニューの作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read_with_zundamon",
    title: "ずんだもん（VOICVOX）で読み上げる",
    contexts: ["selection"]
  });
});

// 2. メニュークリック時の処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "read_with_zundamon" && info.selectionText) {
    await synthesizeAndPlayOffscreen(info.selectionText);
  }
});

/**
 * 設定値を読み込み、テキストを音声化してOffscreenドキュメントで再生する
 */
async function synthesizeAndPlayOffscreen(text) {
  try {
    // --- A. 設定値(速度・音量)の取得 ---
    // chrome.storageから設定を取得。なければデフォルト1.0を使用
    const settings = await chrome.storage.local.get({ speed: 1.0, volume: 1.0 });

    // --- B. VOICVOXで音声データを作成 ---
    const encodedText = encodeURIComponent(text);
    
    // B-1. Query作成 (音声合成の設計図をもらう)
    const queryRes = await fetch(`${VOICVOX_ENGINE_URL}/audio_query?text=${encodedText}&speaker=${ZUNDAMON_SPEAKER_ID}`, { method: 'POST' });
    if (!queryRes.ok) throw new Error("Query failed");
    
    // 設計図(JSON)を取得
    const queryData = await queryRes.json();

    // ★ここで設定値を適用して設計図を書き換える★
    queryData.speedScale = settings.speed;   // 話速
    queryData.volumeScale = settings.volume; // 音量

    // B-2. 音声合成 (書き換えた設計図を渡して音を作ってもらう)
    const synthesisRes = await fetch(`${VOICVOX_ENGINE_URL}/synthesis?speaker=${ZUNDAMON_SPEAKER_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryData) // 書き換えたデータを送信
    });
    if (!synthesisRes.ok) throw new Error("Synthesis failed");

    const audioBlob = await synthesisRes.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();

    // --- C. Offscreenドキュメントの準備 ---
    if (!(await hasOffscreenDocument(OFFSCREEN_PATH))) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_PATH,
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: 'VOICVOX音声の再生のため',
      });
    }

    // --- D. 再生命令を送信 ---
    chrome.runtime.sendMessage({
      type: 'play-audio',
      target: 'offscreen',
      data: Array.from(new Uint8Array(arrayBuffer))
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

// Offscreenドキュメントが既に存在するか確認する関数
async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();
  return matchedClients.some(c => c.url === offscreenUrl);
}