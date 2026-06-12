(function (global) {
  "use strict";

  const TRIGRAMS = {
    "乾": { name: "乾", symbol: "☰", image: "天", element: "金", lines: [1, 1, 1], nature: "剛健、主動、開創" },
    "兌": { name: "兌", symbol: "☱", image: "澤", element: "金", lines: [1, 1, 0], nature: "悅納、交流、取捨" },
    "離": { name: "離", symbol: "☲", image: "火", element: "火", lines: [1, 0, 1], nature: "明辨、依附、顯現" },
    "震": { name: "震", symbol: "☳", image: "雷", element: "木", lines: [1, 0, 0], nature: "啟動、驚醒、行動" },
    "巽": { name: "巽", symbol: "☴", image: "風", element: "木", lines: [0, 1, 1], nature: "滲入、協調、漸進" },
    "坎": { name: "坎", symbol: "☵", image: "水", element: "水", lines: [0, 1, 0], nature: "險阻、流動、智謀" },
    "艮": { name: "艮", symbol: "☶", image: "山", element: "土", lines: [0, 0, 1], nature: "止定、界線、蓄養" },
    "坤": { name: "坤", symbol: "☷", image: "地", element: "土", lines: [0, 0, 0], nature: "承載、順勢、成全" }
  };

  const HEXAGRAMS = [
    { n: 1, name: "乾", upper: "乾", lower: "乾", theme: "剛健開端，氣勢完整", counsel: "適合立志、主動推進；但剛過則折，需保留彈性。" },
    { n: 2, name: "坤", upper: "坤", lower: "坤", theme: "承載順勢，厚積成事", counsel: "先接住現實條件，重視配合與耐心；不宜急於爭先。" },
    { n: 3, name: "屯", upper: "坎", lower: "震", theme: "初生多阻，動中遇險", counsel: "事情剛開始不順是常態，先整隊、找資源、定節奏。" },
    { n: 4, name: "蒙", upper: "艮", lower: "坎", theme: "未明待啟，先學後行", counsel: "資訊不足時不宜硬闖，請教、驗證、補課會比逞強有效。" },
    { n: 5, name: "需", upper: "坎", lower: "乾", theme: "有實力而待時", counsel: "已具備條件，但外部仍有險；守住準備，等窗口成熟。" },
    { n: 6, name: "訟", upper: "乾", lower: "坎", theme: "內險外剛，易起爭執", counsel: "先釐清規則與證據，避免情緒升級；可談判則不硬碰。" },
    { n: 7, name: "師", upper: "坤", lower: "坎", theme: "聚眾行險，紀律為先", counsel: "需要組織、分工與權責，領導者須穩，隊伍才不亂。" },
    { n: 8, name: "比", upper: "坎", lower: "坤", theme: "親比結盟，擇善相從", counsel: "尋找可靠同盟，也檢查自己是否值得被信任。" },
    { n: 9, name: "小畜", upper: "巽", lower: "乾", theme: "小有積蓄，未能大行", counsel: "先累積細節、文件、關係與資源；大動作可稍候。" },
    { n: 10, name: "履", upper: "乾", lower: "兌", theme: "柔悅履剛，行事有禮", counsel: "面對強勢環境，靠分寸、禮節與步伐避開風險。" },
    { n: 11, name: "泰", upper: "坤", lower: "乾", theme: "天地交通，小往大來", counsel: "上下能通、內外相應，宜把握順局並維持謙和。" },
    { n: 12, name: "否", upper: "乾", lower: "坤", theme: "天地不交，閉塞不通", counsel: "先保全核心，不必勉強推進；等待結構鬆動再行動。" },
    { n: 13, name: "同人", upper: "乾", lower: "離", theme: "明而同道，公心結眾", counsel: "以共同目標凝聚人，透明與公平能放大力量。" },
    { n: 14, name: "大有", upper: "離", lower: "乾", theme: "光明在上，大有所得", counsel: "資源與能見度俱足，適合公開推進，但要避免炫耀。" },
    { n: 15, name: "謙", upper: "坤", lower: "艮", theme: "止於內而順於外", counsel: "以低姿態穩住位置，退一步反而能保存長久優勢。" },
    { n: 16, name: "豫", upper: "震", lower: "坤", theme: "順勢而動，喜悅成行", counsel: "氣氛可用，但要把熱情落成計畫，避免只有聲勢。" },
    { n: 17, name: "隨", upper: "兌", lower: "震", theme: "動而相隨，順勢轉向", counsel: "跟隨值得跟的人與趨勢；若方向錯，越快轉身越好。" },
    { n: 18, name: "蠱", upper: "艮", lower: "巽", theme: "積弊待治，腐敗需修", counsel: "舊問題已成形，宜清理根源、修制度，不只補表面。" },
    { n: 19, name: "臨", upper: "坤", lower: "兌", theme: "上臨下悅，機會接近", counsel: "主動靠近資源或人群，把握增長期，也要防盛極轉衰。" },
    { n: 20, name: "觀", upper: "巽", lower: "坤", theme: "風行地上，觀察成勢", counsel: "先看全局、看人心、看長線；以示範勝過強推。" },
    { n: 21, name: "噬嗑", upper: "離", lower: "震", theme: "雷火相合，咬斷阻隔", counsel: "有障礙要處理，宜明確規則、決斷執行。" },
    { n: 22, name: "賁", upper: "艮", lower: "離", theme: "文飾有度，內明外止", counsel: "包裝能加分，但本質不能空；適合整理形象與呈現。" },
    { n: 23, name: "剝", upper: "艮", lower: "坤", theme: "陰盛剝陽，根基被削", counsel: "不宜硬撐，先止損、去負擔，守住最後的核心。" },
    { n: 24, name: "復", upper: "坤", lower: "震", theme: "一陽來復，轉機初萌", counsel: "重新開始的信號已出現，小步恢復，勿急著放大。" },
    { n: 25, name: "無妄", upper: "乾", lower: "震", theme: "動合天理，不可妄為", counsel: "保持真實與正當，臨時起意或投機會帶來反噬。" },
    { n: 26, name: "大畜", upper: "艮", lower: "乾", theme: "大蓄其力，止而能養", counsel: "先蓄才、蓄財、蓄勢；被暫停不一定是壞事。" },
    { n: 27, name: "頤", upper: "艮", lower: "震", theme: "養正入口，言食相關", counsel: "看你吃進什麼、說出什麼；資源與表達都要有節制。" },
    { n: 28, name: "大過", upper: "兌", lower: "巽", theme: "棟橈之象，壓力過重", counsel: "責任或槓桿過大，需調整結構，找支點分擔。" },
    { n: 29, name: "坎", upper: "坎", lower: "坎", theme: "重險相疊，習險成智", counsel: "不能逃避風險時，就把流程、備案與心理韌性做好。" },
    { n: 30, name: "離", upper: "離", lower: "離", theme: "明麗相續，附著而行", counsel: "靠清晰、證據與可見度取勝；也要找穩定依托。" },
    { n: 31, name: "咸", upper: "兌", lower: "艮", theme: "山澤感應，互相牽動", counsel: "關係與感受是關鍵，真誠回應比單向施力有效。" },
    { n: 32, name: "恆", upper: "震", lower: "巽", theme: "雷風相與，持久有常", counsel: "建立可持續節奏，短期波動不必動搖長期原則。" },
    { n: 33, name: "遯", upper: "乾", lower: "艮", theme: "退避保身，止而後全", counsel: "退不是敗，是保存主動權；不宜戀戰。" },
    { n: 34, name: "大壯", upper: "震", lower: "乾", theme: "陽剛壯盛，勢不可輕", counsel: "力量很足，更要守正與節制；不要用力過猛。" },
    { n: 35, name: "晉", upper: "離", lower: "坤", theme: "明出地上，進展可見", counsel: "適合曝光、升遷、提案；讓成果被看見。" },
    { n: 36, name: "明夷", upper: "坤", lower: "離", theme: "明入地中，光受其傷", counsel: "收斂鋒芒，保護核心判斷；暗處行事更穩。" },
    { n: 37, name: "家人", upper: "巽", lower: "離", theme: "內明外順，家道有序", counsel: "制度、角色、溝通要清楚；先理內部，再談外擴。" },
    { n: 38, name: "睽", upper: "離", lower: "兌", theme: "火澤相違，異中求同", counsel: "立場不同不必急著合併，先找到可合作的小處。" },
    { n: 39, name: "蹇", upper: "坎", lower: "艮", theme: "山前有水，進退艱難", counsel: "遇阻先停，找援手與替代路線；硬闖代價高。" },
    { n: 40, name: "解", upper: "震", lower: "坎", theme: "雷雨作解，困局鬆開", counsel: "把握釋放壓力的時機，快速處理積欠問題。" },
    { n: 41, name: "損", upper: "艮", lower: "兌", theme: "減損有度，去多取精", counsel: "主動削減消耗，集中資源；少即是進。" },
    { n: 42, name: "益", upper: "巽", lower: "震", theme: "風雷相益，增長互助", counsel: "適合投資能力、擴散影響；利他能回到自身。" },
    { n: 43, name: "夬", upper: "兌", lower: "乾", theme: "澤上於天，決斷宣告", counsel: "需要明確表態與切割，但語氣要穩，勿變成衝突。" },
    { n: 44, name: "姤", upper: "乾", lower: "巽", theme: "柔遇剛，偶遇成機", counsel: "突發接觸帶來機會，也可能帶來誘惑；先辨其質。" },
    { n: 45, name: "萃", upper: "兌", lower: "坤", theme: "澤聚於地，群眾會聚", counsel: "人與資源正在集中，適合會盟、募集、整合。" },
    { n: 46, name: "升", upper: "坤", lower: "巽", theme: "木升於地，漸進上達", counsel: "靠累積與順勢上升，不必求一步登天。" },
    { n: 47, name: "困", upper: "兌", lower: "坎", theme: "澤無水，言困力乏", counsel: "資源受限，少說大話，先解燃眉與補能量。" },
    { n: 48, name: "井", upper: "坎", lower: "巽", theme: "木入水下，井養眾人", counsel: "回到基礎設施與長期供給；修井比換井重要。" },
    { n: 49, name: "革", upper: "兌", lower: "離", theme: "澤火相息，變革除舊", counsel: "時機成熟才革，先取得共識與正當性。" },
    { n: 50, name: "鼎", upper: "離", lower: "巽", theme: "木火烹鼎，化材成器", counsel: "把資源轉化成成果，重視流程、品質與承接者。" },
    { n: 51, name: "震", upper: "震", lower: "震", theme: "震動驚醒，恐懼後行", counsel: "突發變化逼人醒來，先穩住反應，再轉為行動。" },
    { n: 52, name: "艮", upper: "艮", lower: "艮", theme: "止於其所，界線清楚", counsel: "該停就停，該守就守；靜止能讓判斷回來。" },
    { n: 53, name: "漸", upper: "巽", lower: "艮", theme: "山上有木，循序漸進", counsel: "按階段推進，重視名分、程序與信任累積。" },
    { n: 54, name: "歸妹", upper: "震", lower: "兌", theme: "悅而動，位分未正", counsel: "情勢吸引人，但條件未穩；先看角色是否合宜。" },
    { n: 55, name: "豐", upper: "震", lower: "離", theme: "雷電皆至，盛大明動", counsel: "高峰期要快速配置資源；盛極也要預留退路。" },
    { n: 56, name: "旅", upper: "離", lower: "艮", theme: "山上有火，客旅不安", counsel: "身處過渡或外地，宜低調、守規矩、少依賴僥倖。" },
    { n: 57, name: "巽", upper: "巽", lower: "巽", theme: "風入再入，柔順滲透", counsel: "用溝通、迂迴與細節取勝；忌搖擺無主。" },
    { n: 58, name: "兌", upper: "兌", lower: "兌", theme: "悅澤相重，交流互惠", counsel: "談判、合作、表達有利；也要防口舌與過度取悅。" },
    { n: 59, name: "渙", upper: "巽", lower: "坎", theme: "風行水上，離散可解", counsel: "先散壓力、散恐懼，再重新聚合共識。" },
    { n: 60, name: "節", upper: "坎", lower: "兌", theme: "澤上有水，節制成度", counsel: "限制不是壞事，清楚邊界能保存長期收益。" },
    { n: 61, name: "中孚", upper: "巽", lower: "兌", theme: "內悅外入，誠信感通", counsel: "以真誠與一致性建立信任；少技巧，多可信。" },
    { n: 62, name: "小過", upper: "震", lower: "艮", theme: "雷過山上，小事可過", counsel: "小處可彈性，大事不宜冒進；低飛勝過高舉。" },
    { n: 63, name: "既濟", upper: "坎", lower: "離", theme: "水火既交，事成未安", counsel: "已成之局仍需維護，防最後一哩出錯。" },
    { n: 64, name: "未濟", upper: "離", lower: "坎", theme: "火水未交，將成未成", counsel: "還差關鍵整合，保持清醒與耐心，別在終點前鬆手。" }
  ];

  const LINE_VALUES = {
    6: { value: 6, label: "老陰", bit: 0, changedBit: 1, moving: true, mark: "動陰" },
    7: { value: 7, label: "少陽", bit: 1, changedBit: 1, moving: false, mark: "靜陽" },
    8: { value: 8, label: "少陰", bit: 0, changedBit: 0, moving: false, mark: "靜陰" },
    9: { value: 9, label: "老陽", bit: 1, changedBit: 0, moving: true, mark: "動陽" }
  };

  const LINE_LABELS = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  const GENERATION_LABELS = ["本宮", "一世", "二世", "三世", "四世", "五世", "游魂", "歸魂"];
  const PALACE_ORDER = ["乾", "震", "坎", "艮", "坤", "巽", "離", "兌"];
  const PALACE_MASKS = [
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0]
  ];
  const WORLD_LINES = [6, 1, 2, 3, 4, 5, 4, 3];

  const NAJIA = {
    "乾": { innerStem: "甲", outerStem: "壬", inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
    "坤": { innerStem: "乙", outerStem: "癸", inner: ["未", "巳", "卯"], outer: ["丑", "亥", "酉"] },
    "震": { innerStem: "庚", outerStem: "庚", inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
    "巽": { innerStem: "辛", outerStem: "辛", inner: ["丑", "亥", "酉"], outer: ["未", "巳", "卯"] },
    "坎": { innerStem: "戊", outerStem: "戊", inner: ["寅", "辰", "午"], outer: ["申", "戌", "子"] },
    "離": { innerStem: "己", outerStem: "己", inner: ["卯", "丑", "亥"], outer: ["酉", "未", "巳"] },
    "艮": { innerStem: "丙", outerStem: "丙", inner: ["辰", "午", "申"], outer: ["戌", "子", "寅"] },
    "兌": { innerStem: "丁", outerStem: "丁", inner: ["巳", "卯", "丑"], outer: ["亥", "酉", "未"] }
  };

  const BRANCH_ELEMENTS = {
    "寅": "木", "卯": "木",
    "巳": "火", "午": "火",
    "辰": "土", "戌": "土", "丑": "土", "未": "土",
    "申": "金", "酉": "金",
    "亥": "水", "子": "水"
  };

  const RELATIVE_MEANINGS = {
    "兄弟": "同類、競爭、朋友、分財",
    "子孫": "成果、放鬆、創造、解厄",
    "妻財": "資源、金錢、伴侶、可掌握之物",
    "官鬼": "壓力、責任、規則、疾病或職位",
    "父母": "文書、長輩、保護、房產與知識"
  };

  const RELATIVE_PLAIN = {
    "兄弟": "同伴、競爭者、分錢的人",
    "子孫": "成果、作品、舒緩壓力的力量",
    "妻財": "錢、資源、可掌握的東西",
    "官鬼": "壓力、責任、風險、規則",
    "父母": "文件、長輩、制度、保護"
  };

  const RELATIVE_ALIASES = {
    "父母": "義爻",
    "子孫": "福德、寶爻",
    "妻財": "制爻",
    "官鬼": "系爻",
    "兄弟": "同氣、專爻"
  };

  const CATEGORY_FOCUS = {
    general: ["官鬼", "妻財", "父母", "子孫", "兄弟"],
    career: ["官鬼", "父母", "子孫"],
    wealth: ["妻財", "子孫", "兄弟"],
    relationship: ["妻財", "官鬼"],
    health: ["官鬼", "子孫", "父母"]
  };

  const CATEGORY_NAMES = {
    general: "整體",
    career: "事業",
    wealth: "財務",
    relationship: "感情",
    health: "健康"
  };

  const CATEGORY_HINTS = {
    general: "白話說，先看三個位置：世爻是你自己；應爻是對方、外部環境或事情的另一邊；動爻是正在變化、最需要注意的地方。",
    career: "問事業時，官鬼多半代表職責、職位、壓力和規則；父母代表合約、文件、制度；子孫代表成果和輸出。",
    wealth: "問財務時，妻財就是錢、資源和可掌握的利益；兄弟常代表競爭、分利或花費；子孫代表能帶來收入的成果。",
    relationship: "問感情時，先看你自己和對方能不能互相承接，再看妻財、官鬼和動爻。若世應相剋，通常表示相處方式比心意更需要調整。",
    health: "問健康時，官鬼多半代表壓力、病象或風險；子孫代表舒緩與復原；父母代表保護、照護與制度性安排。"
  };

  const GENERATION_MEANINGS = {
    "本宮": "本宮卦氣純正，主題直接，事情多從根本性格發出。",
    "一世": "一世動於初，事情剛起，根基、第一步與起心動念最要緊。",
    "二世": "二世動於二，焦點落在配合、位置與日常執行。",
    "三世": "三世動於三，內部已到轉折，進退判斷會影響後勢。",
    "四世": "四世動於四，力量轉向外部，需看環境、制度與對方反應。",
    "五世": "五世動於五，事情進到核心位置，決策者與主軸最關鍵。",
    "游魂": "游魂主離本位、向外飄移，常見變動、奔走、心意不定或局勢外移。",
    "歸魂": "歸魂主回返本位，常見收束、回頭、復盤、落回原問題。"
  };

  const MODEL_SECTIONS = [
    {
      title: "八宮",
      text: "六十四卦不按上下經排列，而以八純卦為宗主，分成乾、震、坎、艮、坤、巽、離、兌八宮。"
    },
    {
      title: "納甲",
      text: "每一爻裝入天干地支，使卦象帶有時間、方位與五行屬性。"
    },
    {
      title: "六親",
      text: "以本宮五行為我，推得父母、子孫、妻財、官鬼、兄弟，作為解事的用神語言。"
    },
    {
      title: "飛伏",
      text: "卦面可見者為飛爻；用神不現時，回到本宮純卦同位爻尋伏神，另以對宮伏象觀察陰陽背面。"
    }
  ];

  const ELEMENTS = ["木", "火", "土", "金", "水"];
  const GENERATES = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
  const CONTROLS = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };

  function keyOfLines(lines) {
    return lines.join("");
  }

  function trigramByLines(lines) {
    const key = keyOfLines(lines);
    return Object.values(TRIGRAMS).find((trigram) => keyOfLines(trigram.lines) === key);
  }

  function makeFullName(hexagram) {
    const upper = TRIGRAMS[hexagram.upper];
    const lower = TRIGRAMS[hexagram.lower];
    if (hexagram.upper === hexagram.lower && hexagram.name === hexagram.upper) {
      return `${hexagram.name}為${upper.image}`;
    }
    return `${upper.image}${lower.image}${hexagram.name}`;
  }

  function enrichHexagrams() {
    return HEXAGRAMS.map((hexagram) => {
      const lowerLines = TRIGRAMS[hexagram.lower].lines;
      const upperLines = TRIGRAMS[hexagram.upper].lines;
      const lines = lowerLines.concat(upperLines);
      return {
        ...hexagram,
        number: hexagram.n,
        lines,
        lineKey: keyOfLines(lines),
        fullName: makeFullName(hexagram),
        symbol: String.fromCodePoint(0x4dbf + hexagram.n)
      };
    });
  }

  const ALL_HEXAGRAMS = enrichHexagrams();
  const HEX_BY_KEY = Object.fromEntries(ALL_HEXAGRAMS.map((hexagram) => [hexagram.lineKey, hexagram]));
  const HEX_BY_NUMBER = Object.fromEntries(ALL_HEXAGRAMS.map((hexagram) => [hexagram.number, hexagram]));

  function applyMask(lines, mask) {
    return lines.map((line, index) => (mask[index] ? Number(!line) : line));
  }

  function buildPalaceData() {
    const byKey = {};
    const table = [];
    PALACE_ORDER.forEach((palaceName) => {
      const pureLines = TRIGRAMS[palaceName].lines.concat(TRIGRAMS[palaceName].lines);
      const entries = PALACE_MASKS.map((mask, index) => {
        const lines = applyMask(pureLines, mask);
        const hexagram = HEX_BY_KEY[keyOfLines(lines)];
        const worldLine = WORLD_LINES[index];
        const responseLine = ((worldLine + 2) % 6) + 1;
        const entry = {
          palace: palaceName,
          palaceElement: TRIGRAMS[palaceName].element,
          generation: GENERATION_LABELS[index],
          generationIndex: index,
          worldLine,
          responseLine,
          hexagram
        };
        byKey[hexagram.lineKey] = entry;
        return entry;
      });
      table.push({ palace: palaceName, element: TRIGRAMS[palaceName].element, entries });
    });
    return { byKey, table };
  }

  const PALACE_DATA = buildPalaceData();

  function palaceRootEntry(palaceName) {
    const palace = PALACE_DATA.table.find((group) => group.palace === palaceName);
    return palace.entries[0];
  }

  function relationBetween(source, target) {
    if (source === target) return "same";
    if (GENERATES[source] === target) return "generates";
    if (GENERATES[target] === source) return "generatedBy";
    if (CONTROLS[source] === target) return "controls";
    if (CONTROLS[target] === source) return "controlledBy";
    return "neutral";
  }

  function relationLabel(source, target) {
    const relation = relationBetween(source, target);
    const labels = {
      same: "同氣",
      generates: "生",
      generatedBy: "受生",
      controls: "克",
      controlledBy: "受克",
      neutral: "平"
    };
    return labels[relation];
  }

  function flyHiddenLabel(source, target) {
    const relation = relationBetween(source, target);
    const labels = {
      same: "飛伏同氣",
      generates: "飛生伏",
      generatedBy: "伏生飛",
      controls: "飛克伏",
      controlledBy: "伏克飛",
      neutral: "飛伏平"
    };
    return labels[relation];
  }

  function flyHiddenMeaning(source, target) {
    const relation = relationBetween(source, target);
    const meanings = {
      same: "明面和暗線屬性接近，藏著的事比較容易露出來。",
      generates: "明面條件在支持暗線，藏著的事有機會浮上來。",
      generatedBy: "暗線在支持明面，表示背後有東西正在成就表面局勢。",
      controls: "明面條件壓住暗線，想看的事目前不容易直接顯露。",
      controlledBy: "暗線反過來牽制明面，真正的原因可能藏在背後。",
      neutral: "明面和暗線沒有明顯生剋，要再合世應與動爻一起看。"
    };
    return meanings[relation];
  }

  function relativePlain(relative) {
    return RELATIVE_PLAIN[relative] || RELATIVE_MEANINGS[relative] || relative;
  }

  function relativeWithPlain(relative) {
    return `${relative}（${relativePlain(relative)}）`;
  }

  function focusRelativesPlain(category) {
    return focusRelatives(category).map(relativeWithPlain).join("、");
  }

  function plainFlyHiddenSentence(flying, hidden) {
    const relation = relationBetween(flying.element, hidden.element);
    const flyingText = relativeWithPlain(flying.relative);
    const hiddenText = relativeWithPlain(hidden.relative);
    if (relation === "same") {
      return `明面上的${flyingText}和暗藏的${hiddenText}性質接近，這條暗線比較容易被看見。`;
    }
    if (relation === "generates") {
      return `明面上的${flyingText}在支持暗藏的${hiddenText}，所以藏著的事有機會慢慢浮出來。`;
    }
    if (relation === "generatedBy") {
      return `暗藏的${hiddenText}在支持明面上的${flyingText}，表示背後有資源或原因正在推著表面局勢走。`;
    }
    if (relation === "controls") {
      return `明面上的${flyingText}壓住暗藏的${hiddenText}，所以你真正想看的那件事目前不容易直接出現。`;
    }
    if (relation === "controlledBy") {
      return `暗藏的${hiddenText}反過來牽制明面上的${flyingText}，真正的關鍵可能不在表面。`;
    }
    return `明面上的${flyingText}和暗藏的${hiddenText}沒有明顯生剋，還要合世應與動爻一起看。`;
  }

  function relativeFromPalace(palaceElement, lineElement) {
    if (palaceElement === lineElement) return "兄弟";
    if (GENERATES[palaceElement] === lineElement) return "子孫";
    if (GENERATES[lineElement] === palaceElement) return "父母";
    if (CONTROLS[palaceElement] === lineElement) return "妻財";
    if (CONTROLS[lineElement] === palaceElement) return "官鬼";
    return "未定";
  }

  function najiaForLine(hexagram, lineIndex) {
    const isInner = lineIndex < 3;
    const trigramName = isInner ? hexagram.lower : hexagram.upper;
    const trigramNajia = NAJIA[trigramName];
    const branch = isInner ? trigramNajia.inner[lineIndex] : trigramNajia.outer[lineIndex - 3];
    const stem = isInner ? trigramNajia.innerStem : trigramNajia.outerStem;
    return { stem, branch, text: `${stem}${branch}`, element: BRANCH_ELEMENTS[branch], trigram: trigramName };
  }

  function getLineDetails(hexagram, palaceEntry, values) {
    return hexagram.lines.map((bit, index) => {
      const najia = najiaForLine(hexagram, index);
      const relative = relativeFromPalace(palaceEntry.palaceElement, najia.element);
      const value = values ? LINE_VALUES[values[index]] : null;
      const role = [];
      if (index + 1 === palaceEntry.worldLine) role.push("世");
      if (index + 1 === palaceEntry.responseLine) role.push("應");
      if (value && value.moving) role.push("動");
      return {
        index,
        label: LINE_LABELS[index],
        bit,
        yinYang: bit ? "陽" : "陰",
        value,
        moving: Boolean(value && value.moving),
        najia,
        element: najia.element,
        relative,
        alias: RELATIVE_ALIASES[relative],
        meaning: RELATIVE_MEANINGS[relative],
        role
      };
    });
  }

  function enrichHiddenLine(flying, hidden, hexagram) {
    return {
      ...hidden,
      hexagram,
      flyHiddenLabel: flyHiddenLabel(flying.element, hidden.element),
      flyHiddenMeaning: flyHiddenMeaning(flying.element, hidden.element)
    };
  }

  function buildHiddenDetails(hexagram, palaceEntry, flyingLines) {
    const rootEntry = palaceRootEntry(palaceEntry.palace);
    const rootHiddenLines = getLineDetails(rootEntry.hexagram, palaceEntry, null);
    const oppositeHexagram = hexagramFromLines(hexagram.lines.map((line) => Number(!line)));
    const oppositeHiddenLines = getLineDetails(oppositeHexagram, palaceEntry, null);

    return flyingLines.map((flying, index) => ({
      index,
      label: LINE_LABELS[index],
      flying,
      palace: enrichHiddenLine(flying, rootHiddenLines[index], rootEntry.hexagram),
      opposite: enrichHiddenLine(flying, oppositeHiddenLines[index], oppositeHexagram)
    }));
  }

  function hexagramFromLines(lines) {
    const hexagram = HEX_BY_KEY[keyOfLines(lines)];
    if (!hexagram) {
      throw new Error(`找不到卦象：${keyOfLines(lines)}`);
    }
    return hexagram;
  }

  function castCoinLine() {
    const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 2 : 3));
    const total = coins.reduce((sum, coin) => sum + coin, 0);
    return { coins, total, value: total };
  }

  function castCoins() {
    return Array.from({ length: 6 }, castCoinLine);
  }

  function normalizeValues(values) {
    if (!Array.isArray(values) || values.length !== 6) {
      throw new Error("六爻必須剛好六個值。");
    }
    return values.map((value) => {
      const numeric = Number(value);
      if (!LINE_VALUES[numeric]) {
        throw new Error("爻值只能是 6、7、8、9。");
      }
      return numeric;
    });
  }

  function analyze(valuesInput) {
    const values = normalizeValues(valuesInput);
    const lines = values.map((value) => LINE_VALUES[value].bit);
    const changedLines = values.map((value) => LINE_VALUES[value].changedBit);
    const movingIndexes = values
      .map((value, index) => (LINE_VALUES[value].moving ? index : -1))
      .filter((index) => index >= 0);
    const hexagram = hexagramFromLines(lines);
    const changedHexagram = hexagramFromLines(changedLines);
    const palace = PALACE_DATA.byKey[hexagram.lineKey];
    const changedPalace = PALACE_DATA.byKey[changedHexagram.lineKey];
    const lineDetails = getLineDetails(hexagram, palace, values);
    const hiddenDetails = buildHiddenDetails(hexagram, palace, lineDetails);

    return {
      values,
      lines,
      changedLines,
      movingIndexes,
      hexagram,
      changedHexagram,
      palace,
      changedPalace,
      lineDetails,
      hiddenDetails
    };
  }

  function focusRelatives(category) {
    return CATEGORY_FOCUS[category] || CATEGORY_FOCUS.general;
  }

  function hiddenFindings(reading, category = "general") {
    const focus = focusRelatives(category);
    const visibleRelatives = new Set(reading.lineDetails.map((line) => line.relative));
    return focus
      .filter((relative, index, list) => list.indexOf(relative) === index)
      .map((relative) => {
        const visibleLines = reading.lineDetails.filter((line) => line.relative === relative);
        const palaceHidden = reading.hiddenDetails.find((line) => line.palace.relative === relative);
        return {
          relative,
          visible: visibleLines.length > 0,
          visibleLines,
          palaceHidden,
          absent: !visibleRelatives.has(relative)
        };
      });
  }

  function worldResponseReading(reading) {
    const world = reading.lineDetails[reading.palace.worldLine - 1];
    const response = reading.lineDetails[reading.palace.responseLine - 1];
    const relation = relationBetween(world.element, response.element);
    if (relation === "same") return "世應同氣，彼此條件接近，也可能互相競爭。";
    if (relation === "generates") return "世爻生應，自己較多付出，外部或對方受益。";
    if (relation === "generatedBy") return "應爻生世，外部環境或對方能給自己助力。";
    if (relation === "controls") return "世爻克應，自己有掌控力，但互動不可過硬。";
    if (relation === "controlledBy") return "應爻克世，外部壓力較明顯，宜先化解阻力。";
    return "世應關係平平，需看動爻決定主線。";
  }

  function innerOuterReading(reading) {
    const lower = TRIGRAMS[reading.hexagram.lower];
    const upper = TRIGRAMS[reading.hexagram.upper];
    const relation = relationBetween(lower.element, upper.element);
    if (relation === "same") return `內外皆${lower.element}，氣類相同，事情容易在同一圈層中放大。`;
    if (relation === "generates") return `內卦${lower.element}生外卦${upper.element}，自己或內部正在供養外部局勢。`;
    if (relation === "generatedBy") return `外卦${upper.element}生內卦${lower.element}，外部條件可回補自己。`;
    if (relation === "controls") return `內卦${lower.element}克外卦${upper.element}，主動性強，但推進會帶摩擦。`;
    if (relation === "controlledBy") return `外卦${upper.element}克內卦${lower.element}，外部壓力壓到內部，需要先穩住自身。`;
    return `內卦${lower.element}、外卦${upper.element}，關係不偏生克，需以動爻為主。`;
  }

  function movingLineReadings(reading) {
    if (reading.movingIndexes.length === 0) {
      return ["無變爻，本卦為主，代表局勢暫時穩定，宜以卦宮與世應判斷。"];
    }
    return reading.movingIndexes.map((index) => {
      const line = reading.lineDetails[index];
      const role = line.role.length ? `，兼${line.role.join("、")}` : "";
      const direction = line.bit ? "由陽轉陰，主收斂、降速、讓位" : "由陰轉陽，主啟動、顯化、增強";
      return `${line.label}${line.relative}動${role}：${line.meaning}被引動；${direction}。`;
    });
  }

  function movingPlain(reading) {
    if (reading.movingIndexes.length === 0) {
      return "目前變化不明顯，事情比較像停在原格局裡，需要先觀察與整理。";
    }
    const labels = reading.movingIndexes.map((index) => LINE_LABELS[index]).join("、");
    if (reading.movingIndexes.length <= 2) {
      return `變化集中在${labels}，先處理這幾個位置，比同時處理所有問題更有效。`;
    }
    return `動爻在${labels}，變動點偏多，表示事情還不穩，先降風險、少做不可逆決定。`;
  }

  function advantagePlain(reading) {
    const world = reading.lineDetails[reading.palace.worldLine - 1];
    const response = reading.lineDetails[reading.palace.responseLine - 1];
    const relation = relationBetween(world.element, response.element);
    if (relation === "generatedBy") return "優點是外部條件或對方比較能回頭支持你，不是完全孤軍作戰。";
    if (relation === "generates") return "優點是你有主動付出、推動局面的能力，能用行動換取對方或環境的回應。";
    if (relation === "controls") return "優點是你對局面仍有一定掌控力，適合把規則、界線和優先順序說清楚。";
    if (relation === "controlledBy") return "優點是壓力來源已經浮出來，問題雖然不輕，但至少知道該從哪裡處理。";
    if (relation === "same") return "優點是你和外部條件氣質接近，容易找到共同語言或熟悉的處理方式。";
    return "優點是格局沒有被單一力量卡死，還有轉圜與調整的空間。";
  }

  function riskPlain(reading, category) {
    const world = reading.lineDetails[reading.palace.worldLine - 1];
    const response = reading.lineDetails[reading.palace.responseLine - 1];
    const relation = relationBetween(world.element, response.element);
    const absent = hiddenFindings(reading, category).filter((finding) => finding.absent);
    const risks = [];
    if (relation === "generatedBy") risks.push("不要只等外部來幫，支援若不到位，進度會被拖住");
    if (relation === "generates") risks.push("你可能付出過多，最後變成自己消耗自己");
    if (relation === "controls") risks.push("掌控力用得太硬，容易讓對方或環境反彈");
    if (relation === "controlledBy") risks.push("外部壓力較強，先別硬碰硬");
    if (relation === "same") risks.push("條件太接近時，也可能變成互相競爭或僵持");
    if (absent.length) {
      risks.push(`${absent.map((finding) => relativeWithPlain(finding.relative)).join("、")}藏在暗線，代表關鍵資源或問題還沒有完全攤開`);
    }
    if (reading.movingIndexes.length > 2) risks.push("變動點偏多，決策要留退路");
    if (!risks.length) risks.push("主要風險不是大凶，而是看得不夠細、太快下結論");
    return `需要注意的是：${risks.join("；")}。`;
  }

  function nextStepPlain(reading, category) {
    const focus = focusRelatives(category).slice(0, 2).map(relativeWithPlain).join("、");
    if (reading.movingIndexes.length === 0) {
      return `下一步先盤點${focus}，把已知條件列清楚，再決定要不要推進。`;
    }
    const movingLines = reading.movingIndexes.map((index) => {
      const line = reading.lineDetails[index];
      return `${line.label}的${relativeWithPlain(line.relative)}`;
    }).join("、");
    return `下一步先處理${movingLines}，再回頭檢查${focus}是否到位。`;
  }

  function buildPlainSummary(reading, category, title) {
    const hexagram = reading.hexagram;
    const changed = reading.changedHexagram;
    const categoryName = CATEGORY_NAMES[category] || CATEGORY_NAMES.general;
    const transition = hexagram.number === changed.number
      ? `${hexagram.fullName}的原局，暫時沒有明顯變卦`
      : `${hexagram.fullName}走向${changed.fullName}`;
    return [
      `整體看，${title}屬於「${transition}」的局。白話說，現在不是單純問吉凶，而是在看事情從目前狀態往哪裡變。`,
      `所在位置是${reading.palace.palace}宮${reading.palace.generation}，卦宮五行屬${reading.palace.palaceElement}。八宮裡的「位置」像是事情所在的時空階段：它告訴你這件事現在偏向起步、推進、外移、回收，還是回到原問題。${GENERATION_MEANINGS[reading.palace.generation]}`,
      `${categoryName}面向來看，${movingPlain(reading)}`,
      advantagePlain(reading),
      riskPlain(reading, category),
      nextStepPlain(reading, category)
    ];
  }

  function hiddenInterpretationItems(reading, category) {
    const findings = hiddenFindings(reading, category);
    const absent = findings.filter((finding) => finding.absent && finding.palaceHidden);
    const items = [
      `這段是在看「明面」和「暗線」。明面看得到的爻叫飛爻；如果想看的角色沒出現在卦面，就到${reading.palace.palace}宮本宮卦同一個位置找伏神，也就是藏起來的線索。`,
      `這類問題會先看：${focusRelativesPlain(category)}。`
    ];

    if (absent.length === 0) {
      items.push("這次重點角色都已經出現在明面上，所以先看世爻、應爻和動爻；伏神只當作背後補充。");
      return items;
    }

    absent.forEach((finding) => {
      const hidden = finding.palaceHidden.palace;
      const flying = finding.palaceHidden.flying;
      items.push(`這卦明面上沒有${relativeWithPlain(finding.relative)}。它藏在${hidden.label}，也就是${hidden.najia.text}${hidden.relative}；但同一個位置明面上站著${flying.najia.text}${flying.relative}。${hidden.flyHiddenLabel}：${plainFlyHiddenSentence(flying, hidden)}`);
    });
    return items;
  }

  function buildInterpretation(reading, options = {}) {
    const question = (options.question || "").trim();
    const category = options.category || "general";
    const hexagram = reading.hexagram;
    const changed = reading.changedHexagram;
    const movingCount = reading.movingIndexes.length;
    const title = question ? `「${question}」` : "此占";
    const movementTone = movingCount === 0
      ? "變化不急，重點在本卦的格局。"
      : movingCount <= 2
        ? "變化集中，抓住動爻即可掌握主線。"
        : "多爻發動，局勢變化較大，宜先降風險再求進展。";

    const sections = [
      {
        title: "卦意",
        items: [
          `${title}得${hexagram.fullName}（${hexagram.symbol}）：${hexagram.theme}。${hexagram.counsel}`,
          `變卦為${changed.fullName}（${changed.symbol}）：${changed.theme}。${changed.counsel}`,
          movementTone
        ]
      },
      {
        title: "八宮",
        items: [
          `本卦入${reading.palace.palace}宮，卦宮五行屬${reading.palace.palaceElement}，為${reading.palace.generation}卦。${GENERATION_MEANINGS[reading.palace.generation]}`,
          `內卦${hexagram.lower}為${TRIGRAMS[hexagram.lower].nature}；外卦${hexagram.upper}為${TRIGRAMS[hexagram.upper].nature}。${innerOuterReading(reading)}`,
          worldResponseReading(reading)
        ]
      },
      {
        title: "動爻",
        items: movingLineReadings(reading)
      },
      {
        title: "飛伏",
        items: hiddenInterpretationItems(reading, category)
      },
      {
        title: "問事",
        items: [CATEGORY_HINTS[category] || CATEGORY_HINTS.general]
      },
      {
        title: "總結",
        items: buildPlainSummary(reading, category, title)
      }
    ];

    return sections;
  }

  function coinText(coins) {
    return coins.map((coin) => (coin === 2 ? "字" : "背")).join(" ");
  }

  global.JingFang = {
    TRIGRAMS,
    HEXAGRAMS: ALL_HEXAGRAMS,
    HEX_BY_NUMBER,
    LINE_VALUES,
    LINE_LABELS,
    PALACE_TABLE: PALACE_DATA.table,
    BRANCH_ELEMENTS,
    RELATIVE_MEANINGS,
    RELATIVE_PLAIN,
    RELATIVE_ALIASES,
    GENERATION_MEANINGS,
    MODEL_SECTIONS,
    analyze,
    castCoins,
    coinText,
    relationBetween,
    relationLabel,
    flyHiddenLabel,
    flyHiddenMeaning,
    focusRelatives,
    hiddenFindings,
    buildInterpretation
  };
})(globalThis);
