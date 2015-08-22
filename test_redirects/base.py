import requests
from decouple import config


BASE_URL = config('MOZORG_URL', 'https://www.mozilla.org')
if BASE_URL.endswith('/'):
    BASE_URL = BASE_URL.rstrip('/')


def get_abs_url(url):
    if url.startswith('/'):
        # urljoin messes with query strings too much
        return ''.join([BASE_URL, url])

    return url


def url_test(url, location=None, status_code=301, req_headers=None, req_kwargs=None):
    """Function for producing a config dict, that will then be passed into the URLTest
    class. This is done so that the class can be instantiated at test time instead of
    import time."""
    return {
        'url': url,
        'location': location,
        'status_code': status_code,
        'req_headers': req_headers,
        'req_kwargs': req_kwargs,
    }


def assert_valid_url(url, location, status_code, req_headers, req_kwargs):
    """
    Define a test of a URL's response.
    :param url: The URL in question (absolute or relative).
    :param location: If a redirect, the expected value of the "Location" header.
    :param status_code: Expected status code from the request.
    :param req_headers: Extra headers to send with the request.
    :param req_kwargs: Extra arguments to pass to requests.get()
    """
    kwargs = {'allow_redirects': False}
    if req_headers:
        kwargs['headers'] = req_headers
    if req_kwargs:
        kwargs.update(req_kwargs)

    abs_url = get_abs_url(url)
    resp = requests.get(abs_url, **kwargs)
    assert resp.status_code == status_code
    if location:
        assert 'location' in resp.headers
        assert resp.headers['location'] == get_abs_url(location)
