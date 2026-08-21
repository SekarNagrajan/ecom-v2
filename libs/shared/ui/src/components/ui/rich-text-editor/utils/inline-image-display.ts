import type { CSSProperties } from 'react';

import type { InlineImageDisplayOptions } from '../types';

function normalizeDimension(value?: number | string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return `${value}px`;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildInlineImageStyleString(
  display?: InlineImageDisplayOptions
): string {
  const maxWidth = normalizeDimension(display?.maxWidth) ?? '100%';
  const maxHeight = normalizeDimension(display?.maxHeight);
  const objectFit = display?.objectFit;

  const declarations = [
    `max-width:${maxWidth}`,
    'height:auto',
    'display:block',
    'margin:1rem 0',
  ];

  if (maxHeight) declarations.push(`max-height:${maxHeight}`);
  if (objectFit) declarations.push(`object-fit:${objectFit}`);

  return declarations.join(';');
}

export function buildInlineImageReactStyle(
  display?: InlineImageDisplayOptions
): CSSProperties {
  const maxWidth = normalizeDimension(display?.maxWidth) ?? '100%';
  const maxHeight = normalizeDimension(display?.maxHeight);

  return {
    maxWidth,
    maxHeight,
    height: 'auto',
    display: 'block',
    margin: '1rem 0',
    objectFit: display?.objectFit,
  };
}

export function parseInlineImageStyleToReact(
  style?: string
): CSSProperties | undefined {
  if (!style) return undefined;

  const parsed: CSSProperties = {};
  const declarations = style
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const declaration of declarations) {
    const separator = declaration.indexOf(':');
    if (separator <= 0) continue;

    const key = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    if (!value) continue;

    if (key === 'max-width') parsed.maxWidth = value;
    if (key === 'max-height') parsed.maxHeight = value;
    if (key === 'width') parsed.width = value;
    if (key === 'height') parsed.height = value;
    if (key === 'object-fit')
      parsed.objectFit = value as CSSProperties['objectFit'];
    if (key === 'display') parsed.display = value as CSSProperties['display'];
    if (key === 'margin') parsed.margin = value;
  }

  return Object.keys(parsed).length > 0 ? parsed : undefined;
}
