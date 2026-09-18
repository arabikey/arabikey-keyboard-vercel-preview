(function (root) {
  "use strict";

  var HARAKAT = /[\u064B-\u065F\u0670]/g;
  var HARAKA_ONE = /[\u064B-\u065F\u0670]/;
  var HARAKA_NO_SHADDA = /[\u064B-\u0650\u0652-\u065F\u0670]/g;
  var TANWIN = /[\u064B-\u064D]/;
  var CASE_HINT = /منصوب|مجرور|مرفوع|مضارع|ماضي|أمر/;
  var SUN = "تثدذرزسشصضطظلن";
  var PUNCT_TAIL = /[.,!?؟،؛:«»"'\-()[\]]+$/;

  function strip(s) {
    return String(s || "").replace(HARAKAT, "");
  }

  function skeleton(s) {
    return String(s || "").replace(HARAKA_NO_SHADDA, "");
  }

  function markCount(s) {
    return (String(s || "").match(HARAKAT) || []).length;
  }

  function lastEnding(s) {
    var m = String(s || "").match(/[^\u064B-\u065F\u0670]([\u064B-\u065F\u0670]+)$/);
    return m ? m[1] : "";
  }

  function graftEnding(stemForm, remoteForm) {
    var end = lastEnding(remoteForm);
    if (!end) return stemForm;
    return String(stemForm).replace(/[\u064B-\u065F\u0670]+$/, "") + end;
  }

  function splitPunct(chunk) {
    var punct = "";
    var core = String(chunk).replace(PUNCT_TAIL, function (m) {
      punct = m;
      return "";
    });
    return { core: core, punct: punct };
  }

  function lookupWord(raw) {
    var lex = root.ArabikeyLexicon;
    if (!lex) return null;
    var bare = strip(raw);
    if (lex.byArabic[bare]) return lex.byArabic[bare];
    if (lex.byArabic[raw]) return lex.byArabic[raw];
    return null;
  }

  function phraseList() {
    var lex = root.ArabikeyLexicon;
    if (!lex) return [];
    if (lex._tashkilPhrases) return lex._tashkilPhrases;
    var list = [];
    lex.entries.forEach(function (entry) {
      var bare = strip(entry.ar);
      if (bare.indexOf(" ") === -1) return;
      list.push({ parts: bare.split(/\s+/), t: entry.t });
    });
    list.sort(function (a, b) {
      return b.parts.length - a.parts.length;
    });
    lex._tashkilPhrases = list;
    return list;
  }

  function longestPhrase(wordInfos, start) {
    var phrases = phraseList();
    var max = wordInfos.length - start;
    for (var p = 0; p < phrases.length; p++) {
      var parts = phrases[p].parts;
      if (parts.length > max) continue;
      var ok = true;
      for (var i = 0; i < parts.length; i++) {
        if (wordInfos[start + i].bare !== parts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { len: parts.length, text: phrases[p].t };
    }
    return null;
  }

  function splitPrefix(word) {
    var bare = strip(word);
    var prefixes = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل"];
    for (var i = 0; i < prefixes.length; i++) {
      var pref = prefixes[i];
      if (bare.indexOf(pref) === 0 && bare.length > pref.length + 1) {
        return { prefix: pref, rest: bare.slice(pref.length) };
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

  function preferForm(lex, remote, inflect) {
    if (!lex) return remote || "";
    if (!remote) return lex;
    if (strip(lex) !== strip(remote)) return lex;

    if (skeleton(lex) !== skeleton(remote)) {
      return graftEnding(lex, remote);
    }

    if (/^Verb:/.test(inflect || "") && TANWIN.test(lex) && !TANWIN.test(remote)) {
      return lex;
    }

    if (CASE_HINT.test(inflect || "")) return remote;

    return markCount(remote) >= markCount(lex) ? remote : lex;
  }

  function pickRemoteForm(item) {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.chosen || item.semi || "";
  }

  function alreadyVocalized(core) {
    return HARAKA_ONE.test(core) && strip(core) !== core;
  }

  function resolveWord(core, item) {
    if (!core) return "";
    if (alreadyVocalized(core)) return core;
    var remote = pickRemoteForm(item);
    var lex = lookupWord(core);
    if (lex || remote) return preferForm(lex, remote, item && item.inflect);
    var split = splitPrefix(core);
    if (split.prefix) {
      var inner = lookupWord(split.rest);
      if (inner) return vocalizePrefix(split.prefix, inner);
    }
    return core;
  }

  function wordInfosFrom(text) {
    var segs = String(text).split(/(\s+)/);
    var words = [];
    segs.forEach(function (chunk, idx) {
      if (!chunk || /^\s+$/.test(chunk)) return;
      var bits = splitPunct(chunk);
      words.push({
        idx: idx,
        core: bits.core,
        punct: bits.punct,
        bare: strip(bits.core)
      });
    });
    return { segs: segs, words: words };
  }

  function applyPhrasesAndWords(text, itemForBare) {
    var pack = wordInfosFrom(text);
    var consumed = Object.create(null);

    pack.words.forEach(function (info, w) {
      if (consumed[w]) return;
      if (!info.core) {
        pack.segs[info.idx] = info.punct;
        return;
      }
      if (alreadyVocalized(info.core)) {
        pack.segs[info.idx] = info.core + info.punct;
        return;
      }

      var phrase = longestPhrase(pack.words, w);
      if (phrase) {
        pack.segs[info.idx] = phrase.text + pack.words[w + phrase.len - 1].punct;
        for (var k = 1; k < phrase.len; k++) {
          consumed[w + k] = true;
          var other = pack.words[w + k];
          var spaceIdx = other.idx - 1;
          if (spaceIdx >= 0 && /^\s+$/.test(pack.segs[spaceIdx])) pack.segs[spaceIdx] = "";
          pack.segs[other.idx] = "";
        }
        return;
      }

      var item = itemForBare && (itemForBare[info.bare] || itemForBare[strip(info.core)]);
      pack.segs[info.idx] = resolveWord(info.core, item) + info.punct;
    });

    return pack.segs.join("");
  }

  function tashkilLocal(text) {
    if (!text || !String(text).trim()) {
      return { text: "", source: "empty" };
    }
    return { text: applyPhrasesAndWords(text, null), source: "local" };
  }

  function indexMishkalItems(items) {
    var map = Object.create(null);
    if (!Array.isArray(items)) return map;
    items.forEach(function (item) {
      var form = pickRemoteForm(item);
      var bare = strip(form);
      if (bare) map[bare] = item;
      if (item && item.suggest) {
        String(item.suggest).split(";").forEach(function (alt) {
          var altBare = strip(alt);
          if (altBare && !map[altBare]) map[altBare] = item;
        });
      }
    });
    return map;
  }

  function joinMishkal(result) {
    if (typeof result === "string") return result;
    if (!Array.isArray(result)) return "";
    return result
      .map(function (item) {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return pickRemoteForm(item);
        return "";
      })
      .join(" ");
  }

  function refineRemote(original, data) {
    var fallback = tashkilLocal(original).text || original || "";
    if (!data) return fallback;
    if (typeof data.result === "string") {
      var overlay = applyPhrasesAndWords(original, null);
      var remoteWords = String(data.result).trim().split(/\s+/);
      var pack = wordInfosFrom(original);
      if (remoteWords.length === pack.words.length) {
        var mapped = Object.create(null);
        pack.words.forEach(function (info, i) {
          mapped[info.bare] = { chosen: remoteWords[i], inflect: "" };
        });
        return applyPhrasesAndWords(original, mapped) || overlay;
      }
      return overlay || String(data.result).trim();
    }
    if (Array.isArray(data.result)) {
      return applyPhrasesAndWords(original, indexMishkalItems(data.result)) || fallback;
    }
    return fallback;
  }

  var api = {
    strip: strip,
    skeleton: skeleton,
    preferForm: preferForm,
    tashkilLocal: tashkilLocal,
    joinMishkal: joinMishkal,
    refineRemote: refineRemote,
    lookupWord: lookupWord
  };

  root.ArabikeyTashkil = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
