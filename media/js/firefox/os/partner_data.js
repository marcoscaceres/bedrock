/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof Mozilla == 'undefined') {
    var Mozilla = {};
}

;(function($) {
    'use strict';

    // create namespace
    if (typeof Mozilla.FxOs == 'undefined') {
        Mozilla.FxOs = {};
    }

    /*
    List of countries where phones are available.

    If partner entry has 'developer_only' set to true, that partner should only
    be available on developer facing pages (/firefox/os/devices/). Currently
    used for ZTE Open C eBay links.

    Full list of ISO_3166-1 country codes is available here
    for reference: http://en.wikipedia.org/wiki/ISO_3166-1
    */

    Mozilla.FxOs.Devices = {
        'alcatel_onetouchfire': {
            'type': 'smartphone',
            'display': 'Alcatel One Touch Fire',
            'countries': ['br', 'cl', 'co', 'de', 'gr', 'hu', 'it', 'me', 'mx', 'pe', 'pl', 'rs', 've']
        },
        'alcatel_onetouchfirec': {
            'type': 'smartphone',
            'display': 'Alcatel One Touch Fire C',
            'countries': ['cl', 'cr', 'es', 'gr', 'me', 'mk', 'mx', 'pe', 'sv', 'uy']
        },
        'alcatel_onetouchfirec2g': {
            'type': 'smartphone',
            'display': 'Alcatel One Touch Fire C 2G',
            'countries': ['in']
        },
        'alcatel_onetouchfiree': {
            'type': 'smartphone',
            'display': 'Alcatel One Touch Fire E',
            'countries': ['cz', 'de', 'hu', 'pl', 'ru', 'za']
        },
        'au_fx0': {
            'type': 'smartphone',
            'display': 'au Fx0',
            'countries': ['jp']
        },
        'cherrymobile_ace': {
            'type': 'smartphone',
            'display': 'Cherry Mobile Ace',
            'countries': ['mm', 'ph']
        },
        'huawei_y300-2': {
            'type': 'smartphone',
            'display': 'Huawei Y300II',
            'countries': ['mx']
        },
        'intex_cloudfx': {
            'type': 'smartphone',
            'display': 'Intex Cloud FX',
            'countries': ['in']
        },
        'lg_fireweb': {
            'type': 'smartphone',
            'display': 'LG Fireweb',
            'countries': ['br', 'uy']
        },
        'orange_klif': {
            'type': 'smartphone',
            'display': 'Orange Klif',
            'countries': ['ci', 'cm', 'eg', 'ke', 'mg', 'mu', 'sn', 'tn']
        },
        'spice_fireonemifx1': {
            'type': 'smartphone',
            'display': 'Spice Fire One MI FX1',
            'countries': ['in']
        },
        'spice_fireonemifx2': {
            'type': 'smartphone',
            'display': 'Spice Fire One MI FX2',
            'countries': ['in']
        },
        'symphony_gofoxf15': {
            'type': 'smartphone',
            'display': 'Symphony GoFox F15',
            'countries': ['bd']
        },
        'zen_105fire': {
            'type': 'smartphone',
            'display': 'Zen 105 Fire',
            'countries': ['in']
        },
        'zte_open': {
            'type': 'smartphone',
            'display': 'ZTE Open',
            'countries': ['co', 'es', 'mx', 'pe', 've']
        },
        'zte_openc': {
            'type': 'smartphone',
            'display': 'ZTE Open C',
            'countries': ['au', 'be', 'ch', 'de', 'fr', 'gb', 'lu', 'ru', 'uy']
        },
        'zte_open2': {
            'type': 'smartphone',
            'display': 'ZTE Open II',
            'countries': ['ar', 'co', 'gt', 'pa', 'pe', 'uy']
        }
    };
})(window.jQuery);
