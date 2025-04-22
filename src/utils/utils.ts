export function getSettings(): string {
  const el = document.querySelector<HTMLInputElement>('#imaticWhisperer')!;

  const data = el.dataset.data;
  if (!data) {
    throw new Error('Missing data attribute on #imaticWhisperer element');
  }
  return JSON.parse(data) as string;
}
