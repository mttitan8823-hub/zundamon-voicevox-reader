// background.js からのメッセージを待機
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'play-audio' && message.target === 'offscreen') {
    playAudio(message.data);
  }
});

async function playAudio(dataArray) {
  try {
    // 1. 送られてきた数字の配列を元の音声データ(Blob)に戻す
    const uint8Array = new Uint8Array(dataArray);
    const blob = new Blob([uint8Array], { type: 'audio/wav' });

    // 2. 音声を再生
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    await audio.play();

    // 3. 再生終了後の後始末
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };

  } catch (error) {
    console.error("Offscreen Playback Error:", error);
  }
}