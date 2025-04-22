<?php

class ImaticWhispererPlugin extends MantisPlugin
{
    public function register(): void
    {
        $this->name = 'Imatic whisperer';
        $this->description = 'This plugin provides autocomplete for issue id in MantisBT.';
        $this->version = '0.1.2';
        $this->requires = [
            'MantisCore' => '2.0.0',
        ];
        $this->author = 'Imatic Software s.r.o.';
        $this->contact = 'info@imatic.cz, matej.brodziansky@imatic.cz';
        $this->url = 'https://www.imatic.cz/';
    }

    public function config(): array
    {
        return [
            'minSearchLength' => 3,
            'searchIssueLimit' => 100,
            'excludeViewStates' => [90],
            'autocompleteIssueWindowSettings' =>
                [
                    'width' => '60%',
                    'height' => '50%',
                    'background' => 'rgba(0, 0, 0, 0.8)',
                ],
            'searchInputNames' => [
                'dest_bug_id',
                'bug_id',
            ],
            'fieldSeparator' => '&#x276F;',
            'searchByFields' => [
                'id' => true,
                'description' => false,
                'additional_information' => false,
            ],
            'submitOnSelect' => [
                'enter' => true,
                'click' => true,
                'auto_submit_insterted_issue' => true,
            ]
        ];
    }

    public function hooks(): array
    {
        return [
            'EVENT_LAYOUT_BODY_END' => 'layout_body_end_hook'
        ];
    }

    public function layout_body_end_hook($p_event)
    {
        $t_data = htmlspecialchars(json_encode([
            'url' => plugin_page('searchIssue'),
            'autocompleteIssueWindowSettings' => plugin_config_get('autocompleteIssueWindowSettings'),
            'minSearchLength' => plugin_config_get('minSearchLength'),
            'minSearchLengthMessage' => sprintf(plugin_lang_get('min_search_length_message'), plugin_config_get('minSearchLength')),
            'noIssueFoundMessage' => plugin_lang_get('no_issue_found_message'),
            'searchForIssueMessage' => plugin_lang_get('search_for_issue_message'),
            'searchInputNames' => plugin_config_get('searchInputNames'),
            'fieldSeparator' => plugin_config_get('fieldSeparator'),
            'submitOnSelect' => plugin_config_get('submitOnSelect'),
        ]));
        echo '<script  id="imaticWhisperer" data-data="' . $t_data . '" src="' . plugin_file('bundle.js') . '&v=' . $this->version . '"></script>
            <link rel="stylesheet" type="text/css" href="' . plugin_file('style.css') . '&v=' . $this->version . '" />';
    }
}
