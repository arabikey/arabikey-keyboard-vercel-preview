(function (root) {
  "use strict";

  var HARAKAT = /[\u064B-\u065F\u0670]/g;
  var SUN = "تثدذرزسشصضطظلن";

  function strip(s) {
    return String(s || "").replace(HARAKAT, "");
  }

  function lookupWord(raw) {
    var lex = root.ArabikeyLexicon;
    if (!lex) return null;
    var bare = strip(raw);
    if (lex.byArabic[bare]) return lex.byArabic[bare];
    if (lex.byArabic[raw]) return lex.byArabic[raw];
    return null;
  }

  function splitPrefix(word) {
    var bare = strip(word);
    var prefixes = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل"];
    for (var i = 0; i < prefixes.length; i++) {
      var p = prefixes[i];
      if (bare.indexOf(p) === 0 && bare.length > p.length + 1) {
        return { prefix: p, rest: bare.slice(p.length) };
      }
    }
    return { prefix: "", rest: bare };
  }

  function vocalizePrefix(prefix, restVocalized) {
    var restBare = strip(restVocalized);
    var first = restBare.charAt(0);
    if (prefix === "ال" || prefix.slice(-2) === "ال") {
      var head = prefix.slice(0, prefix.length - 2);
      var article = "الْ";
      if (SUN.indexOf(first) !== -1) {
        article = "ال" + first + "\u0651";
        restVocalized = restVocalized.replace(new RegExp("^" + first), "");
      }
      var headMap = { و: "وَ", ف: "فَ", ب: "بِ", ك: "كَ", "": "" };
      return (headMap[head] || head) + article + restVocalized;
    }
    var simple = { و: "وَ", ف: "فَ", ب: "بِ", ك: "كَ", ل: "لِ", لل: "لِلْ" };
    if (simple[prefix]) return simple[prefix] + restVocalized;
    return prefix + restVocalized;
  }

  function tashkilLocal(text) {
    if (!text || !String(text).trim()) {
      return { text: "", source: "empty" };
    }
    var parts = String(text).split(/(\s+)/);
    var out = parts.map(function (chunk) {
      if (!chunk || /^\s+$/.test(chunk)) return chunk;
      var punct = "";
      var core = chunk.replace(/[.,!?؟،؛:«»"'\-()[\]]+$/g, function (m) {
        punct = m;
        return "";
      });
      if (!core) return chunk;
      if (HARAKAT.test(core) && strip(core) !== core) {
        return core + punct;
      }
      var found = lookupWord(core);
      if (found) return found + punct;
      var split = splitPrefix(core);
      if (split.prefix) {
        var inner = lookupWord(split.rest);
        if (inner) return vocalizePrefix(split.prefix, inner) + punct;
      }
      return core + punct;
    });
    return { text: out.join(""), source: "local" };
  }

  function joinMishkal(result) {
    if (typeof result === "string") return result;
    if (!Array.isArray(result)) return "";
    return result
      .map(function (item) {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.chosen || item.semi || "";
        return "";
      })
      .join(" ");
  }

  var api = {
    strip: strip,
    tashkilLocal: tashkilLocal,
    joinMishkal: joinMishkal,
    lookupWord: lookupWord
  };

  root.ArabikeyTashkil = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
