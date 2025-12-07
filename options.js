// 画面読み込み時に、保存されている設定を復元する
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({
    // デフォルト値
    speed: 1.0,
    volume: 1.0
  }, (items) => {
    document.getElementById('speed').value = items.speed;
    document.getElementById('speedValue').textContent = items.speed;
    
    document.getElementById('volume').value = items.volume;
    document.getElementById('volumeValue').textContent = items.volume;
  });
});

// スライダー操作時に数値をリアルタイム表示
document.getElementById('speed').addEventListener('input', (e) => {
  document.getElementById('speedValue').textContent = e.target.value;
});
document.getElementById('volume').addEventListener('input', (e) => {
  document.getElementById('volumeValue').textContent = e.target.value;
});

// 保存ボタンクリック時の処理
document.getElementById('save').addEventListener('click', () => {
  const speed = parseFloat(document.getElementById('speed').value);
  const volume = parseFloat(document.getElementById('volume').value);

  chrome.storage.local.set({
    speed: speed,
    volume: volume
  }, () => {
    // 保存完了メッセージを表示
    const status = document.getElementById('status');
    status.textContent = '設定を保存しました！';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
});