(function (root) {
  "use strict";

  var DIGRAPHS = [
    ["kh", "خ"],
    ["gh", "غ"],
    ["sh", "ش"],
    ["ch", "ش"],
    ["th", "ث"],
    ["dh", "ذ"],
    ["dj", "ج"],
    ["zh", "ج"],
    ["ph", "ف"],
    ["aa", "ا"],
    ["ee", "ي"],
    ["ii", "ي"],
    ["oo", "و"],
    ["uu", "و"],
    ["ou", "و"],
    ["ow", "و"],
    ["ai", "ي"],
    ["ay", "ي"],
    ["ey", "ي"],
    ["ei", "ي"],
    ["aw", "و"]
  ];

  var SINGLE = {
    a: "ا",
    b: "ب",
    c: "ك",
    d: "د",
    e: "ي",
    f: "ف",
    g: "ج",
    h: "ه",
    i: "ي",
    j: "ج",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    o: "و",
    p: "ب",
    q: "ق",
    r: "ر",
    s: "س",
    t: "ت",
    u: "و",
    v: "ف",
    w: "و",
    x: "كس",
    y: "ي",
    z: "ز",
    "2": "ء",
    "3": "ع",
    "5": "خ",
    "6": "ط",
    "7": "ح",
    "8": "ق",
    "9": "ص",
    "'": "ء",
    "7h": "ح"
  };

  var SHORT_VOWELS = { a: 1, e: 1, i: 1, o: 1, u: 1 };
  var LONG_LETTERS = { ا: 1, و: 1, ي: 1, ى: 1, آ: 1, أ: 1, إ: 1, ؤ: 1, ئ: 1, ء: 1 };

  function tokenize(raw) {
    var s = String(raw || "").toLowerCase();
    var out = [];
    var i = 0;
    while (i < s.length) {
      var matched = false;
      for (var d = 0; d < DIGRAPHS.length; d++) {
        var pair = DIGRAPHS[d];
        if (s.substr(i, pair[0].length) === pair[0]) {
          out.push({ lat: pair[0], ar: pair[1], longVowel: "اوي".indexOf(pair[1]) !== -1 && pair[0].length > 1 });
          i += pair[0].length;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      var ch = s.charAt(i);
      if (SINGLE[ch]) {
        out.push({
          lat: ch,
          ar: SINGLE[ch],
          shortVowel: !!SHORT_VOWELS[ch],
          longVowel: !SHORT_VOWELS[ch] && "اويء".indexOf(SINGLE[ch]) !== -1
        });
      } else if (/[0-9]/.test(ch)) {
        out.push({ lat: ch, ar: ch, literal: true });
      }
      i += 1;
    }
    return out;
  }

  function rulesToArabic(latin) {
    var tokens = tokenize(latin);
    if (!tokens.length) return "";
    var chars = [];
    tokens.forEach(function (tok, idx) {
      if (tok.literal) {
        chars.push(tok.ar);
        return;
      }
      if (tok.shortVowel) {
        var isFirst = chars.length === 0;
        var isLast = idx === tokens.length - 1;
        if (isFirst) {
          if (tok.lat === "a" || tok.lat === "e") chars.push("أ");
          else if (tok.lat === "i") chars.push("إ");
          else chars.push("أ");
          return;
        }
        if (isLast) {
          if (tok.lat === "a" || tok.lat === "e") chars.push("ا");
          else if (tok.lat === "i") chars.push("ي");
          else chars.push("و");
          return;
        }
        return;
      }
      if (tok.lat === "h" && chars.length) {
        var prev = tokens[idx - 1];
        if (prev && (prev.lat === "a" || prev.lat === "e") && idx === tokens.length - 1) {
          chars.push("ة");
          return;
        }
      }
      if (tok.ar === "ه") {
        var nxt = tokens[idx + 1];
        var look = (nxt && nxt.lat) || "";
        if ("aiuoe".indexOf(look.charAt(0)) !== -1 && idx !== tokens.length - 1) {
          chars.push("ح");
          return;
        }
      }
      chars.push(tok.ar);
    });
    return chars.join("").replace(/اا+/g, "ا");
  }

  function uniquePush(list, item) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].ar === item.ar) return;
    }
    list.push(item);
  }

  function suggest(latin, limit) {
    limit = limit || 5;
    var lex = root.ArabikeyLexicon;
    var key = lex ? lex.normKey(latin) : String(latin || "").toLowerCase();
    var results = [];
    if (!key) return results;

    if (lex && lex.byLatin[key]) {
      lex.byLatin[key].forEach(function (entry) {
        uniquePush(results, { ar: entry.ar, tashkil: entry.t, source: "lexicon", score: 100 });
      });
    }

    if (lex) {
      Object.keys(lex.byLatin).forEach(function (k) {
        if (results.length >= limit + 4) return;
        if (k === key) return;
        if (k.indexOf(key) === 0 || key.indexOf(k) === 0) {
          lex.byLatin[k].forEach(function (entry) {
            var score = k.indexOf(key) === 0 ? 80 - Math.abs(k.length - key.length) : 60;
            uniquePush(results, { ar: entry.ar, tashkil: entry.t, source: "prefix", score: score });
          });
        }
      });
    }

    var ruled = rulesToArabic(latin);
    if (ruled) {
      uniquePush(results, { ar: ruled, tashkil: ruled, source: "rules", score: 40 });
    }

    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, limit);
  }

  function transliterate(latin) {
    var hits = suggest(latin, 1);
    return hits.length ? hits[0].ar : rulesToArabic(latin);
  }

  function convertText(text) {
    return String(text || "")
      .split(/(\s+)/)
      .map(function (chunk) {
        if (/^\s+$/.test(chunk) || chunk === "") return chunk;
        return transliterate(chunk);
      })
      .join("");
  }

  var api = {
    tokenize: tokenize,
    rulesToArabic: rulesToArabic,
    suggest: suggest,
    transliterate: transliterate,
    convertText: convertText,
    LONG_LETTERS: LONG_LETTERS
  };

  root.ArabikeyPhonetic = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
