/* jsnes emulator frontend.
 * Emulator core: https://github.com/bfirsh/jsnes (loaded via CDN)
 * ROM source: https://github.com/game7k7k/game_rom
 */
(function () {
  "use strict";

  var gameListEl = document.getElementById("game-list");
  var statusEl = document.getElementById("status");
  var progressEl = document.getElementById("progress");
  var progressBarEl = document.getElementById("progress-bar");
  var btnPause = document.getElementById("btn-pause");
  var btnReset = document.getElementById("btn-reset");
  var btnMute = document.getElementById("btn-mute");
  var btnShot = document.getElementById("btn-shot");
  var btnFullscreen = document.getElementById("btn-fullscreen");
  var btnRemap = document.getElementById("btn-remap");
  var keymapPanel = document.getElementById("keymap-panel");
  var keymapList = document.getElementById("keymap-list");
  var btnKeysReset = document.getElementById("btn-keys-reset");
  var keysP1 = document.getElementById("keys-p1");
  var keysP2 = document.getElementById("keys-p2");
  var tabP1 = document.getElementById("tab-p1");
  var tabP2 = document.getElementById("tab-p2");
  var fileInput = document.getElementById("file-input");
  var screenContainer = document.getElementById("screen-container");

  var games = [];
  var currentGameId = null;
  var browser = null;
  var running = false;
  var muted = false;
  var audioCtxState = null;

  // ROM 数据源：GitHub 直连 / jsDelivr 镜像 / Gitee（经开放 API 的 base64 接口，
  // 因 Gitee 文件直链无跨域头，浏览器无法直接读取）
  var SOURCES = {
    github: { label: "GitHub", type: "direct", base: "https://raw.githubusercontent.com/game7k7k/game_rom/master/" },
    jsdelivr: { label: "jsDelivr", type: "direct", base: "https://cdn.jsdelivr.net/gh/game7k7k/game_rom@master/" },
    gitee: { label: "Gitee", type: "gitee-api", api: "https://gitee.com/api/v5/repos/dengdejin/game_rom/contents/" },
  };

  function getSource() {
    try {
      if (window.__getSource) {
        var s = window.__getSource();
        if (SOURCES[s]) return s;
      }
    } catch (e) {
      /* noop */
    }
    return "github";
  }

  function romURL(g) {
    return SOURCES[getSource()].base + encodeURIComponent(g.file);
  }

  function pageParams(id) {
    var lang = "en";
    try {
      if (window.__getLang) lang = window.__getLang();
    } catch (e) {
      /* noop */
    }
    return "?game=" + encodeURIComponent(id) + "&lang=" + lang + "&source=" + getSource();
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.className = isError ? "error" : "";
  }

  function showProgress(show, pct) {
    progressEl.style.display = show ? "block" : "none";
    if (typeof pct === "number") progressBarEl.style.width = pct + "%";
  }

  function initBrowser() {
    if (browser) return browser;
    if (typeof jsnes === "undefined" || !jsnes.Browser) {
      setStatus(__t("s.cdn"), true);
      return null;
    }
    // jsnes.Browser handles canvas / audio / keyboard / gamepad automatically.
    // See: https://github.com/bfirsh/jsnes#browser
    browser = new jsnes.Browser({
      container: screenContainer,
      onError: function (e) {
        console.error(e);
        setStatus(__t("s.err") + (e && e.message ? e.message : e), true);
      },
    });
    window.addEventListener("resize", function () {
      try {
        browser.fitInParent();
      } catch (e) {
        /* noop */
      }
    });
    // 用本机已保存的键位刷新页面下方键盘说明
    refreshHelp();
    return browser;
  }

  function titleOf(g) {
    if (window.__gameTitle) return window.__gameTitle(g);
    return g.title;
  }

  function renderList() {
    gameListEl.innerHTML = "";
    games.forEach(function (g) {
      var b = document.createElement("div");
      b.className = "game-item" + (g.id === currentGameId ? " active" : "");
      b.dataset.id = g.id;
      var play = document.createElement("button");
      play.className = "game-play";
      var t = document.createElement("div");
      t.className = "t";
      t.textContent = titleOf(g);
      var d = document.createElement("div");
      d.className = "d";
      d.textContent = window.__gameDesc ? window.__gameDesc(g) : g.desc || g.file;
      play.appendChild(t);
      play.appendChild(d);
      play.addEventListener("click", function () {
        loadGame(g.id);
      });
      var gl = document.createElement("a");
      gl.className = "game-guide";
      gl.href = "guide.html" + pageParams(g.id);
      gl.textContent = window.__t ? window.__t("guide.link") : "Guide";
      b.appendChild(play);
      b.appendChild(gl);
      gameListEl.appendChild(b);
    });
    injectGameListLD();
  }

  function setLDJSON(id, data) {
    try {
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = id;
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    } catch (e) {
      /* noop */
    }
  }

  function injectGameListLD() {
    try {
      var items = games.map(function (g, i) {
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "VideoGame",
            name: g.title,
            url: "https://game7k7k.github.io/guide.html?game=" + encodeURIComponent(g.id),
          },
        };
      });
      setLDJSON("ld-games", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items,
      });
    } catch (e) {
      /* noop */
    }
  }

  function findGame(id) {    for (var i = 0; i < games.length; i++) {
      if (games[i].id === id) return games[i];
    }
    return null;
  }

  function updateButtons() {
    btnPause.disabled = !browser || !currentGameId;
    btnReset.disabled = !browser || !currentGameId;
    btnPause.textContent = running ? __t("tb.pause") : __t("tb.resume");
  }

  async function fetchGiteeFile(file) {
    var res = await fetch(SOURCES.gitee.api + encodeURIComponent(file));
    if (!res.ok) throw new Error(__t("s.romHttp") + res.status);
    var j = await res.json();
    if (!j || j.encoding !== "base64" || !j.content) {
      throw new Error(__t("s.romParse") + "bad Gitee API response");
    }
    var bin = atob(String(j.content).replace(/\s+/g, ""));
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  }

  // 按当前数据源加载 ROM：直接下载，失败时再用官方 XHR 方式重试一次
  async function loadROMData(g, onProgress) {
    if (getSource() === "gitee") return fetchGiteeFile(g.file);
    var url = romURL(g);
    try {
      return await fetchROM(url, onProgress);
    } catch (e) {
      return await new Promise(function (resolve, reject) {
        jsnes.Browser.loadROMFromURL(url, function (err, data) {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }
  }

  async function fetchROM(url, onProgress) {
    var res = await fetch(url);
    if (!res.ok) throw new Error(__t("s.romHttp") + res.status);
    var total = Number(res.headers.get("Content-Length")) || 0;
    var reader = res.body.getReader();
    var chunks = [];
    var received = 0;
    for (;;) {
      var r = await reader.read();
      if (r.done) break;
      chunks.push(r.value);
      received += r.value.length;
      if (total) onProgress(Math.round((received / total) * 100));
      else onProgress(null);
    }
    var buf = new Uint8Array(received);
    var off = 0;
    chunks.forEach(function (c) {
      buf.set(c, off);
      off += c.length;
    });
    return buf.buffer;
  }

  async function loadGame(id) {
    var g = findGame(id);
    if (!g) return;
    currentGameId = id;
    renderList();
    if (!initBrowser()) return;
    setStatus(__t("s.loadingGame", { name: titleOf(g) }));
    showProgress(true, 0);
    updateButtons();
    try {
      var data = await loadROMData(g, function (pct) {
        if (pct != null) showProgress(true, pct);
      });
      showProgress(false, 100);
      browser.loadROM(data);
      running = true;
      try {
        var u = new URL(window.location.href);
        u.searchParams.set("game", id);
        u.searchParams.set("source", getSource());
        window.history.replaceState(null, "", u.toString());
      } catch (e) {
        /* ignore */
      }
      setStatus(__t("s.running", { name: titleOf(g) }));
    } catch (e) {
      console.error(e);
      showProgress(false, 100);
      setStatus(__t("s.loadFail", { msg: e.message }), true);
    }
    updateButtons();
  }

  function loadLocalFile(file) {
    if (!file) return;
    if (!initBrowser()) return;
    var reader = new FileReader();
    setStatus(__t("s.readingLocal", { name: file.name }));
    reader.onload = function () {
      try {
        browser.loadROM(reader.result);
        currentGameId = "__local__";
        running = true;
        setStatus(__t("s.runningLocal", { name: file.name }));
        renderList();
      } catch (e) {
        setStatus(__t("s.romParse") + e.message, true);
      }
      updateButtons();
    };
    reader.onerror = function () {
      setStatus(__t("s.localReadFail"), true);
    };
    reader.readAsArrayBuffer(file);
  }

  // ---- toolbar ----
  btnPause.addEventListener("click", function () {
    if (!browser) return;
    if (running) {
      browser.stop();
      running = false;
      setStatus(__t("s.paused"));
    } else {
      browser.start();
      running = true;
      setStatus(__t("s.resumed"));
    }
    updateButtons();
  });

  btnReset.addEventListener("click", function () {
    if (!browser || !browser.nes) return;
    try {
      browser.nes.reset();
      setStatus(__t("s.resetDone"));
    } catch (e) {
      setStatus(__t("s.resetFail") + e.message, true);
    }
  });

  btnMute.addEventListener("click", function () {
    // jsnes.Browser 没有暴露静音 API，这里通过 WebAudio suspend/resume 实现
    muted = !muted;
    try {
      // 直接操作 speaker 的 AudioContext（内部字段，不同版本命名可能不同，做兼容）
      var ctx =
        (browser && browser._speakers && (browser._speakers.context || browser._speakers.audioContext)) ||
        null;
      if (ctx) {
        if (muted) ctx.suspend();
        else ctx.resume();
      }
    } catch (e) {
      /* noop */
    }
    btnMute.textContent = muted ? __t("tb.unmute") : __t("tb.mute");
  });

  btnShot.addEventListener("click", function () {
    if (!browser) return;
    try {
      var img = browser.screenshot();
      var a = document.createElement("a");
      a.href = img.src;
      a.download = (currentGameId || "nes") + ".png";
      a.click();
    } catch (e) {
      setStatus(__t("s.shotFail") + e.message, true);
    }
  });

  btnFullscreen.addEventListener("click", function () {
    var el = screenContainer;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
    } catch (e) {
      setStatus(__t("s.fsFail") + e.message, true);
    }
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) loadLocalFile(fileInput.files[0]);
    fileInput.value = "";
  });

  // ---- touch controls (player 1) ----
  function bindHold(el, player, btn) {
    function down(e) {
      e.preventDefault();
      if (!browser || !browser.nes) return;
      try {
        browser.nes.buttonDown(player, btn);
      } catch (err) {
        /* noop */
      }
    }
    function up(e) {
      e.preventDefault();
      if (!browser || !browser.nes) return;
      try {
        browser.nes.buttonUp(player, btn);
      } catch (err) {
        /* noop */
      }
    }
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up, { passive: false });
  }

  function initTouch() {
    if (!window.jsnes || !jsnes.Controller) return;
    var C = jsnes.Controller;
    var map = [
      ["t-up", 1, C.BUTTON_UP],
      ["t-down", 1, C.BUTTON_DOWN],
      ["t-left", 1, C.BUTTON_LEFT],
      ["t-right", 1, C.BUTTON_RIGHT],
      ["t-a", 1, C.BUTTON_A],
      ["t-b", 1, C.BUTTON_B],
      ["t-start", 1, C.BUTTON_START],
      ["t-select", 1, C.BUTTON_SELECT],
    ];
    map.forEach(function (m) {
      var el = document.getElementById(m[0]);
      if (el) bindHold(el, m[1], m[2]);
    });
  }

  // ---- key remapping（改键，P1/P2）
  // jsnes 按键表结构：{ keyCode: [player, button, label] }，
  // 经 browser.keyboard.setKeys() 写入 localStorage 持久化。
  var KEY_ACTIONS = [
    { id: "p1-up", group: "P1", labelKey: "key.up", player: 1, btn: "BUTTON_UP", defCode: 87, defName: "W" },
    { id: "p1-down", group: "P1", labelKey: "key.down", player: 1, btn: "BUTTON_DOWN", defCode: 83, defName: "S" },
    { id: "p1-left", group: "P1", labelKey: "key.left", player: 1, btn: "BUTTON_LEFT", defCode: 65, defName: "A" },
    { id: "p1-right", group: "P1", labelKey: "key.right", player: 1, btn: "BUTTON_RIGHT", defCode: 68, defName: "D" },
    { id: "p1-a", group: "P1", labelKey: "key.a", player: 1, btn: "BUTTON_A", defCode: 85, defName: "U" },
    { id: "p1-b", group: "P1", labelKey: "key.b", player: 1, btn: "BUTTON_B", defCode: 73, defName: "I" },
    { id: "p1-turboA", group: "P1", labelKey: "key.turboA", player: 1, btn: "BUTTON_TURBO_A", defCode: 75, defName: "K" },
    { id: "p1-turboB", group: "P1", labelKey: "key.turboB", player: 1, btn: "BUTTON_TURBO_B", defCode: 74, defName: "J" },
    { id: "p1-start", group: "P1", labelKey: "key.start", player: 1, btn: "BUTTON_START", defCode: 13, defName: "Enter" },
    { id: "p1-select", group: "P1", labelKey: "key.select", player: 1, btn: "BUTTON_SELECT", defCode: 17, defName: "Right Ctrl" },
    { id: "p2-up", group: "P2", labelKey: "key.up", player: 2, btn: "BUTTON_UP", defCode: 38, defName: "Up" },
    { id: "p2-down", group: "P2", labelKey: "key.down", player: 2, btn: "BUTTON_DOWN", defCode: 40, defName: "Down" },
    { id: "p2-left", group: "P2", labelKey: "key.left", player: 2, btn: "BUTTON_LEFT", defCode: 37, defName: "Left" },
    { id: "p2-right", group: "P2", labelKey: "key.right", player: 2, btn: "BUTTON_RIGHT", defCode: 39, defName: "Right" },
    { id: "p2-a", group: "P2", labelKey: "key.a", player: 2, btn: "BUTTON_A", defCode: 103, defName: "Num-7" },
    { id: "p2-b", group: "P2", labelKey: "key.b", player: 2, btn: "BUTTON_B", defCode: 105, defName: "Num-9" },
    { id: "p2-turboA", group: "P2", labelKey: "key.turboA", player: 2, btn: "BUTTON_TURBO_A", defCode: null, defName: null },
    { id: "p2-turboB", group: "P2", labelKey: "key.turboB", player: 2, btn: "BUTTON_TURBO_B", defCode: null, defName: null },
    { id: "p2-start", group: "P2", labelKey: "key.start", player: 2, btn: "BUTTON_START", defCode: 97, defName: "Num-1" },
    { id: "p2-select", group: "P2", labelKey: "key.select", player: 2, btn: "BUTTON_SELECT", defCode: 99, defName: "Num-3" },
  ];
  var capturingActionId = null;
  var keymapTab = "P1"; // 改键面板当前页：P1 / P2

  // 与 jsnes 官方默认键表保持一致（含 P2 与欧版 Y 键，恢复默认时一并还原）
  function defaultKeys() {
    var C = jsnes.Controller;
    return {
      87: [1, C.BUTTON_UP, "W"],
      83: [1, C.BUTTON_DOWN, "S"],
      65: [1, C.BUTTON_LEFT, "A"],
      68: [1, C.BUTTON_RIGHT, "D"],
      85: [1, C.BUTTON_A, "U"],
      73: [1, C.BUTTON_B, "I"],
      89: [1, C.BUTTON_B, "Y"],
      75: [1, C.BUTTON_TURBO_A, "K"],
      74: [1, C.BUTTON_TURBO_B, "J"],
      17: [1, C.BUTTON_SELECT, "Right Ctrl"],
      13: [1, C.BUTTON_START, "Enter"],
      103: [2, C.BUTTON_A, "Num-7"],
      105: [2, C.BUTTON_B, "Num-9"],
      99: [2, C.BUTTON_SELECT, "Num-3"],
      97: [2, C.BUTTON_START, "Num-1"],
      38: [2, C.BUTTON_UP, "Up"],
      40: [2, C.BUTTON_DOWN, "Down"],
      37: [2, C.BUTTON_LEFT, "Left"],
      39: [2, C.BUTTON_RIGHT, "Right"],
    };
  }

  // jsnes 手柄按钮编号（实测 2.1.0 构建；CDN 失败时兜底，保证帮助区可渲染）
  var BTN_NUM = {
    BUTTON_A: 0,
    BUTTON_B: 1,
    BUTTON_SELECT: 2,
    BUTTON_START: 3,
    BUTTON_UP: 4,
    BUTTON_DOWN: 5,
    BUTTON_LEFT: 6,
    BUTTON_RIGHT: 7,
    BUTTON_TURBO_A: 8,
    BUTTON_TURBO_B: 9,
  };

  function buttonConst(name) {
    try {
      if (jsnes && jsnes.Controller && jsnes.Controller[name] != null) return jsnes.Controller[name];
    } catch (e) {
      /* noop */
    }
    return BTN_NUM[name];
  }

  // 查出 keys 表中 (player, button) 对应的 keyCode
  function findCode(keys, player, btn) {
    var found = null;
    Object.keys(keys).forEach(function (code) {
      var k = keys[code];
      if (k && k[0] === player && k[1] === btn) found = Number(code);
    });
    return found;
  }

  function keyEventName(e) {
    var k = e.key;
    if (k === " ") return "Space";
    if (k === "ArrowUp") return "Up";
    if (k === "ArrowDown") return "Down";
    if (k === "ArrowLeft") return "Left";
    if (k === "ArrowRight") return "Right";
    if (k === "Control") return "Ctrl";
    if (k && k.length === 1) return k.toUpperCase();
    return k || ("Key" + e.keyCode);
  }

  function renderKeymap() {
    if (!browser) return;
    var keys = browser.keyboard.keys || {};
    if (tabP1) tabP1.className = keymapTab === "P1" ? "active" : "";
    if (tabP2) tabP2.className = keymapTab === "P2" ? "active" : "";
    keymapList.innerHTML = "";
    KEY_ACTIONS.forEach(function (a) {
      if (a.group !== keymapTab) return;
      renderKeymapRow(a, keys);
    });
    renderKeysHelp(keys);
  }

  function boundOrDefault(keys, a) {
    var code = findCode(keys, a.player, buttonConst(a.btn));
    if (code != null && keys[code]) return keys[code][2];
    return a.defName != null ? a.defName : __t("key.unbound");
  }

  function renderKeymapRow(a, keys) {
      var code = findCode(keys, a.player, buttonConst(a.btn));
      var name = boundOrDefault(keys, a);
      var row = document.createElement("div");
      row.className = "keymap-row";
      var lab = document.createElement("span");
      lab.textContent = __t(a.labelKey);
      var btn = document.createElement("button");
      btn.dataset.action = a.id;
      if (capturingActionId === a.id) {
        btn.className = "waiting";
        btn.textContent = __t("km.press");
      } else {
        var kbd = document.createElement("kbd");
        kbd.textContent = name + (code != null ? " (" + code + ")" : "");
        btn.appendChild(kbd);
        btn.appendChild(document.createTextNode(__t("km.edit")));
      }
      btn.addEventListener("click", function () {
        capturingActionId = a.id;
        renderKeymap();
      });
      row.appendChild(lab);
      row.appendChild(btn);
      keymapList.appendChild(row);
  }

  // 让页面下方键盘说明始终与实际绑定一致
  function renderKeysHelp(keys) {
    renderKeysHelpGroup(keys, 1, keysP1, [
      ["dir", "key.dir"],
      ["a", "key.a"],
      ["b", "key.b"],
      ["start", "key.start"],
      ["select", "key.select"],
      ["turboA", "key.turboA"],
      ["turboB", "key.turboB"],
    ]);
    renderKeysHelpGroup(keys, 2, keysP2, [
      ["dir", "key.dir"],
      ["a", "key.a"],
      ["b", "key.b"],
      ["start", "key.start"],
      ["select", "key.select"],
      ["turboA", "key.turboA"],
      ["turboB", "key.turboB"],
    ]);
  }

  function renderKeysHelpGroup(keys, player, el, items) {
    if (!el) return;
    function namesOf(shortId) {
      var out = [];
      KEY_ACTIONS.forEach(function (x) {
        if (x.player !== player) return;
        if (shortId === "dir") {
          if (/-(up|down|left|right)$/.test(x.id)) out.push(boundName(keys, x));
        } else if (x.id === "p" + player + "-" + shortId) {
          out.push(boundName(keys, x));
        }
      });
      return out;
    }
    function boundName(keys, a) {
      return boundOrDefault(keys, a);
    }
    el.innerHTML = "";
    items.forEach(function (it, i) {
      var arr = namesOf(it[0]);
      // 全未绑定的项（如 P2 连发键默认）不展示
      if (arr.length > 0 && arr.every(function (n) { return n === __t("key.unbound"); })) return;
      var names = arr.join("/");
      var kbd = document.createElement("kbd");
      kbd.textContent = names;
      el.appendChild(kbd);
      el.appendChild(document.createTextNode(" " + __t(it[1]) + (i < items.length - 1 ? "   " : "")));
    });
  }

  // 无需模拟器即可按默认值渲染帮助区（首屏 / CDN 失败时兜底）
  function buildDefaultKeys() {
    var keys = {};
    KEY_ACTIONS.forEach(function (a) {
      if (a.defCode != null) keys[a.defCode] = [a.player, buttonConst(a.btn), a.defName];
    });
    return keys;
  }

  function refreshHelp() {
    try {
      if (browser) renderKeysHelp(browser.keyboard.keys || {});
      else renderKeysHelp(buildDefaultKeys());
    } catch (e) {
      /* noop */
    }
  }

  // 捕获阶段拦截：绑键时不让按键透传给模拟器
  document.addEventListener(
    "keydown",
    function (e) {
      if (!capturingActionId || !browser) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        capturingActionId = null;
        renderKeymap();
        return;
      }
      var action = null;
      KEY_ACTIONS.forEach(function (x) {
        if (x.id === capturingActionId) action = x;
      });
      if (!action) {
        capturingActionId = null;
        renderKeymap();
        return;
      }
      var btn = buttonConst(action.btn);
      var keys = browser.keyboard.keys || {};
      // 同一 keyCode 旧归属清掉
      delete keys[e.keyCode];
      // 该动作的旧绑定清掉，避免一键多绑（只清理同一手柄）
      Object.keys(keys).forEach(function (code) {
        var k = keys[code];
        if (k && k[0] === action.player && k[1] === btn) delete keys[code];
      });
      keys[e.keyCode] = [action.player, btn, keyEventName(e)];
      browser.keyboard.setKeys(keys);
      capturingActionId = null;
      renderKeymap();
      setStatus(__t("s.bound", { group: action.group, label: __t(action.labelKey), key: keyEventName(e) }));
    },
    true
  );

  if (btnRemap) {
    btnRemap.addEventListener("click", function () {
      if (!initBrowser()) return;
      var hidden = keymapPanel.hasAttribute("hidden");
      if (hidden) {
        keymapPanel.removeAttribute("hidden");
        renderKeymap();
      } else {
        capturingActionId = null;
        keymapPanel.setAttribute("hidden", "");
      }
    });
  }

  if (tabP1) {
    tabP1.addEventListener("click", function () {
      keymapTab = "P1";
      capturingActionId = null;
      renderKeymap();
    });
  }
  if (tabP2) {
    tabP2.addEventListener("click", function () {
      keymapTab = "P2";
      capturingActionId = null;
      renderKeymap();
    });
  }

  if (btnKeysReset) {
    btnKeysReset.addEventListener("click", function () {
      if (!browser) return;
      capturingActionId = null;
      browser.keyboard.setKeys(defaultKeys());
      renderKeymap();
      setStatus(__t("s.keysReset"));
    });
  }

  // ---- boot ----
  fetch("games.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("games.json HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      games = data;
      var q = null;
      try {
        q = new URL(window.location.href).searchParams.get("game");
      } catch (e) {
        /* noop */
      }
      renderList();
      updateButtons();
      initTouch();
      if (q && findGame(q)) {
        loadGame(q);
      } else if (games.length > 0) {
        // 默认选中第一个，但不自动开始（等待用户手势以允许 AudioContext 播放声音）
        currentGameId = games[0].id;
        renderList();
        setStatus(__t("status.selectFirst"));
        var startBtn = document.getElementById("btn-start");
        if (startBtn) startBtn.style.display = "";
      }
    })
    .catch(function (e) {
      console.error(e);
      setStatus(__t("s.listFail") + e.message, true);
    });

  var startBtn = document.getElementById("btn-start");
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (currentGameId && currentGameId !== "__local__") loadGame(currentGameId);
    });
  }

  // 数据源切换时：有运行中的游戏则从新源重载，否则仅刷新列表链接
  window.__onSourceChange = function () {
    if (currentGameId && currentGameId !== "__local__" && findGame(currentGameId)) {
      loadGame(currentGameId);
    } else {
      renderList();
    }
  };

  // 语言切换时重渲染动态文案（静态文案由 i18n.js 统一处理）
  window.__onLangChange = function () {
    renderList();
    refreshHelp();
    if (browser && keymapPanel && !keymapPanel.hasAttribute("hidden")) renderKeymap();
    btnMute.textContent = muted ? __t("tb.unmute") : __t("tb.mute");
    updateButtons();
  };

  refreshHelp();
  updateButtons();
})();
