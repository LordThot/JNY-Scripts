/*
 * Anatomy Name Shortner
 * Recovered from Dewt's original ans.js and revised for reliability.
 *
 * Purpose:
 *   Shorten selected anatomy names in the Illyriad trade anatomy tree.
 *
 * Supported routes:
 *   #/Trade/HubOrders
 *   #/Trade/Orders
 *   #/Trade/Markets
 *
 * This is implementation-only source, not a standalone userscript. idk AE I did something- JNY
 */

(function (window, document) {
    'use strict';

    var ROUTES = [
        '#/Trade/HubOrders',
        '#/Trade/Orders',
        '#/Trade/Markets'
    ];

    // Replace longer phrases first to avoid partial replacements.
    var REPLACEMENTS = [
        ['Exoskeleton', 'EXO'],
        ['Giant', 'GT'],
        ['Poisonous', 'PSNS'],
        ['Vertebrae', 'VERTs'],
        ['Vertebra', 'VERT'],
        ['Scaled Charger', 'SCLD CHGR'],
        ['Entrails', 'ENTs']
    ];

    var tree = null;
    var treeObserver = null;
    var documentObserver = null;

    function isSupportedRoute() {
        var hash = window.location.hash.split('?')[0];

        for (var i = 0; i < ROUTES.length; i++) {
            if (
                hash === ROUTES[i] ||
                hash.indexOf(ROUTES[i] + '/') === 0
            ) {
                return true;
            }
        }

        return false;
    }

    function shortenText(text) {
        for (var i = 0; i < REPLACEMENTS.length; i++) {
            var original = REPLACEMENTS[i][0];
            var shortened = REPLACEMENTS[i][1];

            text = text.split(original).join(shortened);
        }

        return text;
    }

    function shortenLink(link) {
        if (!link) {
            return;
        }

        // Change text nodes only, preserving existing link markup.
        var walker = document.createTreeWalker(
            link,
            window.NodeFilter.SHOW_TEXT,
            null
        );

        var textNodes = [];
        var node;

        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        for (var i = 0; i < textNodes.length; i++) {
            var textNode = textNodes[i];
            var shortened = shortenText(textNode.nodeValue);

            if (shortened !== textNode.nodeValue) {
                textNode.nodeValue = shortened;
            }
        }
    }

    function processTree() {
        if (!isSupportedRoute() || !tree || !tree.isConnected) {
            return;
        }

        var anatomies = tree.querySelectorAll(
            'ul li.jstree-leaf'
        );

        for (var i = 0; i < anatomies.length; i++) {
            shortenLink(anatomies[i].querySelector('a'));
        }
    }

    function attachTreeObserver() {
        var currentTree = document.querySelector('#tree');

        if (currentTree === tree) {
            return;
        }

        if (treeObserver) {
            treeObserver.disconnect();
            treeObserver = null;
        }

        tree = currentTree;

        if (!tree) {
            return;
        }

        if (window.MutationObserver) {
            treeObserver = new window.MutationObserver(function () {
                processTree();
            });

            treeObserver.observe(tree, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        processTree();
    }

    function start() {
        attachTreeObserver();

        if (window.MutationObserver) {
            documentObserver = new window.MutationObserver(function () {
                attachTreeObserver();
            });

            documentObserver.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    // Register without overwriting other scripts' handlers.
    window.addEventListener('hashchange', processTree);

    // Start immediately; the observers handle late-loaded or rebuilt trees.
    start();

})(window, document);