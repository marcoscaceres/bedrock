# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
import codecs
from os import path
from StringIO import StringIO
from textwrap import dedent

from django.utils import unittest

from mock import MagicMock, patch

from l10n_utils.management.commands.l10n_check import (
    get_todays_version,
    L10nParser,
    L10nTemplate,
    list_templates,
    update_templates,
)


ROOT = path.join(path.dirname(path.abspath(__file__)), 'test_files')
TEMPLATE_DIRS = (path.join(ROOT, 'templates'),)


class TestL10nCheck(unittest.TestCase):
    def _get_block(self, blocks, name):
        """Out of all blocks, grab the one with the specified name."""
        for b in blocks:
            if b['name'] == name:
                return b
        return None

    def test_list_templates(self):
        """Make sure we capture both html and txt templates."""
        TEMPLATES = ['mozorg/home.html',
                     'mozorg/emails/other.txt']
        tmpls = [t for t in list_templates()
                 if L10nTemplate(t).rel_path in TEMPLATES]
        assert len(tmpls) == len(TEMPLATES)

    def test_parse_templates(self):
        """Make sure the parser grabs the l10n block content
        correctly."""

        parser = L10nParser()
        blocks = parser.parse("""
            foo bar bizzle what?
            {% l10n baz, 20110914 %}
            mumble
            {% was %}
            wased
            {% endl10n %}
            qux
        """, only_blocks=True)

        baz = self._get_block(blocks, 'baz')

        self.assertEqual(baz['main'], 'mumble')
        self.assertEqual(baz['was'], 'wased')
        self.assertEqual(baz['version'], 20110914)

        blocks = parser.parse("""
            foo bar bizzle what?
            {% l10n baz locales=ru,bn-IN,fr 20110914 %}
            mumble
            {% endl10n %}
            qux
        """, only_blocks=True)

        baz = self._get_block(blocks, 'baz')
        self.assertEqual(baz['main'], 'mumble')
        self.assertEqual(baz['locales'], ['ru', 'bn-IN', 'fr'])
        self.assertEqual(baz['version'], 20110914)

    def test_content_halt(self):
        """Make sure the parser will halt on the content block if told
        to do so."""

        parser = L10nParser()
        content_str = 'foo bar {% block content %}baz{% endblock %} hello'
        last_token = None

        for token in parser.parse(content_str, halt_on_content=True):
            last_token = token

        self.assertEqual(last_token, False)

    def test_filter_blocks(self):
        """Should return a list of blocks appropriate for a given lang"""
        template = L10nTemplate(source="""
            {% l10n dude locales=fr,es-ES,ru 20121212 %}
                This aggression will not stand, man.
            {% endl10n %}
            {% l10n walter, locales=es-ES,ru 20121212 %}
                I'm stayin'. Finishin' my coffee.
            {% endl10n %}
            {% l10n donnie 20121212 %}
                Phone's ringing Dude.
            {% endl10n %}
        """)

        lang_blocks = template.blocks_for_lang('fr')
        self.assertEqual(len(lang_blocks), 2)
        self.assertEqual(lang_blocks[0]['name'], 'dude')
        self.assertEqual(lang_blocks[1]['name'], 'donnie')

        lang_blocks = template.blocks_for_lang('es-ES')
        self.assertEqual(len(lang_blocks), 3)
        self.assertEqual(lang_blocks[0]['name'], 'dude')
        self.assertEqual(lang_blocks[1]['name'], 'walter')
        self.assertEqual(lang_blocks[2]['name'], 'donnie')

        lang_blocks = template.blocks_for_lang('pt-BR')
        self.assertEqual(len(lang_blocks), 1)
        self.assertEqual(lang_blocks[0]['name'], 'donnie')

    @patch('l10n_utils.management.commands.l10n_check.settings.ROOT', ROOT)
    @patch('l10n_utils.management.commands.l10n_check.list_templates')
    @patch('l10n_utils.management.commands.l10n_check.L10nTemplate.copy')
    @patch('l10n_utils.management.commands.l10n_check.L10nTemplate.update')
    def test_process_template(self, update_mock, copy_mock, lt_mock):
        """
        template.process() should update existing templates and create missing
        ones. It should only do so for the right locales.
        """
        lt_mock.return_value = [
            path.join(TEMPLATE_DIRS[0], 'l10n_blocks_with_langs.html'),
            path.join(TEMPLATE_DIRS[0], 'l10n_blocks_without_langs.html'),
        ]
        update_templates(['de'])
        copy_mock.assert_called_once_with('de')
        update_mock.assert_called_once_with('de')

    def test_blocks_called_once(self):
        """
        Test that the cached_property decorator really works in our situation.
        """
        template = L10nTemplate(source="""
            {% l10n donnie 20121212 %}
                Phone's ringing Dude.
            {% endl10n %}
        """)
        with patch.object(template, 'parser') as mock_parser:
            template.blocks
            template.blocks_for_lang('de')
            template.blocks
            self.assertEqual(mock_parser.parse.call_count, 1)

    def test_update_template_no_lang(self):
        """
        template.update() should skip files without blocks for the given locale.
        """
        template = L10nTemplate(path.join(TEMPLATE_DIRS[0],
                                          'l10n_blocks_with_langs.html'))
        # cause the template to be read and parsed before mocking open
        template.blocks
        codecs_open = 'l10n_utils.management.commands.l10n_check.codecs.open'
        open_mock = MagicMock(spec=file)
        with patch(codecs_open, open_mock):
            template.update('zh-TW')
            file_handle = open_mock.return_value.__enter__.return_value
            assert not file_handle.write.called
            template.update('de')
            assert file_handle.write.called

    @patch('l10n_utils.management.commands.l10n_check.settings.ROOT', ROOT)
    def test_update_template(self):
        """
        template.update() should update lang specific templates.
        """
        template = L10nTemplate(path.join(TEMPLATE_DIRS[0],
                                          'l10n_blocks_with_langs.html'))
        # cause the template to be read and parsed before mocking open
        template.blocks
        codecs_open = 'l10n_utils.management.commands.l10n_check.codecs.open'
        open_mock = MagicMock(spec=file)
        open_buffer = StringIO()
        # for writing the new file
        open_mock.return_value.__enter__.return_value = open_buffer
        # for reading the old file
        open_mock().read.return_value = codecs.open(
            template.l10n_path('de')).read()

        with patch(codecs_open, open_mock):
            template.update('de')

        # braces doubled for .format()
        good_value = dedent("""\
            {{# Version: {0} #}}

            {{% extends "l10n_blocks_with_langs.html" %}}

            {{% l10n donnie %}}
            Phone's ringing Dude.
            {{% was %}}
            I am the walrus.
            {{% endl10n %}}\n\n
        """.format(get_todays_version()))
        self.assertEqual(open_buffer.getvalue(), good_value)

    def test_copy_template_no_lang(self):
        """
        template.copy() should skip files with no blocks for the given locale.
        :return:
        """
        template = L10nTemplate(path.join(TEMPLATE_DIRS[0],
                                          'l10n_blocks_with_langs.html'))
        # cause the template to be read and parsed before mocking open
        template.blocks
        codecs_open = 'l10n_utils.management.commands.l10n_check.codecs.open'
        open_mock = MagicMock(spec=file)
        with patch(codecs_open, open_mock):
            template.copy('zh-TW')
            file_handle = open_mock.return_value.__enter__.return_value
            assert not file_handle.write.called
            template.copy('de')
            assert file_handle.write.called

    def test_copy_template(self):
        """
        template.copy() should create missing lang specific templates.
        """
        template = L10nTemplate(path.join(TEMPLATE_DIRS[0],
                                          'l10n_blocks_without_langs.html'))
        # cause the template to be read and parsed before mocking open
        template.blocks
        codecs_open = 'l10n_utils.management.commands.l10n_check.codecs.open'
        open_mock = MagicMock(spec=file)
        open_buffer = StringIO()
        open_mock.return_value.__enter__.return_value = open_buffer
        with patch(codecs_open, open_mock):
            template.copy('de')

        # braces doubled for .format()
        good_value = dedent("""\
            {{# Version: {0} #}}

            {{% extends "l10n_blocks_without_langs.html" %}}

            {{% l10n donnie %}}
            Phone's ringing Dude.
            {{% endl10n %}}\n
        """.format(get_todays_version()))
        self.assertEqual(open_buffer.getvalue(), good_value)
