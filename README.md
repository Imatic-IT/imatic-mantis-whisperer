# Imatic Issue Autocomplete

This plugin clones the "related issue" input field. When you start typing, it searches for issues by **summary**, displaying a modal window with the search results. Clicking on an issue number will insert it into the "related issue" input field.

## Plugin Settings

The following settings can be customized:

```php
public function config(): array
{
    return [
        'minSearchLength' => 3,
        'searchIssueLimit' => 100,
        'excludeViewStates' => [90],
        'autocompleteIssueWindowSettings' =>
            [
                'width' => '50%',
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
        ],
    ];
}
```

- min_search_length: Minimum number of characters the user needs to enter to trigger the search.
- search_issue_limit: The maximum number of issues to be searched and displayed.
- exclude_view_states: Defines which issue states will be excluded from the search.
- autocomplete_issue_window_settings: Settings for the modal window that displays the searched issues (width, height, background).
- searchInputNames: Input field names that will be used for searching.
- fieldSeparator: A character or icon used to visually separate fields in the search results. This separator will appear between the fields, making it easier for users to distinguish between different pieces of information. For example, using an arrow icon (e.g., `&#x276F;`) can enhance the readability of the displayed results by clearly indicating the relationship between the fields.
- searchByFields: A configuration option that determines which fields will be included in the search criteria when querying the database. You can specify whether to enable searching by the following fields:
  - id: If set to `true`, the plugin will search for issues by their unique identifier.
  - description: If set to `true`, the plugin will search within the issue descriptions.
  - additional_information: If set to `true`, the plugin will also include any additional information fields in the search criteria.
- submitOnSelect: An object that defines submission behavior when selecting or inserting issues:
  - enter: If true, pressing Enter on a selected issue will submit the form.
  - click: If true, clicking on a selected issue will submit the form.
  - auto_submit_insterted_issue: If true, inserting an exact 7-digit issue number (e.g., 0000422) will automatically trigger form submission without opening the search overlay.
## Additional Features

- **Search by Issue Number**: The plugin allows users to search for issues not only by their summary but also by their unique issue number. This includes support for formats with leading zeros, ensuring that all relevant issues can be easily found.

- **Project Grouping**: When displaying search results, the plugin groups issues by the current project first. This means that if you are currently working within a specific project, any relevant issues from that project will be prioritized in the results. After grouping by the current project, the remaining issues are then organized by their respective project names.

- **Sorting by Issue Status**: Within each project grouping, issues are sorted by their status.
- **Keyboard Navigation**: When the overlay and issue list are visible, users can navigate through the search results using the arrow keys. Pressing the Enter key will insert the selected issue into the input field.

## Installation

- Copy all files from Imatic Mantis Issue Type Checker into the plugins/ImaticWhisperer directory.
- In Mantis plugins page, install the plugin.
- run npm install

## Browser Requirements

The plugin requires a modern browser that supports ES6 features. Ensure your browser is up-to-date to fully utilize the plugin's functionality.

## Compatibility and Customization

- **Database Compatibility**: This plugin has been tested primarily with PostgreSQL. The provided query for MySQL in the `plugins/ImaticWhisperer/pages/searchIssue.php` file may not function correctly and will need further testing and adjustments.

- **Support for Other Databases**: Additional modifications are required to ensure compatibility with other database types. You can explore and implement necessary changes in the `buildFinalQuery()` method.

If you have any questions or require further assistance, please feel free to contact us.
