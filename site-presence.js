(() => {
  const button = document.getElementById('enter-space');
  const status = document.getElementById('entry-status');
  if (!button || !status) return;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const endpoint = local ? 'http://127.0.0.1:8791/presence' : 'https://atlas-ws.summerz.net/presence';
  let stream, stale;
  function unavailable() {
    button.disabled = true;
    button.textContent = '입장하기 —/8';
    status.textContent = '현재 인원을 확인하고 있습니다. 연결되면 입장할 수 있습니다.';
  }
  function connect() {
    stream?.close(); clearTimeout(stale); unavailable();
    stream = new EventSource(endpoint);
    stream.onmessage = event => {
      let data; try { data = JSON.parse(event.data); } catch { unavailable(); return; }
      if (data.capacity !== 8 || !Number.isInteger(data.visitors) || data.visitors < 0 || data.visitors > 8) { unavailable(); return; }
      clearTimeout(stale); stale = setTimeout(unavailable, 25000);
      button.textContent = `입장하기 ${data.visitors}/8`;
      button.disabled = data.visitors >= 8;
      status.textContent = data.visitors >= 8 ? '지금은 8명이 이용 중입니다. 빈자리가 생기면 입장 버튼이 활성화됩니다.' : '입장하면 같은 공간의 방문자와 자동으로 연결됩니다.';
    };
    stream.onerror = unavailable;
  }
  button.addEventListener('click', () => {
    if (button.disabled) return;
    button.disabled = true; location.assign(button.dataset.href);
  });
  window.addEventListener('pagehide', () => { stream?.close(); clearTimeout(stale); });
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) connect(); });
  connect();
})();
