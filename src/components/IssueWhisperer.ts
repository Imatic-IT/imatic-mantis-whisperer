import { Issue } from './Issue';
import { getSettings } from '../utils/utils';
import { z } from 'zod';
import { html, render } from 'lit-html';
import { IssueWhispererController } from './IssueWhispererController';
import { IssueRenderer } from './IssueRenderer';
import { InputHandler } from './InputHandler';
import { CSS_CLASSES } from './constatns';

const settingsSchema = z.object({
  autocompleteIssueWindowSettings: z.record(z.string()),
  minSearchLength: z.number(),
  minSearchLengthMessage: z.string(),
  noIssueFoundMessage: z.string(),
  searchForIssueMessage: z.string(),
  searchInputNames: z.array(z.string()),
  fieldSeparator: z.string(),
  submitOnSelect: z.object({
    enter: z.boolean(),
    click: z.boolean(),
    auto_submit_insterted_issue: z.boolean(),
  }),
});

type settingsModel = z.infer<typeof settingsSchema>;

export class IssueWhisperer {
  private controller!: IssueWhispererController;
  private overlayElement!: HTMLElement;
  private issueListElement!: HTMLUListElement;
  private settings!: settingsModel;
  private inputHandler!: InputHandler;
  private issue: Issue;
  private renderer!: IssueRenderer;

  constructor() {
    this.issue = new Issue();
    this.init();
  }

  private async init() {
    this.settings = settingsSchema.parse(getSettings());
    this.createIssueListOverlay();
    this.inputHandler = new InputHandler(
      this.settings.searchInputNames.concat(CSS_CLASSES.issueSearchInput),
      this.handleInput
    );

    this.renderer = new IssueRenderer(this.issueListElement);
    this.controller = new IssueWhispererController(
      this.overlayElement,
      this.issueListElement
    );
  }

  private createIssueListOverlay(): void {
    this.overlayElement = document.createElement('div');

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.classList.add(CSS_CLASSES.issueSearchInput);
    searchInput.name = CSS_CLASSES.issueSearchInput;

    Object.assign(this.overlayElement.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      width: this.settings.autocompleteIssueWindowSettings.width,
      height: this.settings.autocompleteIssueWindowSettings.height,
      transform: 'translate(-50%, -50%)',
      background: this.settings.autocompleteIssueWindowSettings.background,
      zIndex: '10000',
      overflow: 'auto',
      boxSizing: 'border-box',
      display: 'none',
    });

    this.issueListElement = document.createElement('ul');
    this.issueListElement.classList.add(CSS_CLASSES.issueList);

    Object.assign(this.issueListElement.style, {
      listStyle: 'none',
      margin: 'auto',
      padding: '0',
      width: '100%',
    });

    this.overlayElement.appendChild(searchInput);
    this.overlayElement.appendChild(this.issueListElement);
    document.body.appendChild(this.overlayElement);
  }

  private handleInput = async (event: Event) => {

    const value: string = (event.target as HTMLInputElement).value.trim();

    if (!value) {
      this.controller.hideOverlay();
      return;
    }

    if(
        /^[0-9]{7}$/.test(value) &&
        this.settings.submitOnSelect.auto_submit_insterted_issue
    )
    {
      this.controller.hideOverlay();
      this.controller.submitFormWithActiveInput();
      return
    }

    this.controller.showOverlay();

    const searchInput: HTMLInputElement = document.querySelector(
      `.${CSS_CLASSES.issueSearchInput}`
    ) as HTMLInputElement;
    searchInput.value = value;

      if (value.length < this.settings.minSearchLength) {
          this.renderMinLengthMessage();
          return;
      }

      const issues = await this.issue.searchIssues(value);
      this.renderer.renderIssues(issues);
  };

  private renderMinLengthMessage(): void {
    const template = html`
      <li class="${CSS_CLASSES.noIssuesItem}">
        ${this.settings.minSearchLengthMessage}
      </li>
    `;
    render(template, this.issueListElement);
  }

  public destroy(): void {
    this.inputHandler.destroy();
  }
}
