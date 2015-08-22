from __future__ import absolute_import

from .base import url_test


URLS = (
    url_test('/en/', '/en-US/'),
    url_test('/es/', '/es-ES/'),
    url_test('/pt/', '/pt-BR/'),
    url_test('/ja-JP-mac/', '/ja/'),
    # correct locale case
    url_test('/en-us/', '/en-US/'),
    url_test('/pt-br/', '/pt-BR/'),
    # remove double slashes
    url_test('/en-US/firefox//all/', '/en-US/firefox/all/'),
    # zh-TW
    url_test('/zh-TW/', 'http://mozilla.com.tw/'),
    url_test('/zh-CN/', 'http://firefox.com.cn/'),
    url_test('/zh-TW/mobile/', 'http://mozilla.com.tw/firefox/mobile/'),
    url_test('/zh-TW/download/', 'http://mozilla.com.tw/firefox/download/'),
    url_test('/en-US/products/download.html', '/en-US/firefox/new/?#download-fx'),
    url_test('/en-US/home/', '/en-US/firefox/'),
    url_test('/en-US/firefox/xp-any-random-thing', '/firefox/'),
    url_test('/en-US/products/firefox/start/', 'http://start.mozilla.org'),
    url_test('/start/the-sm-one', 'http://www.seamonkey-project.org/start/',
             req_headers={'User-Agent': 'mozilla seamonkey'}),
    url_test('/start/any-random-thing', '/firefox/'),
)
