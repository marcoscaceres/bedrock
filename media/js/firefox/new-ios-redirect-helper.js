/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof window.Mozilla === 'undefined') {
    window.Mozilla = {};
}

(function(Mozilla) {
    'use strict';

    Mozilla.FirefoxNewIosRedirectHelper = {
        getDomainFromURL: function(url) {
            var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];

            if (domain) {
                // keep all subdomains except www
                domain = domain.replace('www.', '');
            }

            return domain;
        },
        isSearchEngine: function(domain) {
            var result = false;

            // only concerned with these top 4 for now
            if ((/bing\.|duckduckgo\.|google\.|yahoo\./i).test(domain)) {
                // remove TLD from domain
                result = domain.replace(/\..+/, '');
            }

            return result;
        }
    };
})(window.Mozilla);
