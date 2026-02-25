/**
 * TI-84 Plus CE style graphing calculator — main app.
 */

(function () {
  const display = document.getElementById('display');
  const displayLabel = document.getElementById('displayLabel');
  const graphCanvas = document.getElementById('graphCanvas');
  const angleModeEl = document.getElementById('angleMode');
  const modalYEquals = document.getElementById('modalYEquals');
  const modalWindow = document.getElementById('modalWindow');
  const modalMode = document.getElementById('modalMode');
  const modalTable = document.getElementById('modalTable');
  const yEditor = document.getElementById('yEditor');
  const windowEditor = document.getElementById('windowEditor');
  const modeEditor = document.getElementById('modeEditor');
  const tableBody = document.getElementById('tableBody');

  let displayValue = '';
  let equations = ['', '', '', '']; // Y1, Y2, Y3, Y4
  let angleMode = 'rad';
  let secondPressed = false;

  const defaultWindow = { xMin: -10, xMax: 10, xScl: 1, yMin: -10, yMax: 10, yScl: 1 };

  function updateDisplay(text) {
    displayValue = text;
    display.textContent = text || '0';
  }

  function appendDisplay(str) {
    updateDisplay(displayValue + str);
  }

  function getWindowFromEditor() {
    const inputs = windowEditor.querySelectorAll('input');
    return {
      xMin: Number(inputs[0]?.value) ?? defaultWindow.xMin,
      xMax: Number(inputs[1]?.value) ?? defaultWindow.xMax,
      yMin: Number(inputs[2]?.value) ?? defaultWindow.yMin,
      yMax: Number(inputs[3]?.value) ?? defaultWindow.yMax,
    };
  }

  function buildYEditor() {
    yEditor.innerHTML = '';
    ['Y₁', 'Y₂', 'Y₃', 'Y₄'].forEach((label, i) => {
      const row = document.createElement('div');
      row.className = 'y-row';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = '0';
      inp.value = equations[i] || '';
      inp.dataset.index = i;
      inp.addEventListener('change', () => {
        equations[inp.dataset.index] = inp.value.trim();
        redraw();
      });
      inp.addEventListener('input', () => {
        equations[inp.dataset.index] = inp.value;
        redraw();
      });
      row.innerHTML = `<label>${label}=</label>`;
      row.appendChild(inp);
      yEditor.appendChild(row);
    });
  }

  function buildWindowEditor() {
    const w = Graph.getWindow();
    windowEditor.innerHTML = `
      <label>Xmin</label><input type="number" value="${w.xMin}" step="any">
      <label>Xmax</label><input type="number" value="${w.xMax}" step="any">
      <label>Ymin</label><input type="number" value="${w.yMin}" step="any">
      <label>Ymax</label><input type="number" value="${w.yMax}" step="any">
    `;
    windowEditor.querySelectorAll('input').forEach((inp, i) => {
      inp.addEventListener('change', () => {
        Graph.setWindow(getWindowFromEditor());
        redraw();
      });
    });
  }

  function redraw() {
    Graph.render(equations, { angleMode });
  }

  function openModal(modal) {
    if (modal === modalYEquals) buildYEditor();
    if (modal === modalWindow) buildWindowEditor();
    if (modal === modalMode) {
      modeEditor.querySelector(`input[value="${angleMode}"]`)?.click();
    }
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.menu-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const menu = btn.dataset.menu;
      if (menu === 'yequals') openModal(modalYEquals);
      else if (menu === 'window') openModal(modalWindow);
      else if (menu === 'graph') redraw();
      else if (menu === 'mode') openModal(modalMode);
      else if (menu === 'table') {
        buildTable();
        openModal(modalTable);
      }
    });
  });

  document.querySelectorAll('[data-action="close-y"]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(modalYEquals));
  });
  document.querySelectorAll('[data-action="close-window"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      Graph.setWindow(getWindowFromEditor());
      redraw();
      closeModal(modalWindow);
    });
  });
  document.querySelectorAll('[data-action="close-mode"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = modeEditor.querySelector('input[name="angle"]:checked');
      if (r) {
        angleMode = r.value;
        angleModeEl.textContent = angleMode === 'deg' ? 'DEG' : 'RAD';
        redraw();
      }
      closeModal(modalMode);
    });
  });
  document.querySelectorAll('[data-action="close-table"]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(modalTable));
  });

  function buildTable() {
    const w = Graph.getWindow();
    const step = (w.xMax - w.xMin) / 15;
    const rows = [];
    for (let x = w.xMin; x <= w.xMax; x += step) {
      const y1 = equations[0] ? Parser.evaluate(equations[0], x, { angleMode }) : '';
      const y2 = equations[1] ? Parser.evaluate(equations[1], x, { angleMode }) : '';
      const y3 = equations[2] ? Parser.evaluate(equations[2], x, { angleMode }) : '';
      const fmt = (v) => (Number.isFinite(v) ? v.toPrecision(5) : '');
      rows.push(`<tr><td>${x.toPrecision(4)}</td><td>${fmt(y1)}</td><td>${fmt(y2)}</td><td>${fmt(y3)}</td></tr>`);
    }
    tableBody.innerHTML = rows.join('');
  }

  document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('click', () => {
      const k = key.dataset.key;
      if (!k) return;

      if (k === '2nd') {
        secondPressed = true;
        setTimeout(() => (secondPressed = false), 800);
        return;
      }
      if (k === 'clear') {
        updateDisplay('');
        return;
      }
      if (k === 'del') {
        updateDisplay(displayValue.slice(0, -1));
        return;
      }
      if (k === 'enter') {
        const expr = displayValue.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = Parser.evaluate(expr, 0, { angleMode });
        updateDisplay(Number.isFinite(result) ? result : 'Error');
        return;
      }
      if (k === 'yequals') openModal(modalYEquals);
      else if (k === 'window') openModal(modalWindow);
      else if (k === 'graph') redraw();
      else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(k)) {
        appendDisplay(k + '(');
      } else if (k === 'x²') {
        appendDisplay('^2');
      } else if (k === '(-)') {
        appendDisplay('-');
      } else if (k === 'math') {
        appendDisplay('sqrt(');
      } else {
        appendDisplay(k);
      }
    });
  });

  Graph.init(graphCanvas);
  equations[0] = 'x^2';
  redraw();
})();
