/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof window.Mozilla === 'undefined') {
    window.Mozilla = {};
}

;(function($, Mozilla) {
    'use strict';

    var $body = $('body');
    var $html = $('html');
    var COUNTRY_CODE = '';
    var marketState = 'Unknown';

    // Countries in which Firefox for iOS is available.
    // Add two-letter country codes (lowercase) to this array to
    // to expand the market. We'll remove this logic for wide release.
    // Note: This is the country code, NOT locale code; they often differ.
    var marketCountries = ['nz'];

    // Get country code via geo-ip lookup
    var getGeoLocation = function() {
        try {
            COUNTRY_CODE = geoip_country_code().toLowerCase();
        } catch (e) {
            COUNTRY_CODE = '';
        }
    };

    $.getScript('https://geo.mozilla.org/country.js', function() {
        getGeoLocation();

        for (var i = 0; i < marketCountries.length; i++) {
            if (marketCountries[i].match(COUNTRY_CODE)) {
                $body.addClass('in-market');
                marketState = 'In Market';
            } else {
                marketState = 'Out of Market';
            }
        }
    });

    // init send-to-device form
    var form = new Mozilla.SendToDevice();
    form.init();

    var $widget = $('#send-to-modal-container');

    $('.send-to').on('click', function(e) {
        e.preventDefault();
        Mozilla.Modal.createModal(this, $widget);
    });

    // Firefox Sync sign in flow button
    $('.sync-button').on('click', function(e) {
        e.preventDefault();
        Mozilla.UITour.showFirefoxAccounts();
    });

    // Show Sync instructions in a modal doorhanger
    var $instructions = $('#sync-instructions');
    var $fill = $('<div id="modal" role="dialog" tabindex="-1"></div>');

    $('.sync-start-ios').on('click', function(e) {
        e.preventDefault();
        $html.addClass('noscroll');
        $fill.append($instructions);
        $body.append($fill);
    });

    $('#sync-instructions .btn-dismiss').on('click', function(e) {
        e.preventDefault();
        $html.removeClass('noscroll');
        $body.append($instructions);
        $fill.remove();
    });

    // Sync stuff
    var fxMasterVersion = window.getFirefoxMasterVersion();
    var state = 'Unknown';
    var syncCapable = false;

    var swapState = function(stateClass) {
        $body.removeClass('state-default');
        $body.addClass(stateClass);
    };

    // Sniff UA for Firefox for iOS
    var isFirefoxiOS = function(userAgent) {
        var ua = userAgent || navigator.userAgent;
        return /FxiOS/.test(ua);
    };

    if (window.isFirefox()) {

        // Firefox for Android
        if (window.isFirefoxMobile()) {
            swapState('state-fx-android');
            state = 'Firefox Android: ' + marketState;

        // Firefox for Desktop
        } else {

            if (fxMasterVersion >= 31) {

                // Set syncCapable so we know not to send tracking info
                // again later
                syncCapable = true;

                // Query if the UITour API is working before we use the API
                Mozilla.UITour.getConfiguration('sync', function (config) {

                    // Variation #1: Firefox 31+ signed IN to Sync (default)
                    if (config.setup) {
                        swapState('state-fx-signed-in');
                        state = 'Firefox Desktop: Signed-In: ' + marketState;

                    // Variation #2: Firefox 31+ signed OUT of Sync
                    } else {
                        swapState('state-fx-signed-out');
                        state = 'Firefox Desktop: Signed-Out: ' + marketState;
                    }

                    // Call GA tracking here to ensure it waits for the
                    // getConfiguration async call
                    window.dataLayer.push({
                        event: 'ios-page-interactions',
                        interaction: 'page-load',
                        loadState: state
                    });
                });
            }

        }

    // Firefox for iOS
    } else if (isFirefoxiOS()) {
        swapState('state-fx-ios');
        state = 'Firefox iOS: ' + marketState;

    // Not Firefox
    } else {
        swapState('state-not-fx');
        state = 'Not Firefox: ' + marketState;
    }

    // Send page state to GA if it hasn't already been sent
    if (syncCapable === false) {
        window.dataLayer.push({
            event: 'ios-page-interactions',
            interaction: 'page-load',
            loadState: state
        });
    }

})(window.jQuery, window.Mozilla);
