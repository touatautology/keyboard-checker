// キーボードチェッカー
(function () {
  'use strict';

  // DOM要素
  const keyElements = document.querySelectorAll('.key[data-code]');
  const coverageFill = document.getElementById('coverage-fill');
  const coverageText = document.getElementById('coverage-text');
  const infoKey = document.getElementById('info-key');
  const infoCode = document.getElementById('info-code');
  const infoKeycode = document.getElementById('info-keycode');
  const infoLocation = document.getElementById('info-location');
  const resetBtn = document.getElementById('reset-btn');
  const unknownKeysSection = document.getElementById('unknown-keys');
  const unknownKeysList = document.getElementById('unknown-keys-list');

  // 登録済みキーコードのマップ
  const registeredCodes = new Set();
  const keyElementMap = new Map();

  keyElements.forEach(el => {
    const code = el.dataset.code;
    registeredCodes.add(code);
    keyElementMap.set(code, el);
  });

  const totalKeys = registeredCodes.size;

  // テスト状態
  const testedCodes = new Set();
  const unknownCodes = new Set();

  // location名
  const locationNames = {
    0: 'Standard',
    1: 'Left',
    2: 'Right',
    3: 'Numpad'
  };

  // カバレッジ更新
  function updateCoverage() {
    const tested = testedCodes.size;
    const pct = totalKeys > 0 ? (tested / totalKeys * 100) : 0;
    coverageFill.style.width = pct + '%';
    coverageText.textContent = tested + ' / ' + totalKeys + ' keys tested (' + Math.round(pct) + '%)';
  }

  // キー情報表示
  function showKeyInfo(e, resolvedCode) {
    infoKey.textContent = e.key;
    infoCode.textContent = resolvedCode || e.code || '-';
    infoKeycode.textContent = e.keyCode;
    infoLocation.textContent = locationNames[e.location] || e.location;
  }

  // 未登録キー追加
  function addUnknownKey(code) {
    if (unknownCodes.has(code)) return;
    unknownCodes.add(code);
    unknownKeysSection.classList.add('visible');
    const tag = document.createElement('span');
    tag.className = 'unknown-key-tag';
    tag.textContent = code;
    unknownKeysList.appendChild(tag);
  }

  // e.codeが空の場合にe.keyとe.locationから推定
  function resolveCode(e) {
    if (e.code) return e.code;
    // e.codeが空の場合、key + location で推定
    // location: 0=Standard, 1=Left, 2=Right, 3=Numpad
    // 一部ブラウザ/環境で右修飾キーがlocation=0で報告される場合がある
    const key = e.key;
    const loc = e.location;
    if (key === 'Shift')   return loc === 1 ? 'ShiftLeft'   : 'ShiftRight';
    if (key === 'Control') return loc === 1 ? 'ControlLeft'  : 'ControlRight';
    if (key === 'Alt')     return loc === 1 ? 'AltLeft'      : 'AltRight';
    if (key === 'Meta')    return loc === 1 ? 'MetaLeft'     : 'MetaRight';
    return '';
  }

  // キー押下
  function onKeyDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const code = resolveCode(e);
    showKeyInfo(e, code);
    const el = keyElementMap.get(code);

    if (el) {
      el.classList.add('active', 'tested');
      testedCodes.add(code);
      updateCoverage();
    } else if (code) {
      addUnknownKey(code);
    }
  }

  // キー離し
  function onKeyUp(e) {
    e.preventDefault();
    e.stopPropagation();

    const code = resolveCode(e);
    const el = keyElementMap.get(code);
    if (el) {
      el.classList.remove('active');
    }
  }

  // リセット
  function reset() {
    testedCodes.clear();
    unknownCodes.clear();

    keyElements.forEach(el => {
      el.classList.remove('tested', 'active');
    });

    unknownKeysList.innerHTML = '';
    unknownKeysSection.classList.remove('visible');

    infoKey.textContent = '-';
    infoCode.textContent = '-';
    infoKeycode.textContent = '-';
    infoLocation.textContent = '-';

    updateCoverage();
  }

  // イベント登録
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  resetBtn.addEventListener('click', reset);

  // ブラウザデフォルト動作の抑制（Tab、Spaceなど）
  window.addEventListener('keydown', function (e) {
    // F5やCtrl+Rなどリロード系は許可
    if (e.code === 'F5' || (e.ctrlKey && e.code === 'KeyR')) return;
    e.preventDefault();
  });

  // 初期表示
  updateCoverage();

  // Service Worker登録
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {
      // サービスワーカーが利用できない環境では無視
    });
  }
})();
