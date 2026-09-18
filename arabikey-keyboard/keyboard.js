(function (root) {
  "use strict";

  var FATHA = "\u064E";
  var DAMMA = "\u064F";
  var KASRA = "\u0650";
  var SUKUN = "\u0652";
  var SHADDA = "\u0651";
  var FATHATAN = "\u064B";
  var DAMMATAN = "\u064C";
  var KASRATAN = "\u064D";

  var HARAKAT = [
    { ar: FATHA, label: "فتحة" },
    { ar: DAMMA, label: "ضمة" },
    { ar: KASRA, label: "كسرة" },
    { ar: SUKUN, label: "سكون" },
    { ar: SHADDA, label: "شدة" },
    { ar: FATHATAN, label: "تنوين فتح" },
    { ar: DAMMATAN, label: "تنوين ضم" },
    { ar: KASRATAN, label: "تنوين كسر" },
    { ar: "أ", label: "ألف همزة" },
    { ar: "إ", label: "إ" },
    { ar: "آ", label: "آ" },
    { ar: "ى", label: "ألف مقصورة" },
    { ar: "ة", label: "تاء مربوطة" },
    { ar: "ء", label: "همزة" },
    { ar: "ؤ", label: "ؤ" },
    { ar: "ئ", label: "ئ" }
  ];

  var EMOJIS = [
    "😀", "😁", "😂", "😊", "😍", "😘", "🤔", "😎",
    "😅", "😭", "😡", "🙏", "👍", "👎", "💪", "🔥",
    "❤️", "💚", "✨", "⭐", "🌙", "☀️", "🌸", "🍀",
    "🎉", "✅", "❌", "☕", "📚", "✍️", "🎵", "💡"
  ];

  var AZERTY_LAT = {
    KeyQ: "a",
    KeyW: "z",
    KeyE: "e",
    KeyR: "r",
    KeyT: "t",
    KeyY: "y",
    KeyU: "u",
    KeyI: "i",
    KeyO: "o",
    KeyP: "p",
    KeyA: "q",
    KeyS: "s",
    KeyD: "d",
    KeyF: "f",
    KeyG: "g",
    KeyH: "h",
    KeyJ: "j",
    KeyK: "k",
    KeyL: "l",
    Semicolon: "m",
    Quote: "ù",
    KeyZ: "w",
    KeyX: "x",
    KeyC: "c",
    KeyV: "v",
    KeyB: "b",
    KeyN: "n",
    KeyM: ",",
    Comma: ";",
    Period: ":",
    Slash: "!"
  };

  function k(code, ar, shift, lat) {
    return { code: code, ar: ar, shift: shift, lat: lat };
  }

  function arabic101Rows() {
    return [
      [
        k("Backquote", "ذ", "ّ", "`"),
        k("Digit1", "١", FATHA, "1"),
        k("Digit2", "٢", FATHATAN, "2"),
        k("Digit3", "٣", DAMMA, "3"),
        k("Digit4", "٤", DAMMATAN, "4"),
        k("Digit5", "٥", KASRA, "5"),
        k("Digit6", "٦", KASRATAN, "6"),
        k("Digit7", "٧", SUKUN, "7"),
        k("Digit8", "٨", SHADDA, "8"),
        k("Digit9", "٩", ")", "9"),
        k("Digit0", "٠", "(", "0"),
        k("Minus", "-", "_", "-"),
        k("Equal", "=", "+", "="),
        { code: "Backspace", ar: "←", lat: "", wide: true, action: "backspace" }
      ],
      [
        { code: "Tab", ar: "⇥", lat: "Tab", wide: true, action: "tab" },
        k("KeyQ", "ض", FATHA, "q"),
        k("KeyW", "ص", FATHATAN, "w"),
        k("KeyE", "ث", DAMMA, "e"),
        k("KeyR", "ق", DAMMATAN, "r"),
        k("KeyT", "ف", "لإ", "t"),
        k("KeyY", "غ", "إ", "y"),
        k("KeyU", "ع", "‘", "u"),
        k("KeyI", "ه", "÷", "i"),
        k("KeyO", "خ", "×", "o"),
        k("KeyP", "ح", "؛", "p"),
        k("BracketLeft", "ج", ">", "["),
        k("BracketRight", "د", "<", "]")
      ],
      [
        { code: "CapsLock", ar: "⇪", lat: "Maj", wide: true, action: "caps" },
        k("KeyA", "ش", KASRA, "a"),
        k("KeyS", "س", KASRATAN, "s"),
        k("KeyD", "ي", "]", "d"),
        k("KeyF", "ب", "[", "f"),
        k("KeyG", "ل", "لأ", "g"),
        k("KeyH", "ا", "أ", "h"),
        k("KeyJ", "ت", "ـ", "j"),
        k("KeyK", "ن", "،", "k"),
        k("KeyL", "م", "/", "l"),
        k("Semicolon", "ك", ":", ";"),
        k("Quote", "ط", '"', "'"),
        { code: "Enter", ar: "⏎", lat: "Entrée", wide: true, action: "enter" }
      ],
      [
        { code: "ShiftLeft", ar: "⇧", lat: "Shift", wide: true, action: "shift" },
        k("KeyZ", "ئ", "~", "z"),
        k("KeyX", "ء", SUKUN, "x"),
        k("KeyC", "ؤ", "}", "c"),
        k("KeyV", "ر", "{", "v"),
        k("KeyB", "لا", "لآ", "b"),
        k("KeyN", "ى", "آ", "n"),
        k("KeyM", "ة", "'", "m"),
        k("Comma", "و", ",", ","),
        k("Period", "ز", ".", "."),
        k("Slash", "ظ", "؟", "/"),
        { code: "ShiftRight", ar: "⇧", lat: "Shift", wide: true, action: "shift" }
      ],
      [
        { code: "Emoji", ar: "", lat: "", wide: true, action: "emoji" },
        { code: "Space", ar: "مسافة", lat: "Espace", space: true, action: "space" }
      ]
    ];
  }

  function relabel(rows, latinMap) {
    return rows.map(function (row) {
      return row.map(function (key) {
        if (!latinMap[key.code]) return key;
        var copy = {};
        for (var prop in key) {
          if (Object.prototype.hasOwnProperty.call(key, prop)) copy[prop] = key[prop];
        }
        copy.lat = latinMap[key.code];
        return copy;
      });
    });
  }

  function layoutRows(which) {
    var rows = arabic101Rows();
    if ((which || "azerty") === "azerty") return relabel(rows, AZERTY_LAT);
    return rows;
  }

  function keyGlyph(key, shift) {
    if (key.action) return key.ar;
    return shift && key.shift ? key.shift : key.ar;
  }

  function isCombiningMark(ch) {
    return typeof ch === "string" && /[\u064B-\u065F\u0670]/.test(ch);
  }

  function shiftLabel(ch) {
    if (!ch) return "";
    return isCombiningMark(ch) ? "\u25CC" + ch : ch;
  }

  var EMOJI_FACE = "😊";

  function emojiIcon() {
    var face = el("span", "ak-kb-ar ak-kb-emoji-face", EMOJI_FACE);
    face.setAttribute("aria-hidden", "true");
    return face;
  }

  function findKey(layout, code) {
    var rows = layoutRows(layout);
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < rows[i].length; j++) {
        if (rows[i][j].code === code) return rows[i][j];
      }
    }
    return null;
  }

  function glyphForCode(layout, code, shift) {
    var key = findKey(layout, code);
    if (!key || key.action) return null;
    return keyGlyph(key, !!shift);
  }

  var COPY = {
    en: {
      placeholder: "Click here, then type: physical keys insert Arabic.",
      copy: "Copy",
      copied: "Copied.",
      copyEmpty: "Nothing to copy.",
      tashkil: "Tashkīl / Diacritization",
      tashkilLoading: "Vocalizing…",
      tashkilOk: "Tashkīl applied.",
      tashkilEmpty: "Write some Arabic first.",
      tashkilError: "Remote tashkīl unavailable — local version.",
      yamli: "Yamli",
      yamliOn: "Yamli: type marhaba then Space.",
      yamliOff: "Physical keys → Arabic (Yamli off).",
      azerty: "Azerty",
      qwerty: "Qwerty",
      clear: "Clear",
      hint: "By default, A (Azerty) = ض. Yamli (optional): Latin phonetic → Arabic.",
      editorLabel: "Arabic text editor",
      keyTab: "Tab",
      keyCaps: "Caps",
      keyEnter: "Enter",
      keyShift: "Shift",
      keySpace: "Space",
      emoji: "Emoji"
    },
    fr: {
      placeholder: "Cliquez ici, puis tapez : les touches physiques insèrent l’arabe.",
      copy: "Copier",
      copied: "Copié.",
      copyEmpty: "Rien à copier.",
      tashkil: "Tashkīl / Diacritization",
      tashkilLoading: "Vocalisation…",
      tashkilOk: "Tashkīl appliqué.",
      tashkilEmpty: "Écrivez d’abord un texte arabe.",
      tashkilError: "Tashkīl distant indisponible — version locale.",
      yamli: "Yamli",
      yamliOn: "Yamli : tapez marhaba puis Espace.",
      yamliOff: "Touches physiques → arabe (Yamli off).",
      azerty: "Azerty",
      qwerty: "Qwerty",
      clear: "Effacer",
      hint: "Par défaut, A (Azerty) = ض. Yamli (optionnel) : latin phonétique → arabe.",
      editorLabel: "Éditeur de texte arabe",
      keyTab: "Tab",
      keyCaps: "Maj",
      keyEnter: "Entrée",
      keyShift: "Shift",
      keySpace: "Espace",
      emoji: "Emoji"
    },
    ar: {
      placeholder: "انقر هنا ثم اكتب: المفاتيح تُدخل العربية.",
      copy: "نسخ",
      copied: "تم النسخ.",
      copyEmpty: "لا يوجد نص.",
      tashkil: "تشكيل / Tashkīl",
      tashkilLoading: "جاري التشكيل…",
      tashkilOk: "تم التشكيل.",
      tashkilEmpty: "اكتب نصاً عربياً أولاً.",
      tashkilError: "التشكيل الشبكي غير متاح — المحلي.",
      yamli: "Yamli",
      yamliOn: "ياملي: اكتب marhaba ثم مسافة.",
      yamliOff: "المفاتيح تُدخل العربية.",
      azerty: "Azerty",
      qwerty: "Qwerty",
      clear: "مسح",
      hint: "افتراضياً المفاتيح تكتب عربي. ياملي اختياري للاتيني.",
      editorLabel: "محرر النص العربي",
      keyTab: "Tab",
      keyCaps: "Caps",
      keyEnter: "Enter",
      keyShift: "Shift",
      keySpace: "مسافة",
      emoji: "إيموجي"
    }
  };

  function resolveLang(lang) {
    if (lang === "ar") return "ar";
    if (lang === "fr") return "fr";
    return "en";
  }

  function keyCaption(lang, key) {
    if (!key.action) return key.lat;
    var pack = COPY[resolveLang(lang)];
    switch (key.action) {
      case "tab":
        return pack.keyTab;
      case "caps":
        return pack.keyCaps;
      case "enter":
        return pack.keyEnter;
      case "shift":
        return pack.keyShift;
      case "space":
        return pack.keySpace;
      case "emoji":
        return pack.emoji;
      case "noop":
        return key.lat;
      case "backspace":
        return "";
      default: {
        var _unused = key.action;
        return key.lat;
      }
    }
  }

  function scriptBase() {
    if (typeof document === "undefined") return "";
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || "";
      if (/keyboard\.js(\?|$)/.test(src)) return src.replace(/keyboard\.js(\?.*)?$/, "");
    }
    return "arabikey-keyboard/";
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function insertAtCaret(textarea, text) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var value = textarea.value;
    textarea.value = value.slice(0, start) + text + value.slice(end);
    var pos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
    textarea.focus();
  }

  function deleteAtCaret(textarea) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    if (start !== end) {
      insertAtCaret(textarea, "");
      return;
    }
    if (start === 0) return;
    textarea.value = textarea.value.slice(0, start - 1) + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start - 1;
    textarea.focus();
  }

  function currentLatinToken(textarea) {
    var pos = textarea.selectionStart;
    var left = textarea.value.slice(0, pos);
    var m = left.match(/[A-Za-z0-9']+$/);
    return m ? m[0] : "";
  }

  function replaceLatinToken(textarea, arabic) {
    var pos = textarea.selectionStart;
    var left = textarea.value.slice(0, pos);
    var right = textarea.value.slice(pos);
    var m = left.match(/[A-Za-z0-9']+$/);
    if (!m) {
      insertAtCaret(textarea, arabic);
      return;
    }
    textarea.value = left.slice(0, left.length - m[0].length) + arabic + right;
    var caret = left.length - m[0].length + arabic.length;
    textarea.selectionStart = textarea.selectionEnd = caret;
    textarea.focus();
  }

  function mount(target, options) {
    options = options || {};
    var lang = resolveLang(options.lang);
    var t = COPY[lang];
    var base = options.assetBase || scriptBase();
    var state = {
      layout: options.layout === "qwerty" ? "qwerty" : "azerty",
      shift: false,
      caps: false,
      yamli: options.yamli === true,
      suggestions: [],
      pending: {}
    };

    var rootEl = typeof target === "string" ? document.querySelector(target) : target;
    if (!rootEl) return null;
    rootEl.innerHTML = "";
    rootEl.classList.add("ak-kb");

    var card = el("div", "ak-kb-card");
    var toolbar = el("div", "ak-kb-toolbar");
    var yamliBtn = el("button", "ak-kb-btn ak-kb-btn-yamli", t.yamli);
    yamliBtn.type = "button";
    var azertyBtn = el("button", "ak-kb-btn", t.azerty);
    azertyBtn.type = "button";
    var qwertyBtn = el("button", "ak-kb-btn", t.qwerty);
    qwertyBtn.type = "button";
    var tashkilBtn = el("button", "ak-kb-btn ak-kb-btn-tashkil", t.tashkil);
    tashkilBtn.type = "button";
    toolbar.appendChild(yamliBtn);
    toolbar.appendChild(azertyBtn);
    toolbar.appendChild(qwertyBtn);
    toolbar.appendChild(tashkilBtn);

    var wrap = el("div", "ak-kb-editor-wrap");
    var editor = el("textarea", "ak-kb-editor");
    editor.id = options.editorId || "arabikey-editor";
    editor.setAttribute("dir", "rtl");
    editor.setAttribute("lang", "ar");
    editor.setAttribute("rows", "3");
    editor.setAttribute("spellcheck", "false");
    editor.setAttribute("autocomplete", "off");
    editor.setAttribute("placeholder", t.placeholder);
    editor.setAttribute("aria-label", t.editorLabel);
    var suggestBox = el("div", "ak-kb-suggest");
    suggestBox.setAttribute("role", "listbox");
    wrap.appendChild(editor);
    wrap.appendChild(suggestBox);

    var status = el("div", "ak-kb-status");
    status.setAttribute("aria-live", "polite");
    var harakatBar = el("div", "ak-kb-harakat");
    HARAKAT.forEach(function (item) {
      var b = el("button", "", item.ar);
      b.type = "button";
      b.title = item.label;
      b.addEventListener("click", function () {
        insertAtCaret(editor, item.ar);
        refresh();
      });
      harakatBar.appendChild(b);
    });
    var board = el("div", "ak-kb-board");
    var emojiPop = el("div", "ak-kb-emoji-pop");
    emojiPop.setAttribute("hidden", "");
    emojiPop.setAttribute("role", "dialog");
    emojiPop.setAttribute("aria-label", t.emoji);
    EMOJIS.forEach(function (mark) {
      var chip = el("button", "ak-kb-emoji-chip", mark);
      chip.type = "button";
      chip.addEventListener("click", function () {
        insertAtCaret(editor, mark);
        emojiPop.setAttribute("hidden", "");
        refresh();
      });
      emojiPop.appendChild(chip);
    });
    var hint = el("p", "ak-kb-hint", t.hint);

    card.appendChild(toolbar);
    card.appendChild(wrap);
    card.appendChild(status);
    card.appendChild(harakatBar);
    card.appendChild(board);
    card.appendChild(emojiPop);
    card.appendChild(hint);
    rootEl.appendChild(card);

    function setStatus(kind, message) {
      status.dataset.kind = kind || "";
      status.textContent = message || "";
    }

    function loadScript(file) {
      if (state.pending[file]) return state.pending[file];
      if (typeof document === "undefined") {
        state.pending[file] = Promise.resolve();
        return state.pending[file];
      }
      var href = base.replace(/\/?$/, "/") + file;
      if (document.querySelector('script[src="' + href + '"]')) {
        state.pending[file] = Promise.resolve();
        return state.pending[file];
      }
      state.pending[file] = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = href;
        s.async = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error(file)); };
        document.head.appendChild(s);
      });
      return state.pending[file];
    }

    function ensureYamliEngine() {
      return Promise.all([loadScript("lexicon.js"), loadScript("phonetic.js")]);
    }

    function ensureTashkilEngine() {
      return Promise.all([loadScript("lexicon.js"), loadScript("tashkil-local.js")]);
    }

    function refresh() {
      azertyBtn.setAttribute("aria-pressed", state.layout === "azerty" ? "true" : "false");
      qwertyBtn.setAttribute("aria-pressed", state.layout === "qwerty" ? "true" : "false");
      yamliBtn.setAttribute("aria-pressed", state.yamli ? "true" : "false");
      rootEl.setAttribute("data-layout", state.layout);
      rootEl.setAttribute("data-yamli", state.yamli ? "on" : "off");
      rootEl.classList.toggle("is-shift", !!(state.shift || state.caps));
      renderBoard();
      renderSuggestions();
    }

    function renderSuggestions() {
      suggestBox.innerHTML = "";
      if (!state.yamli || !state.suggestions.length) {
        suggestBox.classList.remove("is-open");
        return;
      }
      suggestBox.classList.add("is-open");
      state.suggestions.forEach(function (item, idx) {
        var chip = el("button", "ak-kb-chip" + (idx === 0 ? " is-best" : ""), item.ar);
        chip.type = "button";
        chip.setAttribute("role", "option");
        chip.addEventListener("click", function () {
          replaceLatinToken(editor, item.ar);
          state.suggestions = [];
          refresh();
        });
        suggestBox.appendChild(chip);
      });
    }

    function renderBoard() {
      board.innerHTML = "";
      var rows = layoutRows(state.layout);
      var shiftLayer = state.shift || state.caps;
      rows.forEach(function (row) {
        var rowEl = el("div", "ak-kb-row");
        row.forEach(function (key) {
          var btn = el("button", "ak-kb-key");
          btn.type = "button";
          if (key.wide) btn.classList.add("is-wide");
          if (key.space) btn.classList.add("is-space");
          if (key.action === "shift" && state.shift) btn.setAttribute("aria-pressed", "true");
          if (key.action === "caps" && state.caps) btn.setAttribute("aria-pressed", "true");
          if (key.action === "emoji") {
            btn.classList.add("is-emoji");
            btn.setAttribute("aria-label", t.emoji);
            btn.appendChild(emojiIcon());
            var emojiLab = el("span", "ak-kb-lat", t.emoji);
            btn.appendChild(emojiLab);
          } else {
            if (!key.action && key.shift) {
              var hintSpan = el("span", "ak-kb-shift-hint" + (shiftLayer ? " is-live" : ""), shiftLabel(key.shift));
              if (isCombiningMark(key.shift)) hintSpan.classList.add("is-mark");
              btn.appendChild(hintSpan);
            }
            var mainGlyph = key.action ? (key.ar || keyCaption(lang, key)) : key.ar;
            if (mainGlyph) btn.appendChild(el("span", "ak-kb-ar", mainGlyph));
            var latLabel = keyCaption(lang, key);
            if (latLabel && latLabel !== mainGlyph) btn.appendChild(el("span", "ak-kb-lat", latLabel));
          }
          btn.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
          btn.addEventListener("click", function () { handleVirtual(key); });
          rowEl.appendChild(btn);
        });
        board.appendChild(rowEl);
      });
    }

    function handleVirtual(key) {
      if (key.action !== "emoji") emojiPop.setAttribute("hidden", "");
      if (key.action === "backspace") deleteAtCaret(editor);
      else if (key.action === "space") commitYamliOrInsert(" ");
      else if (key.action === "enter") commitYamliOrInsert("\n");
      else if (key.action === "tab") insertAtCaret(editor, "\t");
      else if (key.action === "shift") state.shift = !state.shift;
      else if (key.action === "caps") state.caps = !state.caps;
      else if (key.action === "emoji") {
        if (emojiPop.hasAttribute("hidden")) emojiPop.removeAttribute("hidden");
        else emojiPop.setAttribute("hidden", "");
        return;
      }
      else if (key.action === "noop") return;
      else {
        insertAtCaret(editor, keyGlyph(key, state.shift || state.caps));
        if (state.shift) state.shift = false;
      }
      refresh();
    }

    function commitYamliOrInsert(suffix) {
      if (state.yamli && state.suggestions.length) {
        replaceLatinToken(editor, state.suggestions[0].ar + (suffix || ""));
        state.suggestions = [];
        return;
      }
      insertAtCaret(editor, suffix);
    }

    function updateYamliFromEditor() {
      if (!state.yamli || !root.ArabikeyPhonetic) {
        state.suggestions = [];
        return;
      }
      var token = currentLatinToken(editor);
      state.suggestions = token.length >= 1 ? root.ArabikeyPhonetic.suggest(token, 5) : [];
    }

    editor.addEventListener("input", function () {
      if (state.yamli) updateYamliFromEditor();
      refresh();
    });

    editor.addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.isComposing) return;

      if (state.yamli) {
        if (ev.key === " " || ev.key === "Enter" || ev.key === "Tab") {
          if (state.suggestions.length) {
            ev.preventDefault();
            replaceLatinToken(editor, state.suggestions[0].ar + (ev.key === "Enter" ? "\n" : ev.key === "Tab" ? "" : " "));
            state.suggestions = [];
            refresh();
          }
        } else if (ev.key === "Escape") {
          state.suggestions = [];
          refresh();
        }
        return;
      }

      if (ev.key === "Backspace" || ev.key === "Escape") return;

      var found = findKey(state.layout, ev.code);
      if (!found) return;
      if (found.action === "noop") return;
      if (found.action === "backspace") return;
      if (found.action === "shift" || found.action === "caps") {
        ev.preventDefault();
        if (found.action === "shift") state.shift = !state.shift;
        else state.caps = !state.caps;
        refresh();
        return;
      }
      ev.preventDefault();
      if (found.action === "space") commitYamliOrInsert(" ");
      else if (found.action === "enter") commitYamliOrInsert("\n");
      else if (found.action === "tab") insertAtCaret(editor, "\t");
      else insertAtCaret(editor, keyGlyph(found, ev.shiftKey || state.shift || state.caps));
      if (state.shift && !found.action) state.shift = false;
      refresh();
    });

    yamliBtn.addEventListener("click", function () {
      if (state.yamli) {
        state.yamli = false;
        state.suggestions = [];
        setStatus("", t.yamliOff);
        refresh();
        return;
      }
      yamliBtn.disabled = true;
      ensureYamliEngine()
        .then(function () {
          state.yamli = true;
          setStatus("", t.yamliOn);
          yamliBtn.disabled = false;
          refresh();
          editor.focus();
        })
        .catch(function () {
          yamliBtn.disabled = false;
          setStatus("error", "Yamli indisponible.");
        });
    });

    azertyBtn.addEventListener("click", function () {
      state.layout = "azerty";
      refresh();
    });
    qwertyBtn.addEventListener("click", function () {
      state.layout = "qwerty";
      refresh();
    });

    function applyTashkil() {
      var text = editor.value.trim();
      if (!text) {
        setStatus("error", t.tashkilEmpty);
        return;
      }
      setStatus("loading", t.tashkilLoading);
      tashkilBtn.disabled = true;

      function done(vocalized, source) {
        editor.value = vocalized;
        tashkilBtn.disabled = false;
        setStatus(source === "local" ? "error" : "ok", source === "local" ? t.tashkilError : t.tashkilOk);
        refresh();
      }

      function requestMishkal() {
        var form = new URLSearchParams();
        form.set("text", text);
        form.set("action", "Tashkeel2");
        return fetch("https://tahadz.com/cgi-bin/mishkal.cgi/ajaxGet", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          body: form.toString()
        }).then(function (res) {
          if (!res.ok) return null;
          return res.json().catch(function () { return null; });
        }).then(function (data) {
          if (!data || !root.ArabikeyTashkil) return "";
          return root.ArabikeyTashkil.refineRemote(text, data);
        });
      }

      function viaRest() {
        var payload = { text: text };
        if (options.nonce) payload.nonce = options.nonce;
        return fetch(options.restUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (res) {
          return res.json().then(function (body) { return { ok: res.ok, body: body }; });
        });
      }

      ensureTashkilEngine()
        .then(function () {
          var local = root.ArabikeyTashkil ? root.ArabikeyTashkil.tashkilLocal(text) : { text: text };
          if (options.restUrl) {
            return viaRest().then(function (pack) {
              var vocalized = pack.body && (pack.body.text || (pack.body.data && pack.body.data.text));
              if (pack.ok && vocalized) done(vocalized, pack.body.source || "remote");
              else {
                return requestMishkal().then(function (v) {
                  done(v || local.text || text, v ? "remote" : "local");
                });
              }
            });
          }
          return requestMishkal().then(function (v) {
            done(v || local.text || text, v ? "remote" : "local");
          });
        })
        .catch(function () {
          tashkilBtn.disabled = false;
          setStatus("error", t.tashkilError);
        });
    }

    tashkilBtn.addEventListener("click", applyTashkil);

    document.addEventListener("click", function (ev) {
      if (!emojiPop.hasAttribute("hidden") && !card.contains(ev.target)) {
        emojiPop.setAttribute("hidden", "");
      }
    });

    refresh();
    setStatus("", t.yamliOff);
    editor.focus();

    return {
      editor: editor,
      getValue: function () { return editor.value; },
      setValue: function (v) { editor.value = v; refresh(); },
      tashkil: applyTashkil,
      setYamli: function (on) {
        state.yamli = !!on;
        refresh();
      }
    };
  }

  function autoMount() {
    if (typeof document === "undefined") return;
    var nodes = document.querySelectorAll("[data-arabikey-keyboard]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute("data-mounted") === "1") continue;
      node.setAttribute("data-mounted", "1");
      var cfg = {};
      try {
        cfg = JSON.parse(node.getAttribute("data-config") || "{}");
      } catch (err) {
        cfg = {};
      }
      mount(node, cfg);
    }
  }

  var api = {
    mount: mount,
    autoMount: autoMount,
    glyphForCode: glyphForCode,
    COPY: COPY,
    EMOJI_FACE: EMOJI_FACE
  };
  root.ArabikeyKeyboard = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMount);
    else autoMount();
  }
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
