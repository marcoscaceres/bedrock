/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof Mozilla === 'undefined') {
    var Mozilla = {};
}

(function($) {
    'use strict';

    var TPTour = {};
    var _$strings = $('#strings');
    var _$ad = $('.ad');
    var _step1;
    var _step3;
    var _highlightTimeout;
    var _$step2Panel = $('#info-panel');
    var _$dummyContent = $('#dummy-content');
    var _$endContent = $('#end-state');

    TPTour.state = 'step1';

    TPTour.step1 = function() {
        var buttons = [
            {
              label: _step1.stepText,
              style: 'text',
            },
            {
              callback: TPTour.step2,
              label: _step1.buttonText,
              style: 'primary',
            },
        ];

        var options = {
            closeButtonCallback: TPTour.step4
        };

        Mozilla.UITour.getConfiguration('availableTargets', function(config) {
            if (config.targets && config.targets.indexOf('trackingProtection') !== -1) {
                Mozilla.UITour.showInfo('trackingProtection', _step1.titleText, _step1.panelText, undefined, buttons, options);
            }
        });
    };

    TPTour.step2 = function() {
        _$step2Panel.removeClass('hidden');
        _$ad.addClass('fade-out');
        TPTour.state = 'step2';
    };

    TPTour.step3 = function() {
        TPTour.hideStep2Panel();

        var buttons = [
            {
                label: _step3.stepText,
                style: 'text',
            },
            {
                callback: TPTour.step4,
                label: _step3.buttonText,
                style: 'primary',
            },
        ];

        var options = {
            closeButtonCallback: TPTour.step4
        };

        Mozilla.UITour.showMenu('controlCenter', function() {
            Mozilla.UITour.getConfiguration('availableTargets', function(config) {
                if (config.targets.indexOf('controlCenter-trackingUnblock') !== -1) {
                    Mozilla.UITour.showInfo('controlCenter-trackingUnblock', _step3.titleText, _step3.panelText, undefined, buttons, options);
                } else if (config.targets.indexOf('controlCenter-trackingBlock') !== -1) {
                    Mozilla.UITour.showInfo('controlCenter-trackingBlock', _step3.titleText, _step3.panelTextAlt, undefined, buttons, options);
                }
            });
        });

        TPTour.state = 'step3';
    };

    TPTour.step4 = function() {
        TPTour.hidePanels();
        _$dummyContent.addClass('fade-out');
        _$dummyContent.one('animationend', TPTour.showEndState);
        TPTour.state = 'step4';
    };

    TPTour.showEndState = function() {
        _$dummyContent.addClass('hidden');
        _$endContent.removeClass('hidden');
    };

    TPTour.hideStep2Panel = function() {
        _$step2Panel.addClass('hidden');
    };

    /*
     * Strips HTML from string to make sure markup
     * does not get injected in any UITour door-hangers.
     * @param stringId (data attribute string)
     */
    TPTour.getText = function(stringId) {
        return $('<div/>').html(_$strings.data(stringId)).text();
    };

    TPTour.openPrivacyPrefs = function(e) {
        e.preventDefault();
        Mozilla.UITour.openPreferences('privacy');
    };

    TPTour.bindEvents = function() {
        $('.prefs-link').on('click.tp-tour', TPTour.openPrivacyPrefs);
        $('#info-panel footer > button').on('click.tp-tour', TPTour.step3);
        $('#info-panel header > button').on('click.tp-tour', TPTour.step4);
        $(document).on('visibilitychange.tp-tour', TPTour.handleVisibilityChange);
        $('#reload-btn').on('click.tp-tour', TPTour.restartTour);
    };

    TPTour.handleVisibilityChange = function() {
        clearTimeout(_highlightTimeout);
        if (document.hidden) {
            TPTour.hidePanels();
        } else {
            _highlightTimeout = setTimeout(TPTour.showTourStep, 300);
        }
    };

    TPTour.showTourStep = function() {
        switch(TPTour.state) {
        case 'step1':
            TPTour.step1();
            break;
        case 'step2':
            TPTour.step2();
            break;
        case 'step3':
            TPTour.step3();
            break;
        }
    };

    TPTour.getStrings = function() {
        _step1 = {
            titleText: TPTour.getText('panel1Title'),
            panelText: TPTour.getText('panel1Text'),
            stepText: TPTour.getText('panel1Step'),
            buttonText: TPTour.getText('panel1Button')
        };

        _step3 = {
            titleText: TPTour.getText('panel3Title'),
            panelText: TPTour.getText('panel3Text'),
            panelTextAlt: TPTour.getText('panel3TextAlt'),
            stepText: TPTour.getText('panel3Step'),
            buttonText: TPTour.getText('panel3Button')
        };
    };

    TPTour.hidePanels = function() {
        Mozilla.UITour.hideInfo();
        Mozilla.UITour.hideMenu('controlCenter');
        TPTour.hideStep2Panel();
    };

    TPTour.resetPageState = function() {
        _$ad.removeClass('fade-out');
        _$endContent.addClass('hidden');
        _$dummyContent.removeClass('fade-out');
        _$dummyContent.addClass('fade-in');
        _$dummyContent.removeClass('hidden');
    };

    TPTour.restartTour = function() {
        TPTour.resetPageState();
        TPTour.hideStep2Panel();
        TPTour.state = 'step1';
        TPTour.showTourStep();
    };

    TPTour.init = function() {
        TPTour.getStrings();
        TPTour.bindEvents();
        // TODO can we poll for target to become available?
        setTimeout(TPTour.step1, 500);
    };

    TPTour.init();

    window.Mozilla.TPTour = TPTour;

})(window.jQuery);
