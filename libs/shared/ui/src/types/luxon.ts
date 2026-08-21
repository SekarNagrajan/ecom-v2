export interface LuxonPreset<T> {
  label: string;
  value: T | (() => T);
}
