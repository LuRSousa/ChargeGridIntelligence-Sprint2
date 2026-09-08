if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('[PWA] Service Worker registrado:', reg.scope))
      .catch((err) => console.warn('[PWA] Falha ao registrar Service Worker:', err));
  });
}
 
let deferredPrompt = null;
 
function ehIOS() {
  const ua = window.navigator.userAgent;
  const iOSClassico = /iphone|ipad|ipod/i.test(ua);
  const iPadOS13Mais = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSClassico || iPadOS13Mais;
}
 
function jaInstalado() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
 
function criarEstiloModalIOS() {
  if (document.getElementById('estiloTutorialIOS')) return;
  const style = document.createElement('style');
  style.id = 'estiloTutorialIOS';
  style.textContent = `
    #overlayTutorialIOS {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0,0,0,0.55);
      display: flex; align-items: flex-end; justify-content: center;
      animation: fadeInOverlayIOS 0.2s ease;
    }
    @keyframes fadeInOverlayIOS { from { opacity: 0; } to { opacity: 1; } }
    #cardTutorialIOS {
      background: #ffffff; width: 100%; max-width: 420px;
      border-radius: 20px 20px 0 0; padding: 22px 22px 28px 22px;
      font-family: Arial, sans-serif; color: #222222;
      box-shadow: 0 -6px 24px rgba(0,0,0,0.25);
      animation: slideUpTutorialIOS 0.25s ease;
    }
    @keyframes slideUpTutorialIOS { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    #cardTutorialIOS h3 {
      margin: 0 0 14px 0; font-size: 1.1rem; text-align: center; color: #db3931;
    }
    #cardTutorialIOS .passo-ios {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.92rem;
    }
    #cardTutorialIOS .passo-ios:last-of-type { border-bottom: none; }
    #cardTutorialIOS .numero-passo-ios {
      flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
      background: #db3931; color: #fff; font-weight: bold; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center;
    }
    #cardTutorialIOS .icone-passo-ios { font-size: 1.3rem; flex-shrink: 0; }
    #btnFecharTutorialIOS {
      width: 100%; margin-top: 18px; padding: 12px; border: none;
      border-radius: 12px; background: #f0f0f0; color: #444;
      font-weight: bold; font-size: 0.9rem; cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}
 
function mostrarTutorialIOS() {
  criarEstiloModalIOS();
  if (document.getElementById('overlayTutorialIOS')) return;
 
  const overlay = document.createElement('div');
  overlay.id = 'overlayTutorialIOS';
  overlay.innerHTML = `
    <div id="cardTutorialIOS">
      <h3>Instalar o GoodWe ChargeGrid</h3>
      <div class="passo-ios">
        <span class="numero-passo-ios">1</span>
        <span class="icone-passo-ios">&#x2191;&#x25A2;</span>
        <span>Toque no ícone <b>Compartilhar</b> na barra do Safari (embaixo, ou em cima em alguns iPhones).</span>
      </div>
      <div class="passo-ios">
        <span class="numero-passo-ios">2</span>
        <span class="icone-passo-ios">&#x2795;</span>
        <span>Role a lista de opções e toque em <b>"Adicionar à Tela de Início"</b>.</span>
      </div>
      <div class="passo-ios">
        <span class="numero-passo-ios">3</span>
        <span class="icone-passo-ios">&#x2705;</span>
        <span>Toque em <b>"Adicionar"</b> no canto superior direito. Pronto!</span>
      </div>
      <button id="btnFecharTutorialIOS" type="button">Entendi</button>
    </div>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  document.getElementById('btnFecharTutorialIOS').addEventListener('click', () => overlay.remove());
}
 
function criarBotaoInstalar() {
  if (document.getElementById('btnInstalarPWA')) return;
 
  const btn = document.createElement('button');
  btn.id = 'btnInstalarPWA';
  btn.type = 'button';
  btn.textContent = '⬇ Instalar app';
  btn.setAttribute('aria-label', 'Instalar GoodWe ChargeGrid');
 
  Object.assign(btn.style, {
    position: 'fixed',
    left: '50%',
    bottom: '100px',
    transform: 'translateX(-50%)',
    zIndex: '1500',
    padding: '10px 18px',
    borderRadius: '24px',
    border: 'none',
    background: 'linear-gradient(180deg, #db3931 0%, #f71612 100%)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    cursor: 'pointer'
  });
 
  btn.addEventListener('click', async () => {
    if (ehIOS()) {
      mostrarTutorialIOS();
      return;
    }
 
    if (!deferredPrompt) return;
    btn.disabled = true;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Resultado da instalação:', outcome);
    deferredPrompt = null;
    btn.remove();
  });
 
  document.body.appendChild(btn);
}
 
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  criarBotaoInstalar();
});
 
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const btn = document.getElementById('btnInstalarPWA');
  if (btn) btn.remove();
  console.log('[PWA] GoodWe ChargeGrid instalado com sucesso.');
});
 

window.addEventListener('load', () => {
  if (ehIOS() && !jaInstalado()) {
    criarBotaoInstalar();
  }
});
 