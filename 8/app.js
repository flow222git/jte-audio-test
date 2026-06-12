(function () {
  "use strict";

  const refs = {};
  let currentReading = null;
  let currentCasts = null;

  function qs(id) {
    return document.getElementById(id);
  }

  function initRefs() {
    [
      "question",
      "category",
      "cast",
      "readManual",
      "manualLines",
      "mainHexStack",
      "mainHexName",
      "mainHexMeta",
      "changedSymbol",
      "changedHexName",
      "changedHexMeta",
      "palaceName",
      "palaceMeta",
      "worldResponse",
      "movingMeta",
      "readingContent",
      "lineTable",
      "hiddenSummary",
      "hiddenTable",
      "palaceTable",
      "modelContent"
    ].forEach((id) => {
      refs[id] = qs(id);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderManualInputs() {
    const options = Object.values(JingFang.LINE_VALUES)
      .map((line) => `<option value="${line.value}">${line.value} ${line.label}</option>`)
      .join("");
    refs.manualLines.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => `
      <label class="line-input">
        <span>${JingFang.LINE_LABELS[index]}</span>
        <select data-line-index="${index}">${options}</select>
      </label>
    `).join("");
  }

  function getManualValues() {
    const values = Array(6).fill(7);
    refs.manualLines.querySelectorAll("select").forEach((select) => {
      values[Number(select.dataset.lineIndex)] = Number(select.value);
    });
    return values;
  }

  function setManualValues(values) {
    refs.manualLines.querySelectorAll("select").forEach((select) => {
      select.value = String(values[Number(select.dataset.lineIndex)]);
    });
  }

  function lineGraphic(bit, moving) {
    const classes = ["yao-line", bit ? "yang" : "yin"];
    if (moving) classes.push("moving");
    return `
      <span class="${classes.join(" ")}" aria-label="${bit ? "陽爻" : "陰爻"}">
        <i></i><i></i>
      </span>
    `;
  }

  function renderHexStack(reading) {
    const movingSet = new Set(reading.movingIndexes);
    refs.mainHexStack.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => {
      return `<div class="stack-row">${lineGraphic(reading.lines[index], movingSet.has(index))}</div>`;
    }).join("");
  }

  function renderSummary(reading) {
    const hex = reading.hexagram;
    const changed = reading.changedHexagram;
    const movingLabels = reading.movingIndexes.map((index) => JingFang.LINE_LABELS[index]);

    renderHexStack(reading);
    refs.mainHexName.textContent = `${hex.symbol} ${hex.fullName}`;
    refs.mainHexMeta.textContent = `第 ${hex.number} 卦｜${hex.upper}${JingFang.TRIGRAMS[hex.upper].symbol} / ${hex.lower}${JingFang.TRIGRAMS[hex.lower].symbol}`;
    refs.changedSymbol.textContent = changed.symbol;
    refs.changedHexName.textContent = changed.fullName;
    refs.changedHexMeta.textContent = `第 ${changed.number} 卦｜${reading.changedPalace.palace}宮 ${reading.changedPalace.generation}`;
    refs.palaceName.textContent = `${reading.palace.palace}宮 ${reading.palace.generation}`;
    refs.palaceMeta.textContent = `五行 ${reading.palace.palaceElement}｜變入${reading.changedPalace.palace}宮`;
    refs.worldResponse.textContent = `世${reading.palace.worldLine} / 應${reading.palace.responseLine}`;
    refs.movingMeta.textContent = movingLabels.length ? `動爻：${movingLabels.join("、")}` : "無動爻";
  }

  function renderReading(reading) {
    const sections = JingFang.buildInterpretation(reading, {
      question: refs.question.value,
      category: refs.category.value
    });
    const summarySections = sections.filter((section) => section.title === "總結");
    const normalSections = sections.filter((section) => section.title !== "總結");
    const castHtml = currentCasts ? `
      <section class="reading-block cast-block">
        <h3>三錢</h3>
        <div class="coin-grid">
          ${currentCasts.map((cast, index) => `
            <span><b>${JingFang.LINE_LABELS[index]}</b>${JingFang.coinText(cast.coins)}｜${cast.value}</span>
          `).join("")}
        </div>
      </section>
    ` : "";

    const sectionHtml = (section) => `
      <section class="reading-block${section.title === "總結" ? " summary-block" : ""}">
        <h3>${escapeHtml(section.title)}</h3>
        ${section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </section>
    `;

    refs.readingContent.innerHTML = normalSections.map(sectionHtml).join("") + castHtml + summarySections.map(sectionHtml).join("");
  }

  function renderLineTable(reading) {
    refs.lineTable.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => {
      const line = reading.lineDetails[index];
      const value = line.value;
      const role = line.role.length ? line.role.join("、") : "-";
      return `
        <tr class="${line.moving ? "is-moving" : ""}">
          <td>${line.label}</td>
          <td>${lineGraphic(line.bit, line.moving)}<span>${value.value} ${value.label}</span></td>
          <td>${line.najia.text}</td>
          <td>${line.element}</td>
          <td><b>${line.relative}</b><small>${line.alias}｜${line.meaning}</small></td>
          <td>${role}</td>
        </tr>
      `;
    }).join("");
  }

  function hiddenLineText(line) {
    return `${line.najia.text}${line.relative}`;
  }

  function relativePlainLabel(relative) {
    const plain = JingFang.RELATIVE_PLAIN[relative] || JingFang.RELATIVE_MEANINGS[relative] || relative;
    return `${relative}（${plain}）`;
  }

  function renderHiddenPanel(reading) {
    const category = refs.category.value;
    const findings = JingFang.hiddenFindings(reading, category);
    const absent = findings.filter((finding) => finding.absent);
    const focus = JingFang.focusRelatives(category);
    refs.hiddenSummary.innerHTML = `
      <div>
        <b>用神焦點</b>
        <span>${focus.map(relativePlainLabel).join("、")}</span>
      </div>
      <div>
        <b>缺位</b>
        <span>${absent.length ? absent.map((finding) => relativePlainLabel(finding.relative)).join("、") : "無"}</span>
      </div>
      <div>
        <b>伏神底盤</b>
        <span>${reading.palace.palace}宮本宮卦</span>
      </div>
    `;

    refs.hiddenTable.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => {
      const row = reading.hiddenDetails[index];
      return `
        <tr>
          <td>${row.label}</td>
          <td><b>${hiddenLineText(row.flying)}</b><small>${row.flying.element}｜${row.flying.meaning}</small></td>
          <td><b>${hiddenLineText(row.palace)}</b><small>${row.palace.hexagram.fullName}</small></td>
          <td><b>${row.palace.flyHiddenLabel}</b><small>${row.palace.flyHiddenMeaning}</small></td>
          <td><b>${hiddenLineText(row.opposite)}</b><small>${row.opposite.hexagram.fullName}</small></td>
        </tr>
      `;
    }).join("");
  }

  function renderPalaceTable(reading) {
    refs.palaceTable.innerHTML = JingFang.PALACE_TABLE.map((group) => `
      <section class="palace-group">
        <h3>${group.palace}宮 <span>${group.element}</span></h3>
        <div class="palace-row">
          ${group.entries.map((entry) => {
            const active = entry.hexagram.number === reading.hexagram.number ? " active" : "";
            return `
              <article class="palace-cell${active}">
                <span>${entry.generation}</span>
                <strong>${entry.hexagram.symbol} ${entry.hexagram.fullName}</strong>
                <small>世${entry.worldLine} 應${entry.responseLine}</small>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");
  }

  function renderModelContent() {
    refs.modelContent.innerHTML = JingFang.MODEL_SECTIONS.map((section) => `
      <article class="model-card">
        <h3>${escapeHtml(section.title)}</h3>
        <p>${escapeHtml(section.text)}</p>
      </article>
    `).join("");
  }

  function renderAll(reading) {
    currentReading = reading;
    renderSummary(reading);
    renderReading(reading);
    renderLineTable(reading);
    renderHiddenPanel(reading);
    renderPalaceTable(reading);
    renderModelContent();
  }

  function castAndRender() {
    currentCasts = JingFang.castCoins();
    const values = currentCasts.map((cast) => cast.value);
    setManualValues(values);
    renderAll(JingFang.analyze(values));
  }

  function readManualAndRender() {
    currentCasts = null;
    renderAll(JingFang.analyze(getManualValues()));
  }

  function bindEvents() {
    refs.cast.addEventListener("click", castAndRender);
    refs.readManual.addEventListener("click", readManualAndRender);
    refs.category.addEventListener("change", () => {
      if (currentReading) {
        renderReading(currentReading);
        renderHiddenPanel(currentReading);
      }
    });
    refs.question.addEventListener("input", () => {
      if (currentReading) renderReading(currentReading);
    });

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
        tab.classList.add("active");
        qs(`${tab.dataset.tab}Tab`).classList.add("active");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initRefs();
    renderManualInputs();
    bindEvents();
    setManualValues([7, 8, 7, 8, 7, 8]);
    readManualAndRender();
  });
})();
