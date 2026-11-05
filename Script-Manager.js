// ==UserScript==
// @name         [JNY] Script Manager
// @namespace    https://github.com/LordThot/Info
// @version      1.0
// @description  loader for all user scripts I've found. currently bzn graphics does not work. i will work on adding and keeping the tool and chill scripts gate kept.please let me know if u find any bugs,scripts or create your own ones.
// @match        https://elgea.illyriad.co.uk/*
// @match        https://www.illyriad.co.uk/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      bazoon.town
// @connect      raw.githubusercontent.com
// @connect      v3.durctools.uk
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  // EARLY EXTERNAL GATE: must stay above startManager() and run at document-start.
  const STATE_KEY = 'illyriadScriptManager.state.v2';
  const DT_GATE_KEY = 'illyriadScriptManager.externalGate.durctools3.v1';
  const DT_HOSTS = new Set(['v3.durctools.uk', 'www.v3.durctools.uk']);
  let dtGateEnabled = false;
  try {
    const priorState = GM_getValue(STATE_KEY, null);
    // On a brand-new install, DT defaults ON so the visible button matches the first-load behaviour.
    // Existing saved state is authoritative, including an explicitly disabled DT entry.
    dtGateEnabled = priorState == null
      ? true
      : (Array.isArray(priorState.enabled) ? priorState.enabled.includes('durctools3') : true);
    GM_setValue(DT_GATE_KEY, dtGateEnabled);
  } catch (_) {
    dtGateEnabled = true;
  }

  function isDurcToolsScript(node) {
    if (!node || node.nodeType !== 1 || String(node.tagName).toLowerCase() !== 'script') return false;
    const src = node.src || (node.getAttribute && node.getAttribute('src')) || '';
    if (!src) return false;
    try { return DT_HOSTS.has(new URL(src, document.baseURI).hostname.toLowerCase()); }
    catch (_) { return /^https?:\/\/(?:www\.)?v3\.durctools\.uk(?:\/|$)/i.test(src); }
  }

  // Keep permission in memory; avoid storage reads for every script insertion.
  function shouldBlockDurcTools(node) {
    return !dtGateEnabled && isDurcToolsScript(node);
  }

  // Queue blocked DT script nodes so turning DT back on can release them without a page refresh.
  const pendingDurcToolsScripts = [];
  try {
    const appendChild = Node.prototype.appendChild;
    const insertBefore = Node.prototype.insertBefore;
    const replaceChild = Node.prototype.replaceChild;

    Node.prototype.appendChild = function(child) {
      if (shouldBlockDurcTools(child)) {
        pendingDurcToolsScripts.push({kind:'append', parent:this, child});
        return child;
      }
      return appendChild.apply(this, arguments);
    };
    Node.prototype.insertBefore = function(child, before) {
      if (shouldBlockDurcTools(child)) {
        pendingDurcToolsScripts.push({kind:'insert', parent:this, child, before});
        return child;
      }
      return insertBefore.apply(this, arguments);
    };
    Node.prototype.replaceChild = function(child, oldChild) {
      if (shouldBlockDurcTools(child)) {
        pendingDurcToolsScripts.push({kind:'replace', parent:this, child, oldChild});
        return oldChild;
      }
      return replaceChild.apply(this, arguments);
    };

    // Setting src alone does not execute a script; the insertion gate catches it when attached.
    // This also avoids stripping src from a script that needs to be queued for later release.
  } catch (_) {}

  function releaseBlockedDurcToolsScripts() {
    const queued = pendingDurcToolsScripts.splice(0, pendingDurcToolsScripts.length);
    for (const item of queued) {
      try {
        // Release only a still-valid script element whose src belongs to the exact DT host allowlist.
        if (!item.parent || !item.child || !isDurcToolsScript(item.child)) continue;
        if (item.kind === 'replace' && item.oldChild && item.oldChild.parentNode === item.parent) {
          item.parent.replaceChild(item.child, item.oldChild);
        } else if (item.kind === 'insert' && item.before && item.before.parentNode === item.parent) {
          item.parent.insertBefore(item.child, item.before);
        } else if (item.kind === 'append') {
          item.parent.appendChild(item.child);
        }
      } catch (_) {}
    }
  }

  const startManager = () => {
  const STATE_KEY = 'illyriadScriptManager.state.v2';
  const CATALOGUE_KEY = 'illyriadScriptManager.catalogue.v1';
  const MARKER_PREFIX = '__ism081_';
  const SUITE_ID = 'bzn';

  let catalogue = [
  {
    id: 'durctools',
    name: 'DurcTools (DT)',
    pinned: true,
    scripts: [
      {
        id: 'durctools3',
        name: 'DurcTools3',
        url: 'https://v3.durctools.uk/gm/DurcTools3.user.js',
        mode: 'external-gate',
        gateKey: 'illyriadScriptManager.externalGate.durctools3.v1'
      }
    ]
  },
  {
    id: 'bazoon-tools',
    name: 'Bazoon Tools',
    scripts: [
      { id:'bzn-buildlevel', name:'BZN Building Levels', url:'https://bazoon.town/js/BZNCODE_BUILDLEVEL.user.js' },
      { id:'bzn-fsp', name:'BZN Food Sov Overlay', url:'https://bazoon.town/js/BZNCODE_FSP.user.js' },
      { id:'bzn-tmg', name:'BZN Town Graphics', url:'https://github.com/LordThot/Info/blob/main/BZN%20Town%20Map%20Graphics' },
      { id:'bzn-tdr', name:'BZN Dropdown', url:'https://bazoon.town/js/BZNCODE_TDR.user.js' },
      { id:'bzn-opy', name:'BZN Occupy Preset', url:'https://bazoon.town/js/BZNCODE_OPY.user.js' },
      { id:'bzn-pbs', name:'BZN Prez Build Stats', url:'https://bazoon.town/js/BZNCODE_PBS.user.js' },
      { id:'bzn-upkeep', name:'BZN Resource Timer', url:'https://bazoon.town/js/BZNCODE_UPKEEP.user.js' },
      { id:'bzn-mp', name:'BZN Magic Pinning', url:'https://bazoon.town/js/BZNCODE_MP.user.js' },
      { id:'bzn-ali', name:'BZN Army Landing Info', url:'https://bazoon.town/js/BZNCODE_ALI.user.js' }
    ]
  },
  {
    id: 'jny-tools',
    name: 'JNY Tools',
    scripts: [
      { id:'jny-notifications-highlighter', name:'JNY Notifications Highlighter', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Notification-Highlighter' },
      { id:'jny-per-item-cost', name:'JNY Per Item Cost', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Mail-Per-Item-Cost' },
      { id:'jny-tax-slider-arrows', name:'JNY Tax Slider Arrows', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Tax-Slider-Fix' },
{ id:'cmd-max-level', name:'JNY Commander Max Level Possible', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/Max-Com-Possible' },
            { id:'jny-auto-open-spell', name:'JNY Auto Open Spell', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-AutoOpen-Spell' }
    ]
  },
  {
    id: 'others',
    name: 'Others',
    scripts: [
      { id:'linkify', name:'Linkify', url:'https://raw.githubusercontent.com/LordThot/Info/main/linkify' },

{ id:'jny-ans', name:'Anatomy Name Shortner', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/AnatShortner.js' },
{ id:'jah-auto-covert', name:'Jah Auto-Covert', url:'https://raw.githubusercontent.com/LordThot/Info/main/Jah%20AutoCovert.js' }, { id:'luper-notes', name:'Luper Notes', url:'https://raw.githubusercontent.com/LordThot/Info/main/LuperNotes.user.js' }
    ]
  },
  {
    id: 'mobile-fixes',
    name: 'Mobile Fixes',
    scripts: [
      { id:'jny-zoomfix', name:'JNY ZoomFix', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Map-Fix' },
      { id:'jny-move-logout', name:'JNY Move Logout', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Move-Logout' },
      { id:'jny-dt-market-tooltip-fix', name:'JNY DT Market Tooltip Fix', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-DT-Market-Tooltip-Fix' },
      { id:'jny-discoveries-fix', name:'JNY Discoveries Fix', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Discoveries-Fix' },
      { id:'jny-prod-info-fix', name:'JNY Prod Info Fix', url:'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/JNY-Prod-Info-Fix' }
    ]
  }
];

  // Catalogue is deliberately source-defined. Edit the catalogue array above to add or reorder folders/scripts.
  // Do not load a saved catalogue here: that would hide manual source edits on existing installations.
  const getAllScripts = () => catalogue.flatMap(s => s.scripts.filter(x => !x.linkOnly).map(x => ({...x, suiteId:s.id})));
  // Alphabetical display order by script name; localeCompare is case-insensitive for practical catalogue names.
  const sortedScripts = folder => [...folder.scripts].sort((a,b) => a.name.localeCompare(b.name, undefined, { sensitivity:'base' }));
  const saveCatalogue = () => GM_setValue(CATALOGUE_KEY, catalogue);
  const defaults = {
    selected: getAllScripts().map(s => s.id),
    // DurcTools is ON by default on a fresh install; a saved enabled array, including [],
    // remains authoritative on subsequent boots.
    enabled: ['durctools3'],
    previousEnabled: [],
    disableNotice: false,
    globalFavourites: [],
    suiteFavourites: { [SUITE_ID]: [] },
    collapsed: {},
    panelHidden: false
  };

  function readState() {
    try {
      const saved = GM_getValue(STATE_KEY, {}) || {};
      return {
        ...defaults, ...saved,
        selected: Array.isArray(saved.selected) ? saved.selected : [...defaults.selected],
        enabled: Array.isArray(saved.enabled) ? saved.enabled : ['durctools3'],
        previousEnabled: Array.isArray(saved.previousEnabled) ? saved.previousEnabled : [],
        // Warning is for this page session only; a refresh clears it.
        disableNotice: false,
        globalFavourites: Array.isArray(saved.globalFavourites) ? saved.globalFavourites : [],
        suiteFavourites: {...defaults.suiteFavourites, ...(saved.suiteFavourites || {})},
        collapsed: {...(saved.collapsed || {})},
        panelHidden: Boolean(saved.panelHidden)
      };
    } catch (_) { return JSON.parse(JSON.stringify(defaults)); }
  }

  let state = readState();
  const runtime = Object.create(null);
  // Script source is fetched fresh on each load; this manager does not maintain a source cache.
  const save = () => {
    GM_setValue(STATE_KEY, state);
    const allowDT = state.enabled.includes('durctools3');
    dtGateEnabled = allowDT;
    try { GM_setValue(DT_GATE_KEY, allowDT); } catch (_) {}
  };
  const has = (a, id) => a.includes(id);
  const toggle = (a, id) => has(a,id) ? a.filter(x=>x!==id) : [...a,id];

  // Reusable temporary runtime-warning architecture.
  // Add future entries here: scriptId, sourceUrl and an isRunning() detector.
  // Warning state is memory-only, so a page refresh clears it automatically.
  const runtimeWarningConfigs = [
    {
      scriptId: 'durctools3',
      sourceUrl: 'https://v3.durctools.uk/gm/DurcTools3.user.js',
      isRunning: () => {
        try {
          const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          return (typeof page.dt3IntID !== 'undefined' && page.dt3IntID !== null)
            || (page.dt && typeof page.dt.prodCheckTimer !== 'undefined' && page.dt.prodCheckTimer !== null);
        } catch (_) { return false; }
      }
    }
  ];
  const runtimeWarnings = new Set();

  function getRuntimeWarningConfig(scriptId) {
    return runtimeWarningConfigs.find(config => config.scriptId === scriptId);
  }

  function checkRuntimeWarning(scriptId) {
    const config = getRuntimeWarningConfig(scriptId);
    if (!config) return;
    const row = tree.querySelector('[data-script-id="' + scriptId + '"]');
    if (!state.enabled.includes(scriptId) || config.isRunning()) runtimeWarnings.delete(scriptId);
    else runtimeWarnings.add(scriptId);
    if (row) renderRuntimeWarning(row, config);
  }

  function renderRuntimeWarning(row, config) {
    const existing = row.querySelector('.runtime-warning');
    if (!runtimeWarnings.has(config.scriptId) || !state.enabled.includes(config.scriptId)) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const link = document.createElement('a');
    link.className = 'runtime-warning';
    link.href = config.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Download + Run';
    link.title = 'The manager is enabled, but the expected runtime indicators were not detected. Open the configured source.';
    link.style.cssText = 'display:inline-flex!important;align-items:center;justify-content:center;flex:0 0 auto!important;width:auto!important;min-width:0!important;padding:2px 3px!important;color:#ff5555!important;font:normal 10px/1.2 Arial,sans-serif!important;text-decoration:none!important;white-space:nowrap!important;';
    const favourite = row.querySelector('.star');
    if (favourite) row.insertBefore(link, favourite);
    else row.appendChild(link);
  }

  function scheduleRuntimeWarningCheck(scriptId, delay = 1500) {
    setTimeout(() => checkRuntimeWarning(scriptId), delay);
  }

  if (document.getElementById('illy-script-manager')) return;

  const css = document.createElement('style');
  css.textContent = `
    #illy-script-manager{position:fixed;z-index:2147483000;right:8px;top:64px;width:min(340px,calc(100vw - 16px));max-height:82vh;overflow:auto;background:#17191d;color:#e8e9eb;border:1px solid #555b64;border-radius:7px;box-shadow:0 5px 22px #0009;font:11.7px/1.3 Arial,sans-serif}
    #illy-script-manager, #illy-script-manager *{box-sizing:border-box;writing-mode:horizontal-tb!important;word-break:normal}
    #illy-script-manager button{appearance:none!important;-webkit-appearance:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;min-width:0!important;max-width:100%!important;flex:0 0 auto!important;white-space:nowrap!important;line-height:1.2!important;letter-spacing:normal!important;text-transform:none!important;transform:none!important}
    #illy-script-manager input{accent-color:#a7c8ff}
    #illy-script-manager input[type=checkbox]{appearance:auto!important;-webkit-appearance:checkbox!important;width:19px!important;height:19px!important;min-width:19px!important;min-height:19px!important;max-width:19px!important;max-height:19px!important;flex:0 0 19px!important;cursor:pointer}
    #illy-script-manager a{display:inline-flex!important;align-items:center;justify-content:center;flex:0 0 22px!important;width:22px!important;min-width:22px!important;text-decoration:none}
    #illy-script-manager .script-row{display:flex;align-items:center;flex-wrap:nowrap;gap:4px;min-width:0;padding:3px 1px}
    #illy-script-manager .script-name{flex:1 1 auto;min-width:0;overflow-wrap:anywhere;white-space:normal}
    #illy-script-manager .script-row .star{width:27px!important;min-width:27px!important;padding:3px 4px!important;font-size:14px!important}
    #illy-script-manager .script-row .run{width:44px!important;min-width:44px!important;font-size:11px!important;padding:4px!important}
    #illy-script-manager .script-row .delete-script{width:24px!important;min-width:24px!important;font-size:11px!important;padding:3px!important}
    #illy-script-manager header{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:7px;padding:8px;background:#25282e;border-bottom:1px solid #454951}
    #illy-script-manager header strong{flex:1;font-size:14px}
    #illy-script-manager button{cursor:pointer;color:#eee;background:#30343b;border:1px solid #5b616b;border-radius:4px;padding:4px 6px;font:inherit}
    #illy-script-manager button:hover{background:#414751}
    #illy-script-manager .toolbar{display:flex;flex-wrap:wrap;gap:5px;padding:7px;border-bottom:1px solid #3d4148}
    #illy-script-manager .title-status{display:inline-block;width:105px;min-width:105px;max-width:105px;overflow:hidden;white-space:nowrap;vertical-align:middle;text-align:right;color:#75e58b;font-size:10px;font-weight:700}
    #illy-script-manager .title-status[data-state="refresh"]{color:#ff7777}
    #illy-script-manager .tree{padding:4px 7px}
    #illy-script-manager .catalogue-editor{padding:8px;border-bottom:1px solid #505660;background:#202329}
    #illy-script-manager .catalogue-editor button{margin:2px}
    #illy-script-manager .edit-tools{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
    #illy-script-manager .danger{border-color:#a65c5c;color:#ffd6d6}
    #illy-script-manager .folder-tools{display:flex;gap:3px;margin-left:auto;flex:0 0 auto}
    #illy-script-manager .folder-tools button{font-size:11px;padding:3px 5px}
    #illy-script-manager .folder-tools .move-folder{width:24px!important;min-width:24px!important;padding:3px!important}
    #illy-script-manager .enabled-toggle{width:44px!important;min-width:44px!important;padding:4px 3px!important;font-size:11px!important}
    #illy-script-manager .enabled-toggle[aria-pressed="true"]{background:#244a35;border-color:#4f9b70;color:#d7ffe4}
    #illy-script-manager .enabled-toggle[aria-pressed="false"]{color:#c7ccd4}
    #illy-script-manager .delete-script{font-size:11px;padding:3px 5px;color:#ffd6d6;border-color:#a65c5c}
    #illy-script-manager .branch{margin:2px 0}
    #illy-script-manager .branch-head{display:flex;align-items:center;gap:4px;padding:3px 2px}
    #illy-script-manager .branch-label{flex:1;text-align:left;border:0;background:#30343b;padding:5px 7px;color:#fff;font-weight:800;font-size:13px;border-radius:4px}
    #illy-script-manager .branch-head{background:#22252a;border-radius:4px;padding:5px}
    #illy-script-manager .section-title{font-weight:800;color:#fff;background:#30343b;padding:5px 7px;border-radius:4px;margin:8px 0 4px}
    #illy-script-manager .script-name{color:#fff;font-weight:600}
    #illy-script-manager .star{font-size:15px;font-weight:800}
    #illy-script-manager .star[aria-pressed="true"]{background:#4b4020;border-color:#c9a94d;color:#ffe08a}
    #illy-script-manager .children{margin-left:7px;border-left:1px solid #4c5159;padding-left:5px}
    #illy-script-manager .script-row{display:flex;align-items:center;gap:4px;padding:3px 1px}
    #illy-script-manager .script-name{flex:1;min-width:0;overflow-wrap:anywhere}
    #illy-script-manager .star{min-width:27px;padding:3px 4px}
    #illy-script-manager .run{min-width:44px;font-size:11px;padding:4px}
    #illy-script-manager .status{padding:7px 9px;color:#d2dfc7;border-top:1px solid #3d4148;font-size:11px;white-space:pre-wrap}
    #illy-script-manager .muted{color:#b6bbc3;font-size:11px;padding:7px 9px}
    #illy-script-manager .section-title{font-weight:bold;color:#d5d9df;margin:6px 0 3px}
    #illy-script-manager-cog{position:fixed!important;top:6px!important;right:8px!important;z-index:2147483647!important;width:38px!important;height:38px!important;padding:0!important;border:1px solid #686e78!important;border-radius:8px!important;background:#25282e!important;color:#eee!important;font:23px/1 Arial,sans-serif!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 2px 8px #0008!important}
    #illy-script-manager-cog:active{background:#414751!important}
    #illy-script-manager[hidden]{display:none!important}
  `;
  document.head.appendChild(css);

  const panel = document.createElement('aside');
  panel.id = 'illy-script-manager';
  panel.innerHTML = `
    <header><strong>Illyriad Script Manager <span class="title-status" data-title-status aria-live="polite"></span></strong><button data-action="close" title="Close panel">×</button></header>
    <div class="toolbar" data-toolbar><button data-action="enable-all">Enable all</button><button data-action="disable-all">Disable all</button></div>

    <div class="catalogue-editor" data-editor hidden></div>
    <div class="tree" data-tree></div>
  `;
  panel.hidden = Boolean(state.panelHidden);
  document.body.appendChild(panel);

  // Persistent floating cog: remains visible while the manager panel is hidden.
  const cog = document.createElement('button');
  cog.id = 'illy-script-manager-cog';
  cog.type = 'button';
  cog.textContent = '⚙';
  cog.title = 'Open or hide Illyriad Script Manager';
  cog.setAttribute('aria-label', cog.title);
  cog.setAttribute('aria-expanded', String(!panel.hidden));
  document.body.appendChild(cog);
  cog.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    state.panelHidden = panel.hidden;
    save();
    cog.setAttribute('aria-expanded', String(!panel.hidden));
  });

  const tree = panel.querySelector('[data-tree]');
  const editor = panel.querySelector('[data-editor]');
  const toolbar = panel.querySelector('[data-toolbar]');

  const titleStatus = panel.querySelector('[data-title-status]');
  let bulkLoading = false;
  let activeLoads = 0;
  const setStatus = (message='') => {
    // A pending disable warning takes priority over the loading label until a script is re-enabled or the page is refreshed.
    if (state.disableNotice) {
      titleStatus.textContent = 'Refresh to disable';
      titleStatus.dataset.state = 'refresh';
      titleStatus.title = 'Refresh the page to fully disable scripts that are already running';
    } else if (activeLoads > 0 || bulkLoading || /loading|fetching/i.test(String(message))) {
      titleStatus.textContent = 'Loading…';
      titleStatus.dataset.state = 'loading';
      titleStatus.title = 'Scripts are loading; this remains visible until the load operation finishes';
    } else {
      titleStatus.textContent = '';
      titleStatus.dataset.state = '';
      titleStatus.title = '';
    }
  };

  // On-demand source cache: only scripts actually requested are cached.
  // Cached source is used immediately; a background refresh updates the next activation.
  const SOURCE_CACHE_PREFIX = 'illyriadScriptManager.sourceCache.v1.';
  const SOURCE_CACHE_MAX_CHARS = 2 * 1024 * 1024;
  const sourceRefreshes = Object.create(null);

  function validSourceText(value) {
    if (typeof value !== 'string') return false;
    const source = value.trim();
    if (!source || source.length > SOURCE_CACHE_MAX_CHARS) return false;
    // Reject common HTML/error pages returned instead of raw JavaScript.
    if (/^<!doctype\s+html|^<html[\s>]/i.test(source)) return false;
    if (/<title>\s*(404|not found|error|forbidden)/i.test(source.slice(0, 12000))) return false;
    return true;
  }

  function fetchAndCacheSource(script) {
    if (sourceRefreshes[script.id]) return sourceRefreshes[script.id];
    const task = new Promise((resolve,reject) => {
      GM_xmlhttpRequest({
        method:'GET', url:script.url, timeout:20000,
        onload:r => {
          if (r.status < 200 || r.status >= 300) return reject(new Error('HTTP '+r.status));
          const source = String(r.responseText || '');
          if (!validSourceText(source)) return reject(new Error('Invalid source response (empty, HTML/error page, or over 2 MB)'));
          try {
            Promise.resolve(GM_setValue(SOURCE_CACHE_PREFIX + script.id, {
              url: script.url,
              source,
              cachedAt: Date.now()
            })).catch(() => {});
          } catch (_) {
            // Storage failure must not prevent a valid freshly downloaded script from running.
          }
          resolve(source);
        },
        onerror:() => reject(new Error('Network/CORS request failed')),
        ontimeout:() => reject(new Error('Request timed out'))
      });
    });
    sourceRefreshes[script.id] = task;
    task.finally(() => {
      if (sourceRefreshes[script.id] === task) delete sourceRefreshes[script.id];
    }).catch(() => {});
    return task;
  }

  function requestSource(script) {
    let cached = null;
    try { cached = GM_getValue(SOURCE_CACHE_PREFIX + script.id, null); } catch (_) {}
    if (cached && cached.url === script.url && validSourceText(cached.source)) {
      // Return cached source now; refresh quietly for the next activation.
      fetchAndCacheSource(script).catch(() => {});
      return Promise.resolve(cached.source);
    }
    // First activation downloads and caches the source before injecting it.
    return fetchAndCacheSource(script);
  }

  function injectPageSource(script, source) {
    return new Promise((resolve,reject) => {
      if (!state.enabled.includes(script.id)) return reject(new Error('Disabled before injection'));
      const marker = MARKER_PREFIX + script.id.replace(/[^a-z0-9]/gi,'_');
      const token = script.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      const msgType = 'ISM081_' + script.id;
      const onMessage = e => {
        if (e.source !== window || !e.data || e.data.type !== msgType || e.data.token !== token) return;
        window.removeEventListener('message', onMessage);
        if (e.data.status === 'duplicate') resolve('Already running in this page; enabled preference restored.');
        else if (e.data.status === 'started') resolve('Injected into page context; verify feature behaviour.');
        else reject(new Error(e.data.error || 'Page script reported an error'));
      };
      window.addEventListener('message', onMessage);
      const payload = '(function(){var marker='+JSON.stringify(marker)+',token='+JSON.stringify(token)+',type='+JSON.stringify(msgType)+';if(window[marker]){window.postMessage({type:type,token:token,status:"duplicate"},"*");return;}window[marker]={id:'+JSON.stringify(script.id)+',at:Date.now()};try{\n'+source+'\nwindow.postMessage({type:type,token:token,status:"started"},"*");}catch(err){window.postMessage({type:type,token:token,status:"error",error:String(err&&err.stack||err)},"*");}})();';
      const node = document.createElement('script');
      node.textContent = payload;
      (document.head || document.documentElement).appendChild(node);
      node.remove();
      setTimeout(() => {
        window.removeEventListener('message', onMessage);
        reject(new Error('No execution acknowledgement; inline script may be blocked by CSP or source may have failed before reporting'));
      }, 5000);
    });
  }

  async function runScript(script, freshSource) {
    if (script.mode === 'external-gate') {
      if (runtime[script.id]?.busy) return;
      if (!state.enabled.includes(script.id)) state.enabled = [...state.enabled, script.id];
      state.disableNotice = false;
      runtime[script.id] = {busy:true, label:'Enabling DurcTools…'};
      activeLoads++;
      save(); // Updates dtGateEnabled before queued DT script nodes are released.
      setStatus('Scripts Loading...');
      render(); // Use the same title-bar Loading… indicator as every other load action.
      // Keep the shared title indicator visible long enough to paint before releasing the gate.
      await new Promise(resolve => setTimeout(resolve, 150));
      releaseBlockedDurcToolsScripts();
      runtime[script.id] = {busy:false, label:'External loader allowed'};
      activeLoads = Math.max(0, activeLoads - 1);
      setStatus('');
      render();
      return;
    }
    if (runtime[script.id]?.busy) return;
    activeLoads++;
    state.disableNotice = false;
    setStatus('Scripts Loading...');
    state.enabled = [...new Set([...state.enabled, script.id])];
    save();
    runtime[script.id] = {busy:true, label:'Loading…'};
    render();
    try {
      const source = freshSource !== undefined ? freshSource : await requestSource(script);
      if (!state.enabled.includes(script.id)) throw new Error('Stopped before execution');
      const result = await injectPageSource(script, source);
      runtime[script.id] = {busy:false, label:'Injected'};
      setStatus(script.name+': '+result+' Source loaded ('+source.length+' characters). Cached source is refreshed in the background when available.');
    } catch (err) {
      // Keep the user's enabled preference; runtime failure is not a preference change.
      runtime[script.id] = {busy:false, label:'Error'};
      setStatus('FAILED — '+script.name+'\n'+String(err.message||err));
    }
    activeLoads = Math.max(0, activeLoads - 1);
    setStatus('');
    render();
  }

  async function loadScriptsFast(scripts, label) {
    let unique = [...new Map(scripts.filter(s => runtime[s.id]?.label !== 'Injected').map(s => [s.id, s])).values()];
    const external = unique.filter(s => s.mode === 'external-gate');
    if (external.length) {
      state.enabled = [...new Set([...state.enabled, ...external.map(s => s.id)])];
      save();
      for (const script of external) runtime[script.id] = {busy:false, label:'External loader allowed'};
    }
    unique = unique.filter(s => s.mode !== 'external-gate');
    if (!unique.length) {
      bulkLoading = false;
      render();
      if (!external.length) setStatus('');
      return;
    }
    bulkLoading=true;
    state.disableNotice=false;
    state.enabled=[...new Set([...state.enabled,...unique.map(s=>s.id)])];
    save(); setStatus('Scripts Loading...'); render();
    // Fetch in parallel for speed; inject one at a time in catalogue order to reduce dependency conflicts.
    const results = await Promise.all(unique.map(async script => {
      try { return {script, source:await requestSource(script)}; }
      catch (error) { return {script, error}; }
    }));
    for (const result of results) {
      const script=result.script;
      if (result.error) {
        runtime[script.id]={busy:false,label:'Error'};
        setStatus('FAILED — '+script.name+'\\n'+String(result.error.message||result.error));
        continue;
      }
      if (!state.enabled.includes(script.id)) continue;
      await runScript(script,result.source);
    }
    bulkLoading=false; setStatus(''); render();
  }

  function stopScript(script) {
    state.enabled = state.enabled.filter(id=>id!==script.id);
    if (script.mode === 'external-gate') {
      state.disableNotice = false;
      save();
      runtime[script.id] = {busy:false, label:'External gate blocking'};
      render();
      return;
    }
    state.disableNotice = true;
    save();
    runtime[script.id] = {busy:false, label:'Stopped for future runs'};
    render();
    setStatus('');
  }

  async function enableFavouriteScripts(scripts, label) {
    await loadScriptsFast(scripts, label);
  }

  function branchHead(title,key) {
    const head=document.createElement('div'); head.className='branch-head';
    const fold=document.createElement('button'); fold.textContent=state.collapsed[key]?'▸':'▾'; fold.title=state.collapsed[key]?'Expand folder':'Collapse folder';
    fold.addEventListener('click',()=>{state.collapsed[key]=!state.collapsed[key];save();render();});
    const label=document.createElement('button'); label.className='branch-label'; label.textContent=title;
    label.addEventListener('click',()=>{state.collapsed[key]=!state.collapsed[key];save();render();});
    head.append(fold,label); return {head};
  }

  function scriptRow(script,suiteId) {
    const row=document.createElement('div'); row.className='script-row';
    row.dataset.scriptId = script.id;
    if (script.linkOnly) {
      const name=document.createElement('span'); name.className='script-name'; name.textContent=script.name; 
      const link=document.createElement('a'); link.href=script.url; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='↗'; link.title='Open repository index (not executable source)'; link.style.color='#a8ceff';
      row.append(name,link);
      return row;
    }
    const toggleButton=document.createElement('button'); toggleButton.className='enabled-toggle';
    const isEnabled=state.enabled.includes(script.id);
    toggleButton.textContent = isEnabled ? 'On' : 'Off';
    toggleButton.title = script.mode === 'external-gate'
      ? (isEnabled ? 'Turn off DurcTools' : 'Enable DurcTools')
      : (isEnabled ? 'Turn off future activations' : 'Turn on and load this script');
    toggleButton.setAttribute('aria-pressed',String(isEnabled));
    toggleButton.addEventListener('click',()=>{
      if (script.mode === 'external-gate') {
        if (isEnabled) {
          runtimeWarnings.delete(script.id);
          stopScript(script);
        } else {
          runtimeWarnings.delete(script.id); // A new enable attempt must always perform a fresh check.
          runScript(script);
          scheduleRuntimeWarningCheck(script.id, 1800);
        }
        return;
      }
      if (isEnabled) stopScript(script); else runScript(script);
    });
    const name=document.createElement('span'); name.className='script-name'; name.textContent=script.name; 
    const betaBadge = script.id === 'jny-notifications-highlighter' ? document.createElement('span') : null;
    if (betaBadge) {
      betaBadge.textContent = 'BETA';
      betaBadge.title = 'Beta script: behaviour may need further testing';
      betaBadge.style.cssText = 'display:inline-block;margin-left:6px;padding:1px 5px;border:1px solid #d6a84b;border-radius:4px;color:#f0c36d;font-size:10px;font-weight:700;letter-spacing:.04em;vertical-align:middle;';
    }
    const globalStar=document.createElement('button'); globalStar.className='star'; globalStar.textContent=has(state.globalFavourites,script.id)?'★':'☆'; globalStar.title='Toggle global favourite';
    globalStar.setAttribute('aria-pressed',String(has(state.globalFavourites,script.id)));
    globalStar.addEventListener('click',()=>{state.globalFavourites=toggle(state.globalFavourites,script.id);save();render();});
    const link=document.createElement('a'); link.href=script.url; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='↗'; link.title='Open source code'; link.style.color='#a8ceff';
    if (betaBadge) row.append(toggleButton,name,betaBadge,globalStar,link);
    else row.append(toggleButton,name,globalStar,link);
    const warningConfig = getRuntimeWarningConfig(script.id);
    if (warningConfig) renderRuntimeWarning(row, warningConfig);
    return row;
  }

  function renderEditor() {
    editor.replaceChildren();
    const tools=document.createElement('div');tools.className='edit-tools';
    const addFolder=document.createElement('button');addFolder.textContent='+ New folder';addFolder.addEventListener('click',addFolderPrompt);
    const addScript=document.createElement('button');addScript.textContent='+ New script';addScript.addEventListener('click',()=>{const folder=chooseFolder();if(folder)addScriptToFolder(folder.id);});
    const done=document.createElement('button');done.textContent='Done';done.addEventListener('click',()=>{editor.hidden=true;});
    tools.append(addFolder,addScript,done);editor.append(tools);
    const note=document.createElement('div');note.className='muted';note.textContent='Edits are saved on this device. Script URLs must be direct JavaScript source URLs accessible to the userscript manager. Deleting an entry only removes it from this catalogue; it does not uninstall a separately installed script or undo code already running.';editor.append(note);
    catalogue.forEach(folder=>{
      const row=document.createElement('div');row.className='editor-folder';
      const label=document.createElement('strong');label.textContent=folder.name+' — '+folder.scripts.length+' script(s)';row.append(label);
      sortedScripts(folder).forEach(script=>{
        const item=document.createElement('div');item.className='editor-script';
        const name=document.createElement('span');name.textContent=script.name;item.append(name);
        const move=document.createElement('button');move.textContent='Move';move.title='Move this script to another folder';
        move.addEventListener('click',()=>{const targets=catalogue.filter(f=>f.id!==folder.id);if(!targets.length){alert('Create another folder first.');return;}const choice=prompt('Move '+script.name+' to which folder?\n'+targets.map((f,i)=>(i+1)+'. '+f.name).join('\n'),'1');if(choice===null)return;const target=targets[Number(choice)-1];if(!target){alert('Invalid folder number.');return;}moveScript(script.id,target.id);});
        item.append(move);row.append(item);
      });
      editor.append(row);
    });
  }

  function addFolderPrompt(){const name=prompt('New folder name:');if(!name||!name.trim())return;const clean=name.trim();if(catalogue.some(f=>f.name.toLowerCase()===clean.toLowerCase())){alert('A folder with that name already exists.');return;}const id='folder-'+clean.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now().toString(36);catalogue.push({id,name:clean,scripts:[]});state.suiteFavourites[id]=[];saveCatalogue();save();render();renderEditor();setStatus('Created folder '+clean+'.');}
  function chooseFolder(){if(!catalogue.length){alert('Create a folder first.');return null;}const choices=catalogue.map((f,i)=>(i+1)+'. '+f.name).join('\n');const raw=prompt('Enter folder number:\n'+choices,'1');if(raw===null)return null;const index=Number(raw)-1;if(!Number.isInteger(index)||!catalogue[index]){alert('Invalid folder number.');return null;}return catalogue[index];}
  function addScriptToFolder(folderId){const folder=catalogue.find(f=>f.id===folderId);if(!folder)return;const name=prompt('Script display name:');if(!name||!name.trim())return;const url=prompt('Direct JavaScript source URL (https://…):');if(!url||!/^https:\/\//i.test(url.trim())){alert('A valid HTTPS source URL is required.');return;}const cleanUrl=url.trim();const idBase=(folder.id+'-'+name.trim()).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');let id=idBase||('script-'+Date.now().toString(36));if(getAllScripts().some(s=>s.id===id)){id+='-'+Date.now().toString(36);}folder.scripts.push({id,name:name.trim(),url:cleanUrl});if(!state.selected.includes(id))state.selected.push(id);saveCatalogue();save();render();renderEditor();setStatus('Added '+name.trim()+'. Source has not been audited; run only if you trust it.');}
  function renameFolder(folderId){const folder=catalogue.find(f=>f.id===folderId);if(!folder)return;const name=prompt('Rename folder:',folder.name);if(!name||!name.trim())return;if(catalogue.some(f=>f.id!==folderId&&f.name.toLowerCase()===name.trim().toLowerCase())){alert('A folder with that name already exists.');return;}folder.name=name.trim();saveCatalogue();render();renderEditor();}
  function deleteFolderById(folderId){const folder=catalogue.find(f=>f.id===folderId);if(!folder)return;if(!confirm('Delete folder "'+folder.name+'" and its '+folder.scripts.length+' catalogue entries? This does not uninstall scripts or undo running effects.'))return;const ids=folder.scripts.map(s=>s.id);catalogue=catalogue.filter(f=>f.id!==folderId);state.selected=state.selected.filter(id=>!ids.includes(id));state.enabled=state.enabled.filter(id=>!ids.includes(id));state.globalFavourites=state.globalFavourites.filter(id=>!ids.includes(id));state.suiteFavourites[folderId]=[];saveCatalogue();save();render();renderEditor();setStatus('Deleted folder '+folder.name+' from the catalogue.');}

  function moveFolder(folderId,delta){
    const index=catalogue.findIndex(f=>f.id===folderId), next=index+delta;
    if(index<0||next<0||next>=catalogue.length)return;
    const [folder]=catalogue.splice(index,1);catalogue.splice(next,0,folder);
    saveCatalogue();render();renderEditor();
  }

  function moveScript(scriptId,targetFolderId){
    const source=catalogue.find(f=>f.scripts.some(s=>s.id===scriptId));
    const target=catalogue.find(f=>f.id===targetFolderId);
    if(!source||!target||source.id===target.id)return;
    const index=source.scripts.findIndex(s=>s.id===scriptId);
    const [script]=source.scripts.splice(index,1);target.scripts.push(script);
    state.suiteFavourites[source.id]=(state.suiteFavourites[source.id]||[]).filter(id=>id!==scriptId);
    saveCatalogue();save();render();renderEditor();setStatus('Moved '+script.name+' to '+target.name+'.');
  }

  function render() {
    tree.replaceChildren();
    const enabledCount = state.enabled.length;
    const previousCount = state.previousEnabled.length;
    const disableButton = toolbar.querySelector('[data-action="disable-all"]');
    disableButton.textContent = enabledCount === 0 && previousCount > 0 ? 'Enable previous' : 'Disable all';
    disableButton.disabled = enabledCount === 0 && previousCount === 0;
    disableButton.style.opacity = disableButton.disabled ? '0.5' : '1';
    // Keep the title indicator synchronized on every render, including Disable all.
    setStatus('');

    // Global Favorites renders first; DurcTools follows as a pinned runnable entry.
    const globalKey='global-favourites';
    const globalBranch=branchHead('Global Favorites',globalKey);
    const enableAll=document.createElement('button');
    enableAll.textContent='Enable ★';
    enableAll.title='Load every script marked with a global star';
    enableAll.addEventListener('click',()=>enableFavouriteScripts(
      getAllScripts().filter(script=>has(state.globalFavourites,script.id)),
      'Global Favorites'
    ));
    globalBranch.head.append(enableAll);
    const globalNode=document.createElement('div'); globalNode.className='branch'; globalNode.append(globalBranch.head);
    if(!state.collapsed[globalKey]){
      const children=document.createElement('div'); children.className='children';
      const pinnedScripts=catalogue.filter(folder=>folder.pinned).flatMap(folder=>folder.scripts);
      const pinnedIds=new Set(pinnedScripts.map(script=>script.id));
      const favourites=getAllScripts()
        .filter(script=>has(state.globalFavourites,script.id))
        .sort((a,b)=>Number(pinnedIds.has(b.id))-Number(pinnedIds.has(a.id)) || a.name.localeCompare(b.name, undefined, { sensitivity:'base' }));
      if(!favourites.length){const empty=document.createElement('div');empty.className='muted';empty.textContent='No global favorites yet. Tap a star beside any script to add it.';children.append(empty);}
      favourites.forEach(script=>children.append(scriptRow(script,script.suiteId)));
      globalNode.append(children);
    }
    tree.append(globalNode);

    const globalExpanded=!state.collapsed[globalKey];
    const standalonePinnedScripts=catalogue
      .filter(folder=>folder.pinned)
      .flatMap(folder=>folder.scripts.map(script=>({...script, suiteId:folder.id})))
      .filter(script=>!(globalExpanded && has(state.globalFavourites,script.id)));
    if(standalonePinnedScripts.length){
      const separator=document.createElement('div');
      separator.setAttribute('aria-hidden','true');
      separator.style.cssText='border-top:1px solid #4c5159;margin:5px 0;';
      tree.append(separator);
      const pinnedRows=document.createElement('div');
      pinnedRows.style.cssText='margin-left:7px;padding-left:5px;';
      standalonePinnedScripts.forEach(script=>{
        pinnedRows.append(scriptRow(script,script.suiteId));
      });
      tree.append(pinnedRows);
    }

    catalogue.forEach(folder=>{
      if(folder.pinned) return;
      const key='suite-'+folder.id;
      const branch=branchHead(folder.name,key);
      const enableSuite=document.createElement('button');
      enableSuite.textContent='Enable ★';
      enableSuite.title='Load globally favourited scripts in '+folder.name;
      enableSuite.addEventListener('click',()=>enableFavouriteScripts(
        folder.scripts.filter(script=>has(state.globalFavourites,script.id)),
        folder.name+' favorites'
      ));
      branch.head.append(enableSuite);
      const disableSuite=document.createElement('button');
      disableSuite.textContent='Disable suite';
      disableSuite.title='Turn off all enabled scripts in '+folder.name+' for future activations';
      disableSuite.addEventListener('click',()=>{
        const suiteIds=new Set(folder.scripts.map(script=>script.id));
        const activeIds=state.enabled.filter(id=>suiteIds.has(id));
        if(!activeIds.length){setStatus('No enabled scripts in '+folder.name+'.');return;}
        state.enabled=state.enabled.filter(id=>!suiteIds.has(id));
        state.disableNotice=true;
        activeIds.forEach(id=>{runtime[id]={busy:false,label:'Stopped for future runs'};});
        save();
        render();
        setStatus('Disabled '+activeIds.length+' script(s) in '+folder.name+' for future activations. Refresh to stop effects already running on this page.');
      });
      branch.head.append(disableSuite);
      const node=document.createElement('div'); node.className='branch'; node.append(branch.head);
      if(!state.collapsed[key]){
        const children=document.createElement('div'); children.className='children';
        sortedScripts(folder).forEach(script=>children.append(scriptRow(script,folder.id)));
        node.append(children);
      }
      tree.append(node);
    });
  }

  panel.addEventListener('click',async e=>{
    const action=e.target?.dataset?.action;if(!action)return;
    if(action==='enable-all'){
      await loadScriptsFast(getAllScripts(),'All scripts'); return;
    }
    if(action==='disable-all'){
      if(state.enabled.length){
        state.previousEnabled=[...state.enabled];
        state.enabled=[];
        state.disableNotice=true;
        for(const id of state.previousEnabled) runtime[id]={busy:false,label:'Stopped for future runs'};
        save(); render();
        setStatus('All manager-controlled scripts disabled. Refresh to stop running code; DurcTools will be blocked after reload.');
        return;
      }
      if(state.previousEnabled.length){
        const restore=getAllScripts().filter(script=>state.previousEnabled.includes(script.id));
        state.enabled=[]; state.disableNotice=false; save();
        await loadScriptsFast(restore,'Previous scripts');
        state.previousEnabled=[]; save(); render(); return;
      }
      return;
    }
    if(action==='close'){
      panel.hidden = true;
      state.panelHidden = true;
      save();
      cog.setAttribute('aria-expanded', 'false');
      return;
    }
    // Minimize control removed; use the close button or floating cog to hide the panel.
  });

  render();
  renderEditor();
  // Re-check configured runtime warnings after the existing startup restore has had time to run.
  runtimeWarningConfigs.forEach(config => {
    if (state.enabled.includes(config.scriptId)) scheduleRuntimeWarningCheck(config.scriptId, 2200);
  });
  // Startup status is shown while saved scripts are restored.

  // Restore actual execution for scripts that were enabled before this page refresh.
  // Only IDs in the saved enabled list are reloaded; explicitly disabled scripts stay off.
  const savedEnabledScripts = getAllScripts().filter(script => state.enabled.includes(script.id));
  if (savedEnabledScripts.length) {
    setStatus('Restoring enabled scripts…');
    loadScriptsFast(savedEnabledScripts, 'Restore enabled scripts after refresh');
  } else {
    setStatus('Ready');
    setTimeout(() => setStatus(''), 1400);
  }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startManager, { once: true });
  } else {
    startManager();
  }
})();
