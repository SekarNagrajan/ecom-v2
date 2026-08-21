export const resolveDefaultPopupContainer = (
  node?: HTMLElement
): HTMLElement => {
  if (node?.parentElement) {
    return node.parentElement;
  }

  const ownerDocument = node?.ownerDocument ?? document;
  return ownerDocument.body;
};

export const getDefaultPopupContainer = (node?: HTMLElement) => {
  return resolveDefaultPopupContainer(node);
};

/**
 * Safely retrieves a nested value from an object using a dot-notation path.
 * @param obj The object to query.
 * @param path The path to the property (e.g., 'a.b.c').
 * @returns The value at the specified path, or undefined if not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNestedValue = <T>(obj: any, path: string): T | undefined => {
  if (!path) return undefined;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current as T;
};
