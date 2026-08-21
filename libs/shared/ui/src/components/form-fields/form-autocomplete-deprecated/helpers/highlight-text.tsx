import type { ReactNode } from 'react';

/**
 * Wraps occurrences of the query within the text with a styled span.
 * Case-insensitive.
 */
export function highlightText(text: string, query: string): ReactNode {
  if (!query || query.length < 1 || !text) {
    return text;
  }

  // Escape regex special characters in query to prevent crashes
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Split text by the query (capturing the delimiter to keep it)
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch ? (
          <span key={index} className="font-bold text-blue-600">
            {part}
          </span>
        ) : (
          part
        );
      })}
    </span>
  );
}
