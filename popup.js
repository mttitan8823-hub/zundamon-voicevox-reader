// 画面読み込み時に、保存されている設定を復元する
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({
    speed: 1.0,
    volume: 1.0
  }, (items) => {
    document.getElementById('speed').value = items.speed;
    document.getElementById('speedValue').textContent = items.speed;
    
    document.getElementById('volume').value = items.volume;
    document.getElementById('volumeValue').textContent = items.volume;
  });
});

// 設定変更時に即座に chrome.storage に保存する関数
const saveSetting = () => {
  const speed = parseFloat(document.getElementById('speed').value);
  const volume = parseFloat(document.getElementById('volume').value);

  chrome.storage.local.set({
    speed: speed,
    volume: volume
  });
};


// スライダー操作時に数値をリアルタイム表示し、即座に保存
document.getElementById('speed').addEventListener('input', (e) => {
  document.getElementById('speedValue').textContent = e.target.value;
  saveSetting(); 
});

document.getElementById('volume').addEventListener('input', (e) => {
  document.getElementById('volumeValue').textContent = e.target.value;
  saveSetting(); 
});