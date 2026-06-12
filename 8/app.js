(function () {
  "use strict";

  const refs = {};
  let currentReading = null;
  let currentCasts = null;

  const QUESTION_PROMPTS = {
    general: [
      "這件事接下來三個月的走勢如何？",
      "目前最該先處理哪個阻力？",
      "這個選擇的優缺點是什麼？"
    ],
    career: [
      "這個合作案接下來三個月適合推進嗎？",
      "目前工作上最大的卡點是什麼？",
      "我該先補文件、成果還是關係？"
    ],
    wealth: [
      "這筆收入接下來三個月能否落袋？",
      "這個支出或投資最大的風險在哪？",
      "目前該先開源還是控成本？"
    ],
    relationship: [
      "這段關係目前卡在哪裡？",
      "我和對方下一步怎麼互動較好？",
      "這段關係適合推進還是先觀察？"
    ],
    health: [
      "最近身心狀態需要先注意哪一點？",
      "目前壓力源和復原力各在哪裡？",
      "接下來該先休養、檢查還是調整節奏？"
    ]
  };

  function qs(id) {
    return document.getElementById(id);
  }

  function initRefs() {
    [
      "question",
      "questionPrompts",
      "category",
      "monthBranch",
      "dayGanzhi",
      "castDate",
      "hourBranch",
      "autoTime",
      "timeAutoNote",
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
      "advancedSummary",
      "advancedTable",
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

  function renderTimeInputs() {
    refs.monthBranch.innerHTML = [
      `<option value="">不使用月建</option>`,
      ...JingFang.BRANCHES.map((branch) => `<option value="${branch}">${branch}｜${JingFang.BRANCH_ELEMENTS[branch]}</option>`)
    ].join("");
    refs.dayGanzhi.innerHTML = [
      `<option value="">不使用日辰</option>`,
      ...JingFang.SIXTY_GANZHI.map((ganzhi) => `<option value="${ganzhi}">${ganzhi}</option>`)
    ].join("");
    refs.hourBranch.innerHTML = [
      `<option value="">不使用時辰</option>`,
      ...JingFang.BRANCHES.map((branch) => `<option value="${branch}">${branch}｜${JingFang.BRANCH_ELEMENTS[branch]}</option>`)
    ].join("");
  }

  function renderQuestionPrompts() {
    const prompts = QUESTION_PROMPTS[refs.category.value] || QUESTION_PROMPTS.general;
    refs.questionPrompts.innerHTML = prompts.map((prompt) => `
      <button class="prompt-button" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>
    `).join("");
  }

  function applyQuestionPrompt(event) {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    refs.question.value = button.dataset.prompt;
    if (currentReading) renderReading(currentReading);
  }

  function getTimeContext() {
    return JingFang.buildTimeContext({
      monthBranch: refs.monthBranch.value,
      dayGanzhi: refs.dayGanzhi.value,
      hourBranch: refs.hourBranch.value
    });
  }

  function rerenderForTimeChange() {
    if (currentReading) {
      renderReading(currentReading);
      renderLineTable(currentReading);
      renderAdvancedPanel(currentReading);
    }
  }

  function applyAutoTime() {
    const auto = JingFang.autoTimeContextForDate(new Date());
    refs.castDate.value = auto.autoDate;
    refs.monthBranch.value = auto.monthBranch;
    refs.dayGanzhi.value = auto.dayGanzhi;
    refs.hourBranch.value = auto.hourBranch;
    refs.timeAutoNote.textContent = `已用本機時間 ${auto.autoDate} ${auto.autoClock} 自動填入：月建 ${auto.monthBranch}、日辰 ${auto.dayGanzhi}、時辰 ${auto.hourBranch}。${auto.monthApproximation}`;
    rerenderForTimeChange();
  }

  function datePartsFromInput(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3])
    };
  }

  function applyDateInput() {
    const parts = datePartsFromInput(refs.castDate.value);
    if (!parts) return;
    const monthBranch = JingFang.approximateMonthBranchFromGregorian(parts.month, parts.day);
    const dayGanzhi = JingFang.dayGanzhiFromGregorian(parts.year, parts.month, parts.day);
    refs.monthBranch.value = monthBranch;
    refs.dayGanzhi.value = dayGanzhi;
    refs.timeAutoNote.textContent = `已依指定日期 ${refs.castDate.value} 換算：月建 ${monthBranch}、日辰 ${dayGanzhi}。時辰可手動選；月建在節氣交界請核對。`;
    rerenderForTimeChange();
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

  function toneClass(value) {
    if (value.includes("順勢")) return "tone-good";
    if (value.includes("可用")) return "tone-okay";
    if (value.includes("受阻") || value.includes("守風險")) return "tone-risk";
    if (value.includes("偏弱") || value.includes("穩後動")) return "tone-caution";
    return "tone-neutral";
  }

  function meterWidth(score) {
    return `${Math.round(((Math.max(-3, Math.min(3, score)) + 3) / 6) * 100)}%`;
  }

  function shortText(value, limit = 72) {
    const text = String(value || "");
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  }

  function renderJudgementOverview(reading, timeContext) {
    const category = refs.category.value;
    const judgement = JingFang.buildJudgementModel(reading, category, timeContext);
    const summary = JingFang.buildInterpretation(reading, {
      question: refs.question.value,
      category,
      timeContext
    }).find((section) => section.title === "總結");
    const strengths = judgement.strengths.length ? judgement.strengths.map((item) => item.label).join("、") : "暫無明顯順勢點";
    const risks = judgement.risks.length ? judgement.risks.map((item) => item.label).join("、") : "暫無明顯受阻點";
    return `
      <section class="reading-overview">
        <div class="overview-head">
          <div class="overview-copy">
            <p class="label">一眼看</p>
            <h3>${escapeHtml(judgement.tone)}</h3>
            <p>${escapeHtml(summary ? shortText(summary.items[0], 118) : "先看整體判斷，再展開各向度。")}</p>
          </div>
          <div class="overview-seal ${toneClass(judgement.tone)}">
            <span>${escapeHtml(judgement.categoryName)}</span>
            <strong>${escapeHtml(judgement.tone)}</strong>
          </div>
        </div>

        <div class="insight-strip">
          <div>
            <b>可先借力</b>
            <span>${escapeHtml(strengths)}</span>
          </div>
          <div>
            <b>優先留意</b>
            <span>${escapeHtml(risks)}</span>
          </div>
        </div>

        <div class="dimension-grid">
          ${judgement.dimensions.map((dimension, index) => `
            <details class="dimension-card ${toneClass(dimension.status)}">
              <summary>
                <span class="dimension-rank">${index + 1}</span>
                <span class="dimension-main">
                  <b>${escapeHtml(dimension.label)}</b>
                  <small>${escapeHtml(dimension.status)}</small>
                </span>
                <span class="dimension-meter" aria-hidden="true"><i style="width: ${meterWidth(dimension.score)}"></i></span>
              </summary>
              <p>${escapeHtml(dimension.summary)}</p>
              <p><b>作法</b>${escapeHtml(dimension.advice)}</p>
            </details>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderReading(reading) {
    const timeContext = getTimeContext();
    const sections = JingFang.buildInterpretation(reading, {
      question: refs.question.value,
      category: refs.category.value,
      timeContext
    });
    const summarySections = sections.filter((section) => section.title === "總結");
    const detailSections = sections.filter((section) => !["總結", "重點判斷", "向度解釋"].includes(section.title));
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

    const summaryHtml = (section) => `
      <section class="reading-block${section.title === "總結" ? " summary-block" : ""}">
        <h3>${escapeHtml(section.title)}</h3>
        ${section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </section>
    `;

    const detailHtml = (section) => `
      <details class="reading-block detail-block">
        <summary>
          <span>${escapeHtml(section.title)}</span>
          <small>${escapeHtml(shortText(section.items[0], 48))}</small>
        </summary>
        ${section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </details>
    `;

    refs.readingContent.innerHTML = [
      renderJudgementOverview(reading, timeContext),
      ...summarySections.map(summaryHtml),
      castHtml,
      `<section class="detail-list">${detailSections.map(detailHtml).join("")}</section>`
    ].join("");
  }

  function renderLineTable(reading) {
    const annotations = JingFang.annotateTime(reading, getTimeContext());
    refs.lineTable.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => {
      const line = reading.lineDetails[index];
      const time = annotations[index];
      const value = line.value;
      const role = line.role.length ? line.role.join("、") : "-";
      return `
        <tr class="${line.moving ? "is-moving" : ""}">
          <td>${line.label}</td>
          <td>${lineGraphic(line.bit, line.moving)}<span>${value.value} ${value.label}</span></td>
          <td>${line.najia.text}</td>
          <td>${line.element}</td>
          <td><b>${line.relative}</b><small>${line.alias}｜${line.meaning}</small></td>
          <td>${time.spirit ? `<b>${time.spirit}</b><small>${time.spiritMeaning}</small>` : "-"}</td>
          <td>${time.notes.length ? `<b>${time.strength}</b><small>${time.notes.join("、")}</small>` : `<b>${time.strength}</b><small>${time.strengthMeaning}</small>`}</td>
          <td>${role}</td>
        </tr>
      `;
    }).join("");
  }

  function renderAdvancedPanel(reading) {
    const timeContext = getTimeContext();
    const annotations = JingFang.annotateTime(reading, timeContext);
    refs.advancedSummary.innerHTML = `
      <div>
        <b>月建</b>
        <span>${timeContext.monthBranch ? `${timeContext.monthBranch}｜${timeContext.monthElement}` : "未填"}</span>
      </div>
      <div>
        <b>日辰</b>
        <span>${timeContext.dayGanzhi ? `${timeContext.dayGanzhi}｜空亡 ${timeContext.voidBranches.join("、")}` : "未填"}</span>
      </div>
      <div>
        <b>時辰</b>
        <span>${timeContext.hourBranch ? `${timeContext.hourBranch}｜${timeContext.hourElement}` : "未填"}</span>
      </div>
      <div>
        <b>說明</b>
        <span>${timeContext.enabled ? "已納入時空旺衰、時辰觸發、沖合、空亡、六神。" : "填入月建、日辰或時辰後啟用進階判讀。"}</span>
      </div>
    `;

    refs.advancedTable.innerHTML = [5, 4, 3, 2, 1, 0].map((index) => {
      const item = annotations[index];
      const line = item.line;
      const monthText = item.month ? `${item.month.notes.join("、") || "平"}｜${item.month.sourceBranch}${item.month.sourceElement}` : "-";
      const dayText = item.day ? `${item.day.notes.join("、") || "平"}｜${item.day.sourceBranch}${item.day.sourceElement}` : "-";
      const hourText = item.hour ? `${item.hour.notes.join("、") || "平"}｜${item.hour.sourceBranch}${item.hour.sourceElement}` : "-";
      return `
        <tr class="${item.isVoid ? "is-empty" : ""}">
          <td>${line.label}</td>
          <td><b>${line.relative}</b><small>${line.najia.text}｜${line.element}</small></td>
          <td>${monthText}</td>
          <td>${dayText}</td>
          <td>${hourText}</td>
          <td>${item.isVoid ? "空亡" : "-"}</td>
          <td><b>${item.strength}</b><small>${item.strengthMeaning}</small></td>
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
    renderAdvancedPanel(reading);
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
    refs.questionPrompts.addEventListener("click", applyQuestionPrompt);
    refs.cast.addEventListener("click", castAndRender);
    refs.readManual.addEventListener("click", readManualAndRender);
    refs.category.addEventListener("change", () => {
      renderQuestionPrompts();
      if (currentReading) {
        renderReading(currentReading);
        renderLineTable(currentReading);
        renderAdvancedPanel(currentReading);
        renderHiddenPanel(currentReading);
      }
    });
    refs.question.addEventListener("input", () => {
      if (currentReading) renderReading(currentReading);
    });
    [refs.monthBranch, refs.dayGanzhi, refs.hourBranch].forEach((select) => {
      select.addEventListener("change", () => {
        refs.timeAutoNote.textContent = "已手動調整進階時空；若剛好在節氣交界，請以萬年曆校正月建。";
        rerenderForTimeChange();
      });
    });
    refs.castDate.addEventListener("change", applyDateInput);
    refs.autoTime.addEventListener("click", applyAutoTime);

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
    renderTimeInputs();
    renderQuestionPrompts();
    bindEvents();
    setManualValues([7, 8, 7, 8, 7, 8]);
    readManualAndRender();
  });
})();
