/**
 * FormFields (lightweight — no heavy deps)
 */
export * from './form-fields/common';
export * from './form-fields/form-autocomplete';
export * from './form-fields/form-date-picker';
export * from './form-fields/form-date-range-picker';
export * from './form-fields/form-input';
export * from './form-fields/form-input-number';
export * from './form-fields/form-textarea';
export * from './form-fields/form-country-select';
export * from './form-fields/form-select';
export * from './form-fields/form-tree-select';
export * from './form-fields/form-segmented';
export * from './form-fields/form-custom-select';
export * from './form-fields/form-time-picker';
export * from './form-fields/form-time-range-picker';
export * from './form-fields/form-phone-input';
export * from './form-fields/form-checkbox';
export * from './form-fields/form-checkbox-group';
export * from './form-fields/form-radio';
export * from './form-fields/form-radio-group';
export * from './form-fields/form-switch';
export * from './form-fields/form-otp';
export * from './form-fields/inline-field';
export * from './form-fields/inline-text-edit';
export * from './form-fields/inline-phone-edit';

/**
 * UI components (lightweight — no heavy deps)
 */
export * from './ui/autocomplete';
export * from './ui/combobox';
export * from './ui/button';
export * from './ui/date-picker';
export * from './ui/date-range-picker';
export * from './ui/tabs';
export * from './ui/dialog';
export * from './ui/checkbox';
export * from './ui/checkbox-group';
export * from './ui/radio';
export * from './ui/radio-group';
export * from './ui/select';
export * from './ui/switch';
export * from './ui/segmented';
export * from './ui/segmented-button-tabs';
export * from './ui/upload';
export * from './ui/audio-dictation-button';
export * from './ui/grammar-improve-button';
export * from './ui/tone-rewrite-button';
export * from './ui/app-textarea';

/**
 * Display components
 */
export * from './formatted-date';
export * from './formatted-number';

/**
 * Heavy components — NOT re-exported to avoid bundling Tiptap,
 * FullCalendar, and AG Grid in the initial bundle.
 *
 * Import via subpath exports instead:
 *   '@solverminds/shared-ui/editor'     → RichTextEditor + editor types
 *   '@solverminds/shared-ui/form-editor'→ FormRichTextEditor + form editor types
 *   '@solverminds/shared-ui/email'      → AppEmailCenter + email types/utils
 *   '@solverminds/shared-ui/calendar'   → AppCalendar
 *   '@solverminds/shared-ui/data-view'  → DataView + shared data-view types/utils
 *   '@solverminds/shared-ui/data-view/list-view'
 *   '@solverminds/shared-ui/data-view/kanban-view'
 *   '@solverminds/shared-ui/data-view/card-view'
 */
