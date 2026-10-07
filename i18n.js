/* Simple i18n: English default, Chinese optional.
 * Language order: ?lang= URL param > localStorage > 'en'.
 */
(function () {
  "use strict";

  var DICT = {
    en: {
      "meta.title": "game7k7k · NES Online Emulator (jsnes)",
      "header.title": "🎮 game7k7k · NES Online Emulator",
      "header.sub": "Play instantly, no downloads. Keyboard / gamepad / touch supported.",
      "games.title": "Games",
      "more.games": "More games →",
      "local.title": "Local ROM",
      "local.choose": "Choose a .nes file",
      "local.note": "You can also load your own backup ROM file. It runs locally and is never uploaded.",
      "tb.start": "Start Game",
      "tb.pause": "Pause",
      "tb.resume": "Resume",
      "tb.reset": "Reset",
      "tb.mute": "Mute",
      "tb.unmute": "Unmute",
      "tb.shot": "Screenshot",
      "tb.full": "Fullscreen",
      "tb.remap": "Remap Keys",
      "status.loading": "Loading game list…",
      "status.selectFirst": "Select a game, then click Start Game",
      "km.title": "Custom Keys (P1 / P2)",
      "km.desc": "Click a key on the right, then press the new key. Press <kbd>Esc</kbd> to cancel. Changes apply instantly and are saved in this browser.",
      "tab.p1": "P1 Gamepad",
      "tab.p2": "P2 Gamepad",
      "km.reset": "Reset to defaults",
      "help.title": "Keyboard controls (click Remap Keys in the toolbar to customize P1 / P2)",
      "help.gamepad": "Standard gamepads work plug-and-play.",
      "key.up": "Up",
      "key.down": "Down",
      "key.left": "Left",
      "key.right": "Right",
      "key.a": "A",
      "key.b": "B",
      "key.turboA": "Turbo A",
      "key.turboB": "Turbo B",
      "key.start": "Start",
      "key.select": "Select",
      "key.dir": "Directions",
      "key.unbound": "Unbound",
      "km.press": "Press a key… (Esc cancels)",
      "km.edit": "Edit",
      "s.err": "Emulator error: ",
      "s.cdn": "Emulator core failed to load (CDN unreachable). Check your connection and refresh.",
      "s.loadingGame": "Loading {name} …",
      "s.running": "Running: {name} — click Remap Keys to customize",
      "s.paused": "Paused",
      "s.resumed": "Resumed",
      "s.resetDone": "Reset",
      "s.resetFail": "Reset failed: ",
      "s.shotFail": "Screenshot failed: ",
      "s.fsFail": "Fullscreen failed: ",
      "s.romHttp": "ROM download failed: HTTP ",
      "s.loadFail": "Load failed: {msg}. Check your connection or the ROM URL.",
      "s.romParse": "Failed to parse ROM: ",
      "s.readingLocal": "Reading local file {name} …",
      "s.runningLocal": "Running local ROM: {name}",
      "s.localReadFail": "Failed to read local file",
      "s.bound": "Bound: {group} {label} → {key}",
      "s.keysReset": "Keys reset to defaults",
      "s.listFail": "Failed to load game list: ",
      "lib.title": "🎮 Game Library",
      "lib.sub": "Click Play to jump back to the emulator and auto-load.",
      "lib.back": "← Back to Emulator",
      "lib.searchPh": "Search games…",
      "lib.loading": "Loading…",
      "lib.play": "Play",
      "lib.total": "{n} games",
      "lib.matched": ", {n} matched",
      "lib.none": "No matching games",
      "lib.fail": "Failed to load game list: ",
      "nav.games": "Games",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.privacy": "Privacy Policy",
      "nav.sitemap": "Sitemap",
      "guide.link": "📖 Guide",
      "guide.back": "← Back to Library",
      "guide.play": "Play Now",
      "guide.prev": "← Prev",
      "guide.next": "Next →",
      "guide.related": "Related games",
      "guide.notfound": "Guide not found. Pick a game from the library.",
      "guide.titleSuffix": "Guide",
      "meta.index": "Play NES games instantly in your browser. Remappable keys, gamepad and touch support, plus original play guides.",
      "meta.lib": "Browse all NES games with original play guides. Click Play to load instantly in the emulator.",
      "meta.guide": "Original NES play guide: overview, goal, controls and tips.",
      "meta.about": "About game7k7k NES emulator: instant browser play, original game guides, remappable controls.",
      "meta.contact": "Contact the game7k7k NES emulator team via GitHub issues.",
      "meta.privacy": "Privacy policy of the game7k7k NES emulator site.",
      "meta.sitemap": "Sitemap of the game7k7k NES emulator site: all pages and game guides.",
      "sitemap.h1": "\U0001F5FA️ Sitemap",
      "sitemap.pages": "Main pages",
      "sitemap.guides": "Game guides",
      "about.h1": "📖 About",
      "about.p1": "This site is an online NES emulator powered by the open-source jsnes core. Games run directly in your browser — no downloads or installs needed.",
      "about.p2": "Alongside instant play, we write an original play guide for every listed game, with remappable keyboard controls plus plug-and-play gamepad and touch buttons.",
      "about.p3": "ROM files come from the game_rom repository, and the emulator core is bfirsh/jsnes (Apache-2.0).",
      "contact.h1": "✉️ Contact",
      "contact.p1": "For gameplay questions, guide corrections, ROM suggestions, or ad inquiries, email us and we will reply as soon as possible.",
      "privacy.h1": "🔒 Privacy Policy",
      "privacy.data.h": "Local data",
      "privacy.data.p": "This site stores your language and key-mapping preferences in your browser's localStorage, only to remember your settings. Nothing is uploaded to any server.",
      "privacy.ads.h": "Ads & cookies",
      "privacy.ads.p": "This site plans to show Google AdSense ads. Google may use cookies to serve personalized ads; you can manage or opt out of personalization in Google Ads Settings.",
      "privacy.third.h": "Third-party resources",
      "privacy.third.p": "The emulator core and ROM files load via CDNs (unpkg, raw.githubusercontent.com), which are governed by their own privacy policies.",
      "privacy.contact.h": "Contact",
      "privacy.contact.p": "Questions about this policy? Reach us via the Contact page."
    },
    zh: {
      "meta.title": "game7k7k · NES 在线模拟器 (jsnes)",
      "header.title": "🎮 game7k7k · NES 在线模拟器",
      "header.sub": "打开即玩，无需下载。键盘 / 手柄 / 触屏均可操作。",
      "games.title": "游戏列表",
      "more.games": "更多游戏 →",
      "local.title": "本地 ROM",
      "local.choose": "选择 .nes 文件",
      "local.note": "也可以加载自己备份的 ROM 文件，仅在本地运行，不上传。",
      "tb.start": "开始游戏",
      "tb.pause": "暂停",
      "tb.resume": "继续",
      "tb.reset": "复位",
      "tb.mute": "静音",
      "tb.unmute": "取消静音",
      "tb.shot": "截图",
      "tb.full": "全屏",
      "tb.remap": "改键",
      "status.loading": "正在加载游戏列表...",
      "status.selectFirst": "选择游戏后点击「开始游戏」",
      "km.title": "自定义按键（P1 / P2）",
      "km.desc": "点击右侧按键，再按下键盘上的新按键即可绑定；按 <kbd>Esc</kbd> 取消。设置实时生效并保存在本机浏览器。",
      "tab.p1": "P1 手柄",
      "tab.p2": "P2 手柄",
      "km.reset": "恢复默认",
      "help.title": "键盘操作（点工具栏「改键」可修改 P1 / P2）",
      "help.gamepad": "支持标准手柄即插即玩。",
      "key.up": "上",
      "key.down": "下",
      "key.left": "左",
      "key.right": "右",
      "key.a": "A",
      "key.b": "B",
      "key.turboA": "连发 A",
      "key.turboB": "连发 B",
      "key.start": "Start",
      "key.select": "Select",
      "key.dir": "方向",
      "key.unbound": "未绑定",
      "km.press": "请按键…(Esc取消)",
      "km.edit": "修改",
      "s.err": "模拟器出错: ",
      "s.cdn": "模拟器内核加载失败（CDN 不可达），请检查网络后刷新页面",
      "s.loadingGame": "正在加载 {name} …",
      "s.running": "正在运行: {name} ｜ 点「改键」可自定义按键",
      "s.paused": "已暂停",
      "s.resumed": "继续运行",
      "s.resetDone": "已复位 (Reset)",
      "s.resetFail": "复位失败: ",
      "s.shotFail": "截图失败: ",
      "s.fsFail": "全屏失败: ",
      "s.romHttp": "ROM 下载失败: HTTP ",
      "s.loadFail": "加载失败: {msg}，请检查网络或 ROM 地址",
      "s.romParse": "ROM 解析失败: ",
      "s.readingLocal": "正在读取本地文件 {name} …",
      "s.runningLocal": "正在运行本地 ROM: {name}",
      "s.localReadFail": "本地文件读取失败",
      "s.bound": "已绑定：{group} {label} → {key}",
      "s.keysReset": "已恢复默认按键",
      "s.listFail": "游戏列表加载失败: ",
      "lib.title": "🎮 游戏列表",
      "lib.sub": "点击「开始游玩」跳回模拟器自动加载。",
      "lib.back": "← 返回模拟器",
      "lib.searchPh": "搜索游戏…",
      "lib.loading": "正在加载…",
      "lib.play": "开始游玩",
      "lib.total": "共 {n} 款",
      "lib.matched": "，命中 {n}",
      "lib.none": "没有匹配的游戏",
      "lib.fail": "游戏列表加载失败: ",
      "nav.games": "游戏列表",
      "nav.about": "关于",
      "nav.contact": "联系",
      "nav.privacy": "隐私政策",
      "nav.sitemap": "站点地图",
      "guide.link": "📖 攻略",
      "guide.back": "← 返回游戏列表",
      "guide.play": "开始游玩",
      "guide.prev": "← 上一篇",
      "guide.next": "下一篇 →",
      "guide.related": "相关游戏",
      "guide.notfound": "未找到该游戏的攻略，请从游戏列表进入。",
      "guide.titleSuffix": "攻略",
      "meta.index": "NES 在线模拟器，打开即玩，支持改键、手柄与触屏，并附原创游戏攻略。",
      "meta.lib": "浏览全部 NES 游戏与原创攻略，点击开始游玩即刻在模拟器中加载。",
      "meta.guide": "NES 原创游戏攻略：简介、目标、操作与技巧。",
      "meta.about": "关于 game7k7k NES 模拟器：免下载即玩、原创攻略、可改键。",
      "meta.contact": "通过 GitHub Issues 联系 game7k7k NES 模拟器团队。",
      "meta.privacy": "game7k7k NES 模拟器站点的隐私政策。",
      "meta.sitemap": "game7k7k NES 模拟器站点的站点地图：全部页面与游戏攻略。",
      "sitemap.h1": "\U0001F5FA️ 站点地图",
      "sitemap.pages": "主要页面",
      "sitemap.guides": "游戏攻略",
      "about.h1": "📖 关于本站",
      "about.p1": "本站是一个 NES 在线模拟器，基于开源 jsnes 内核，打开网页即可游玩，无需下载安装。",
      "about.p2": "除了即开即玩，我们还为每款收录游戏编写了原创玩法攻略，并支持键盘改键、手柄即插即玩与触屏按钮。",
      "about.p3": "ROM 文件来自 game_rom 仓库；模拟器内核来自 bfirsh/jsnes（Apache-2.0）。",
      "contact.h1": "✉️ 联系我们",
      "contact.p1": "玩法问题、攻略纠错、ROM 收录建议或广告合作，欢迎发邮件联系我们，我们会尽快回复。",
      "privacy.h1": "🔒 隐私政策",
      "privacy.data.h": "本地数据",
      "privacy.data.p": "本站把语言与按键偏好保存在你浏览器的 localStorage 中，仅用于记住设置，不会上传到任何服务器。",
      "privacy.ads.h": "广告与 Cookie",
      "privacy.ads.p": "本站计划展示 Google AdSense 广告。Google 可能会使用 Cookie 投放个性化广告，你可以在 Google 广告设置中管理或停用个性化广告。",
      "privacy.third.h": "第三方资源",
      "privacy.third.p": "模拟器内核与 ROM 文件通过 CDN（unpkg、raw.githubusercontent.com）加载，访问这些资源时适用其各自的隐私政策。",
      "privacy.contact.h": "联系",
      "privacy.contact.p": "如对本政策有疑问，请通过联系页留言。"
    }
  };

  var lang = "en";
  var SOURCE_IDS = ["github", "jsdelivr", "gitee"];
  var source = "github";
  try {
    var q = new URL(window.location.href).searchParams.get("lang");
    if (q === "en" || q === "zh") {
      lang = q;
      try {
        window.localStorage.setItem("lang", q);
      } catch (e2) {
        /* noop */
      }
    } else {
      var s = window.localStorage.getItem("lang");
      if (s === "en" || s === "zh") lang = s;
    }
    var qs = new URL(window.location.href).searchParams.get("source");
    if (SOURCE_IDS.indexOf(qs) >= 0) {
      source = qs;
      try {
        window.localStorage.setItem("rom_source", qs);
      } catch (e3) {
        /* noop */
      }
    } else {
      var ss = window.localStorage.getItem("rom_source");
      if (SOURCE_IDS.indexOf(ss) >= 0) source = ss;
    }
  } catch (e) {
    /* keep defaults */
  }

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key] != null ? DICT[lang][key] : DICT.en[key] != null ? DICT.en[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = String(s).split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  function gameDesc(g) {
    if (lang === "zh") return g.desc || g.desc_en || g.file;
    return g.desc_en || g.desc || g.file;
  }

  function gameTitle(g) {
    if (lang === "zh") return g.title_zh || g.title;
    return g.title;
  }

  function applyStatic() {
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute("data-i18n"));
    var htmls = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < htmls.length; j++) htmls[j].innerHTML = t(htmls[j].getAttribute("data-i18n-html"));
    var phs = document.querySelectorAll("[data-i18n-ph]");
    for (var k = 0; k < phs.length; k++) phs[k].setAttribute("placeholder", t(phs[k].getAttribute("data-i18n-ph")));
    var cts = document.querySelectorAll("[data-i18n-content]");
    for (var n = 0; n < cts.length; n++) cts[n].setAttribute("content", t(cts[n].getAttribute("data-i18n-content")));
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    var sels = document.querySelectorAll("select[data-langselect]");
    for (var m = 0; m < sels.length; m++) sels[m].value = lang;
    var ssrc = document.querySelectorAll("select[data-sourceselect]");
    for (var n2 = 0; n2 < ssrc.length; n2++) ssrc[n2].value = source;
  }

  function setLang(l) {
    if (l !== "en" && l !== "zh") return;
    lang = l;
    try {
      window.localStorage.setItem("lang", l);
    } catch (e) {
      /* noop */
    }
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("lang", l);
      window.history.replaceState(null, "", u.toString());
    } catch (e) {
      /* noop */
    }
    applyStatic();
    if (window.__onLangChange) window.__onLangChange();
  }

  function initSwitcher() {
    var sels = document.querySelectorAll("select[data-langselect]");
    for (var i = 0; i < sels.length; i++) {
      (function (s) {
        s.addEventListener("change", function () {
          setLang(s.value);
        });
      })(sels[i]);
    }
    var ssrc = document.querySelectorAll("select[data-sourceselect]");
    for (var j = 0; j < ssrc.length; j++) {
      (function (s) {
        s.addEventListener("change", function () {
          setSource(s.value);
        });
      })(ssrc[j]);
    }
  }

  function setSource(l) {
    if (SOURCE_IDS.indexOf(l) < 0) return;
    source = l;
    try {
      window.localStorage.setItem("rom_source", l);
    } catch (e) {
      /* noop */
    }
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("source", l);
      window.history.replaceState(null, "", u.toString());
    } catch (e) {
      /* noop */
    }
    applyStatic();
    if (window.__onSourceChange) window.__onSourceChange();
  }

  window.__t = t;
  window.__getLang = function () {
    return lang;
  };
  window.__setLang = setLang;
  window.__getSource = function () {
    return source;
  };
  window.__setSource = setSource;
  window.__gameDesc = gameDesc;
  window.__gameTitle = gameTitle;

  applyStatic();
  initSwitcher();
})();
