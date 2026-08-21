import DOMPurify from 'dompurify';

function enforceAttachmentLinkBehavior(html: string): string {
  if (
    !html.includes('data-file-attachment') ||
    typeof document === 'undefined'
  ) {
    return html;
  }

  const container = document.createElement('div');
  container.innerHTML = html;

  const attachmentLinks = container.querySelectorAll<HTMLAnchorElement>(
    'a[data-file-attachment]'
  );

  attachmentLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const dataUrl = link.getAttribute('data-url');

    if ((!href || href.trim().length === 0) && dataUrl) {
      link.setAttribute('href', dataUrl);
    }

    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return container.innerHTML;
}

/**
 * Sanitizes HTML strings to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous tags and attributes.
 *
 * @param html The raw HTML string to sanitize
 * @returns A safe HTML string
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return '';

  // Basic configuration for Tiptap/RichText content
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p',
      'br',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'img',
      'div',
      'span',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'target',
      'rel',
      'style',
      'class',
      'data-file-attachment',
      'data-file-name',
      'data-file-size',
      'data-mime-type',
      'data-uploaded-at',
      'data-url',
      'data-attachment-id',
    ],
  }) as string;

  return enforceAttachmentLinkBehavior(sanitized);
};
