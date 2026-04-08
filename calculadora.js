// ============================================================
// CONFIGURAÇÃO — substituir antes de publicar
// ============================================================
var WEBHOOK_URL = 'https://hook.us2.make.com/v5rc7xl1uodqohsa0h4j3hqp1ujxfa5r';
var WHATSAPP_URL = 'https://wa.me/55XXXXXXXXXXX';

// ============================================================
// CALCULADORA DE EQUIPARAÇÃO HOSPITALAR — JUK CATTANI
// ============================================================

(function () {

  var container = document.getElementById('calculadora-container');
  if (!container) return;

  // Estado global
  var state = {
    faturamento: 300000,
    regime: null,
    especialidade: null,
    nome: '',
    whatsapp: '',
    economiaTrim: 0,
    economiaAnual: 0,
    economia5anos: 0
  };

  // ── CÁLCULO ──────────────────────────────────────────────
  function calcular(fat) {
    var PIS      = fat * 0.0065;
    var COFINS   = fat * 0.03;

    var baseIRPJ_sem  = fat * 0.32;
    var IRPJ_sem      = baseIRPJ_sem * 0.15;
    var adicional_sem = Math.max(0, baseIRPJ_sem - 60000) * 0.10;
    var baseCSLL_sem  = fat * 0.32;
    var CSLL_sem      = baseCSLL_sem * 0.09;
    var total_sem     = IRPJ_sem + adicional_sem + CSLL_sem + PIS + COFINS;

    var baseIRPJ_com  = fat * 0.08;
    var IRPJ_com      = baseIRPJ_com * 0.15;
    var baseCSLL_com  = fat * 0.12;
    var CSLL_com      = baseCSLL_com * 0.09;
    var total_com     = IRPJ_com + CSLL_com + PIS + COFINS;

    return {
      economiaTrim:  total_sem - total_com,
      economiaAnual: (total_sem - total_com) * 4,
      economia5anos: (total_sem - total_com) * 4 * 5,
      total_sem:     total_sem,
      total_com:     total_com,
      IRPJ_sem:      IRPJ_sem + adicional_sem,
      IRPJ_com:      IRPJ_com,
      CSLL_sem:      CSLL_sem,
      CSLL_com:      CSLL_com,
      cargaSem:      (total_sem / fat * 100).toFixed(1),
      cargaCom:      (total_com / fat * 100).toFixed(1)
    };
  }

  // ── FORMATAÇÃO ────────────────────────────────────────────
  function fmt(val) {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // ── BARRA DE PROGRESSO ────────────────────────────────────
  function progressBar(step) {
    return '<div class="calc-progress">' +
      '<div class="calc-progress-bar" style="width:' + (step / 3 * 100) + '%"></div>' +
      '<div class="calc-steps">' +
        '<span class="calc-step ' + (step >= 1 ? 'active' : '') + '">1</span>' +
        '<span class="calc-step-line ' + (step >= 2 ? 'active' : '') + '"></span>' +
        '<span class="calc-step ' + (step >= 2 ? 'active' : '') + '">2</span>' +
        '<span class="calc-step-line ' + (step >= 3 ? 'active' : '') + '"></span>' +
        '<span class="calc-step ' + (step >= 3 ? 'active' : '') + '">3</span>' +
      '</div>' +
    '</div>';
  }

  // ── ETAPA 1 ───────────────────────────────────────────────
  function renderEtapa1() {
    container.innerHTML =
      progressBar(1) +
      '<div class="calc-card">' +
        '<h3 class="calc-title">Simule sua economia tributária</h3>' +

        '<div class="calc-field">' +
          '<label class="calc-label">Faturamento trimestral</label>' +
          '<div class="calc-slider-val" id="sliderVal">' + fmt(state.faturamento) + '</div>' +
          '<input type="range" class="calc-slider" id="fatSlider"' +
            ' min="100000" max="1000000" step="50000" value="' + state.faturamento + '">' +
          '<div class="calc-slider-limits"><span>R$ 100k</span><span>R$ 1M</span></div>' +
        '</div>' +

        '<div class="calc-field">' +
          '<label class="calc-label">Regime tributário</label>' +
          '<div class="calc-btn-group" id="regimeGroup">' +
            '<button class="calc-opt-btn ' + (state.regime === 'lucro_presumido' ? 'selected' : '') + '" data-val="lucro_presumido">Lucro Presumido</button>' +
            '<button class="calc-opt-btn ' + (state.regime === 'lucro_real' ? 'selected' : '') + '" data-val="lucro_real">Lucro Real</button>' +
            '<button class="calc-opt-btn ' + (state.regime === 'nao_sei' ? 'selected' : '') + '" data-val="nao_sei">Não sei ainda</button>' +
          '</div>' +
        '</div>' +

        '<div class="calc-field">' +
          '<label class="calc-label">Especialidade</label>' +
          '<div class="calc-btn-group" id="espGroup">' +
            '<button class="calc-opt-btn ' + (state.especialidade === 'harmonizacao' ? 'selected' : '') + '" data-val="harmonizacao">Harmonização facial</button>' +
            '<button class="calc-opt-btn ' + (state.especialidade === 'odonto' ? 'selected' : '') + '" data-val="odonto">Odontologia estética</button>' +
            '<button class="calc-opt-btn ' + (state.especialidade === 'derma' ? 'selected' : '') + '" data-val="derma">Dermatologia</button>' +
            '<button class="calc-opt-btn ' + (state.especialidade === 'outro' ? 'selected' : '') + '" data-val="outro">Outra</button>' +
          '</div>' +
        '</div>' +

        '<button class="calc-btn-primary" id="btnCalcular" ' + (!state.regime || !state.especialidade ? 'disabled' : '') + '>Calcular minha economia →</button>' +
      '</div>';

    // Slider
    var slider = document.getElementById('fatSlider');
    var sliderVal = document.getElementById('sliderVal');
    slider.addEventListener('input', function () {
      state.faturamento = parseInt(this.value);
      sliderVal.textContent = fmt(state.faturamento);
    });

    // Regime
    document.getElementById('regimeGroup').addEventListener('click', function (e) {
      var btn = e.target.closest('.calc-opt-btn');
      if (!btn) return;
      state.regime = btn.dataset.val;
      document.querySelectorAll('#regimeGroup .calc-opt-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      validarEtapa1();
    });

    // Especialidade
    document.getElementById('espGroup').addEventListener('click', function (e) {
      var btn = e.target.closest('.calc-opt-btn');
      if (!btn) return;
      state.especialidade = btn.dataset.val;
      document.querySelectorAll('#espGroup .calc-opt-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      validarEtapa1();
    });

    // Calcular
    document.getElementById('btnCalcular').addEventListener('click', function () {
      var res = calcular(state.faturamento);
      state.economiaTrim  = res.economiaTrim;
      state.economiaAnual = res.economiaAnual;
      state.economia5anos = res.economia5anos;
      state._res = res;
      renderEtapa2();
    });
  }

  function validarEtapa1() {
    var btn = document.getElementById('btnCalcular');
    if (btn) btn.disabled = (!state.regime || !state.especialidade);
  }

  // ── ETAPA 2 ───────────────────────────────────────────────
  function renderEtapa2() {
    container.innerHTML =
      progressBar(2) +
      '<div class="calc-card">' +
        '<h3 class="calc-title">Sua simulação está pronta!</h3>' +
        '<p class="calc-subtitle">Informe seu WhatsApp para desbloquear o resultado completo.</p>' +

        '<div class="calc-preview-cards">' +
          '<div class="calc-preview-card">' +
            '<div class="calc-locked-badge">🔒</div>' +
            '<div class="calc-preview-label">Economia trimestral</div>' +
            '<div class="calc-preview-val blurred">' + fmt(state.economiaTrim) + '</div>' +
          '</div>' +
          '<div class="calc-preview-card">' +
            '<div class="calc-locked-badge">🔒</div>' +
            '<div class="calc-preview-label">Economia anual</div>' +
            '<div class="calc-preview-val blurred">' + fmt(state.economiaAnual) + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="calc-field">' +
          '<label class="calc-label">Nome <span class="calc-optional"></span></label>' +
          '<input type="text" class="calc-input" id="inputNome" placeholder="Seu nome" value="' + state.nome + '">' +
        '</div>' +
        '<div class="calc-field">' +
          '<label class="calc-label">WhatsApp <span class="calc-required">*</span></label>' +
          '<input type="tel" class="calc-input" id="inputWpp" placeholder="(00) 00000-0000" value="' + state.whatsapp + '">' +
        '</div>' +
        '<p class="calc-privacy">🔒 Seus dados são usados apenas para envio da análise. Sem spam.</p>' +

        '<button class="calc-btn-primary" id="btnDesbloquear" disabled>Ver resultado completo →</button>' +
        '<button class="calc-btn-secondary" id="btnVoltar">← Editar dados</button>' +
      '</div>';

    var inputWpp = document.getElementById('inputWpp');
    var btnDesbloquear = document.getElementById('btnDesbloquear');

    inputWpp.addEventListener('input', function () {
      state.whatsapp = this.value.replace(/\D/g, '');
      btnDesbloquear.disabled = state.whatsapp.length < 10;
    });

    document.getElementById('inputNome').addEventListener('input', function () {
      state.nome = this.value;
    });

    btnDesbloquear.addEventListener('click', function () {
      state.nome = document.getElementById('inputNome').value;
      state.whatsapp = document.getElementById('inputWpp').value.replace(/\D/g, '');
      enviarWebhook();
      renderEtapa3();
    });

    document.getElementById('btnVoltar').addEventListener('click', function () {
      renderEtapa1();
    });
  }

  // ── ETAPA 3 ───────────────────────────────────────────────
  function renderEtapa3() {
    var res = state._res;
    var avisoRegime = (state.regime === 'lucro_real' || state.regime === 'nao_sei')
      ? '<p class="calc-aviso">⚠️ Simulação baseada em Lucro Presumido. Seu regime pode impactar os valores reais — nossa equipe fará a análise correta.</p>'
      : '';

    container.innerHTML =
      progressBar(3) +
      '<div class="calc-card">' +
        '<h3 class="calc-title">Sua economia estimada</h3>' +

        // Card hero
        '<div class="calc-hero-card">' +
          '<div class="calc-hero-label">Economia anual estimada</div>' +
          '<div class="calc-hero-val">' + fmt(state.economiaAnual) + '</div>' +
        '</div>' +

        // Cards menores
        '<div class="calc-result-grid">' +
          '<div class="calc-result-card">' +
            '<div class="calc-result-label">Economia trimestral</div>' +
            '<div class="calc-result-val">' + fmt(state.economiaTrim) + '</div>' +
          '</div>' +
          '<div class="calc-result-card">' +
            '<div class="calc-result-label">Economia em 5 anos</div>' +
            '<div class="calc-result-val">' + fmt(state.economia5anos) + '</div>' +
          '</div>' +
        '</div>' +

        // Tabela comparativa
        '<table class="calc-table">' +
          '<thead><tr><th>Comparativo</th><th>Sem equiparação</th><th>Com equiparação</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>Carga tributária (%)</td><td>' + res.cargaSem + '%</td><td>' + res.cargaCom + '%</td></tr>' +
            '<tr><td>Redução sobre a receita</td><td colspan="2" class="calc-td-destaque">−' + (res.cargaSem - res.cargaCom).toFixed(1) + ' p.p.</td></tr>' +
            '<tr><td>IRPJ + adicional (trim.)</td><td>' + fmt(res.IRPJ_sem) + '</td><td>' + fmt(res.IRPJ_com) + '</td></tr>' +
            '<tr><td>CSLL (trim.)</td><td>' + fmt(res.CSLL_sem) + '</td><td>' + fmt(res.CSLL_com) + '</td></tr>' +
          '</tbody>' +
        '</table>' +

        avisoRegime +

        '<p class="calc-footnote">Esta é uma estimativa baseada nas regras gerais da equiparação hospitalar. Os valores reais dependem de análise técnica do seu caso. A equipe Juk Cattani entrará em contato pelo WhatsApp para detalhar sua situação.</p>' +

        '<a href="' + WHATSAPP_URL + '" target="_blank" class="calc-btn-primary calc-btn-wa">Falar com um especialista agora →</a>' +
        '<button class="calc-btn-secondary" id="btnReiniciar">← Nova simulação</button>' +
      '</div>';

    // Animação de entrada nos cards
    setTimeout(function () {
      document.querySelectorAll('.calc-result-card, .calc-hero-card').forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.1) + 's';
        el.classList.add('visible');
      });
    }, 50);

    document.getElementById('btnReiniciar').addEventListener('click', function () {
      state.regime = null;
      state.especialidade = null;
      renderEtapa1();
    });
  }

  // ── WEBHOOK ───────────────────────────────────────────────
  function enviarWebhook() {
    if (!WEBHOOK_URL || WEBHOOK_URL.indexOf('SEU_WEBHOOK') !== -1) return;
    fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome:                state.nome,
        whatsapp:            state.whatsapp,
        faturamento:         state.faturamento,
        regime:              state.regime,
        especialidade:       state.especialidade,
        economia_trimestral: Math.round(state.economiaTrim),
        economia_anual:      Math.round(state.economiaAnual),
        economia_5anos:      Math.round(state.economia5anos),
        origem:              'calculadora-equiparacao-hospitalar'
      })
    }).catch(function () {});
  }

  // ── INIT ──────────────────────────────────────────────────
  renderEtapa1();

})();
