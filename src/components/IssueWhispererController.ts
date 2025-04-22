import { getSettings } from '../utils/utils';
import { z } from 'zod';
import { CSS_CLASSES } from './constatns';

const settingsSchema = z.object({
  submitOnSelect: z.object({
    enter: z.boolean(),
    click: z.boolean(),
  }),
  searchInputNames: z.array(z.string()),
});

type settingsModel = z.infer<typeof settingsSchema>;

export class IssueWhispererController {
  private activeInputElement!: HTMLInputElement;
  private activeHighlightedIssue!: HTMLLIElement;
  private settings!: settingsModel;

  constructor(
    private overlayElement: HTMLElement,
    private issueListElement: HTMLUListElement
  ) {
    this.overlayElement = overlayElement;
    this.issueListElement = issueListElement;

    this.init();
    this.attachEventListeners();
  }

  private init() {
    this.settings = settingsSchema.parse(getSettings());
    this.setupInputListeners();
  }

  private setupInputListeners(): void {
    const inputNames = this.settings.searchInputNames;
    inputNames.forEach((name: string) => {
      const inputElements: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(
          `input[name="${name}"]`
        ) as NodeListOf<HTMLInputElement>;

      inputElements.forEach((inputElement: HTMLInputElement) => {
        inputElement.addEventListener('focus', () =>
          this.setActiveInputField(inputElement)
        );
      });
    });
  }

  setActiveInputField(input: HTMLInputElement): void {
    this.activeInputElement = input;
    this.activeInputElement.autocomplete = 'off';
  }

  attachEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
  }

  detachListeners(): void {
    document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
  }

  destroy(): void {
    this.detachListeners();
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (!this.isOverlayVisible()) return;

    if (event.key === 'Escape') return this.hideOverlay();

    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {

      this.handleKeyboardNavigation(event);
    }
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!this.overlayElement.contains(target)) {
      this.hideOverlay();
    }

    if (
      target.classList.contains(CSS_CLASSES.issueButton) &&
      target.hasAttribute('data-id')
    ) {
      this.onIssueSelect(target as HTMLButtonElement);
    }
  }

  private handleKeyboardNavigation(event: KeyboardEvent) {
    const highlightedClass: string = CSS_CLASSES.issueSelectedHighlighted;
    this.activeHighlightedIssue = document.querySelector(
      `.${CSS_CLASSES.issueSelectedHighlighted}`
    ) as HTMLLIElement;

    const moveHighlight = (newElement: HTMLElement) => {
      if (!this.isOverlayVisible()) return;

      this.activeHighlightedIssue?.classList.remove(highlightedClass);
      this.activeHighlightedIssue = newElement as HTMLLIElement;
      this.activeHighlightedIssue.classList.add(highlightedClass);
      this.activeHighlightedIssue.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      });
    };

    if (!this.activeHighlightedIssue) {
      if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const firstChild = this.issueListElement
          .firstElementChild as HTMLLIElement;
        if (firstChild) moveHighlight(firstChild);
      }
    } else {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const sibling = this.activeHighlightedIssue.nextElementSibling;
        if (sibling) moveHighlight(sibling as HTMLLIElement);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const sibling = this.activeHighlightedIssue.previousElementSibling;
        if (sibling) moveHighlight(sibling as HTMLLIElement);
      }
      if (event.key === 'Enter') {
        // if (!this.isOverlayVisible()) return;

        event.preventDefault();
        const issueIdButton = this.activeHighlightedIssue.querySelector(
          '.issue-button'
        ) as HTMLButtonElement;
        const issueId = issueIdButton.getAttribute('data-id')!;
        this.setIssueIdIntoInput(issueId);

        if (this.settings.submitOnSelect.enter){
          this.submitFormWithActiveInput();
        }

        this.hideOverlay();
        this.activeInputElement.focus();
      }
    }
  }

  private isOverlayVisible(): boolean {
    return this.overlayElement.style.display !== 'none';
  }

  hideOverlay(): void {
    this.detachListeners();
    requestAnimationFrame((): void => {
      this.overlayElement.style.display = 'none';
    });
  }

  showOverlay(): void {
    requestAnimationFrame(() => {
      this.overlayElement.style.display = 'block';
    });
  }

  private getIssueIdFromElement(element: HTMLElement): string {
    return element.getAttribute('data-id')!;
  }

  private onIssueSelect(button: HTMLButtonElement): void {
    const issueId: string = this.getIssueIdFromElement(button);
    this.setIssueIdIntoInput(issueId);
    this.hideOverlay();

    if (this.settings.submitOnSelect.click){
      this.submitFormWithActiveInput();
    }
  }

  private setIssueIdIntoInput(issueId: string): boolean {
    if (issueId) {
      this.activeInputElement.value = issueId;
      return true;
    }
    return false;
  }

   submitFormWithActiveInput(): void {
    const form: HTMLFormElement = this.activeInputElement.closest('form')!;
    if (form) {
      form.submit();
    } else {
      throw new Error('No form found');
    }
  }
}
