// ==UserScript==
// @name         [JNY] SCRIPT MANAGER
// @namespace    https://github.com/LordThot/Info
// @version      1.0
// @description  loader with ui for all user scripts I've found. currently bzn graphics does not work. i will work on adding and keeping the tcol and chill scripts gate kept along with other features. please let me know if u find any bugs,scripts or create your own ones. click the blue arrow to go to the source code which for my scripts will have a brief description explaining what it does. would also be best to disable any existing userscripts that are already in the directory. also due to guthub viewing formal you should download the file then upload it to ur userscript manager 
// @author       LordThot
// @homepageURL  https://github.com/LordThot/JNY-Scripts
// @match        https://elgea.illyriad.co.uk/*
// @exclude      https://elgea.illyriad.co.uk/Account/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @connect      bazoon.town
// @connect      v3.durctools.uk
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/Script-Manager-Boot
// @downloadURL  https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/Script-Manager-Boot
// ==/UserScript==

(() => {
  'use strict';

  const MANAGER_URL = 'https://raw.githubusercontent.com/LordThot/JNY-Scripts/main/Script-Manager.js';
  const CACHE_KEY = 'jnyScriptManager.bootstrap.cachedSource.v1';
  const RUN_KEY = '__JNY_SCRIPT_MANAGER_BOOTSTRAP_RUNNING__';

  if (location.hostname !== 'elgea.illyriad.co.uk') return;
  if (/^\/Account(?:\/|$)/i.test(location.pathname)) return;

  if (globalThis[RUN_KEY]) return;
  globalThis[RUN_KEY] = true;

  function report(message, error) {
    console[error ? 'error' : 'info']('[JNY SCRIPT MANAGER] ' + message, error || '');
  }

  function isValidManager(source) {
    return typeof source === 'string' &&
      source.length > 1000 &&
      source.includes('// ==UserScript==') &&
      source.includes('Illyriad Script Manager') &&
      source.includes('GM_xmlhttpRequest') &&
      source.includes('GM_getValue') &&
      source.includes('GM_setValue');
  }

  function executeManager(source, sourceLabel) {
    if (!isValidManager(source)) throw new Error('Downloaded manager source failed validation.');
    // eval runs inside this userscript sandbox, where the granted GM_* APIs are available.
    eval(source);
    report('Manager started from ' + sourceLabel + '.');
  }

  function useCachedManager(reason) {
    let cached = '';
    try { cached = GM_getValue(CACHE_KEY, ''); }
    catch (error) { report('Could not read the cached manager.', error); }

    if (isValidManager(cached)) {
      try {
        executeManager(cached, 'cached copy (network unavailable)');
        report('Using cached manager because the latest version could not be fetched: ' + reason);
        return;
      } catch (error) { report('Cached manager failed to start.', error); }
    }
    report('Manager could not be loaded. Check your connection and the GitHub raw URL. ' + reason);
  }

  GM_xmlhttpRequest({
    method: 'GET',
    url: MANAGER_URL + '?bootstrap=' + Date.now(),
    headers: { 'Cache-Control': 'no-cache' },
    timeout: 20000,
    onload(response) {
      if (response.status < 200 || response.status >= 300) {
        useCachedManager('HTTP ' + response.status);
        return;
      }

      const source = response.responseText || '';
      if (!isValidManager(source)) {
        useCachedManager('The server response did not look like the expected manager script.');
        return;
      }

      try {
        executeManager(source, 'latest GitHub version');
        try { GM_setValue(CACHE_KEY, source); }
        catch (error) { report('Manager started, but its offline cache could not be saved.', error); }
      } catch (error) {
        report('The latest manager source was downloaded but failed during startup.', error);
      }
    },
    onerror() { useCachedManager('Network request failed.'); },
    ontimeout() { useCachedManager('Request timed out.'); }
  });
})();