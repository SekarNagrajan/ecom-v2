export const DEFAULT_EMAIL_PAGE_SIZE = 20;
export const DEFAULT_EMAIL_SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_DRAFT_AUTOSAVE_DEBOUNCE_MS = 10_000;

export const DEFAULT_ATTACHMENT_CONSTRAINTS = {
  maxFiles: 10,
  maxFileSizeBytes: 25 * 1024 * 1024,
  acceptedMimeTypes: [] as string[],
};
