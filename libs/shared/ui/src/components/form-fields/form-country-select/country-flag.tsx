import { useState } from 'react';

const FLAG_CDN_BASE_URL = 'https://flagcdn.com';
const FLAG_ASSET_SIZE_1X = 'w20';
const FLAG_ASSET_SIZE_2X = 'w40';
const DEFAULT_FLAG_WIDTH = 20;

export function CountryFlag({
  countryCode,
  width = DEFAULT_FLAG_WIDTH,
}: {
  countryCode: string;
  width?: number;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const height = Math.round((width * 3) / 4);

  if (hasImageError) {
    return <span>{countryCode}</span>;
  }

  return (
    <picture
      style={{
        width,
        minWidth: width,
        height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <source
        type="image/webp"
        srcSet={`${getCountryFlagUrl(
          countryCode,
          FLAG_ASSET_SIZE_1X,
          'webp'
        )}, ${getCountryFlagUrl(countryCode, FLAG_ASSET_SIZE_2X, 'webp')} 2x`}
      />
      <source
        type="image/png"
        srcSet={`${getCountryFlagUrl(
          countryCode,
          FLAG_ASSET_SIZE_1X,
          'png'
        )}, ${getCountryFlagUrl(countryCode, FLAG_ASSET_SIZE_2X, 'png')} 2x`}
      />
      <img
        src={getCountryFlagUrl(countryCode, FLAG_ASSET_SIZE_1X, 'png')}
        alt={`${countryCode} flag`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        style={{
          display: 'block',
          width,
          height,
          objectFit: 'cover',
          flexShrink: 0,
        }}
        onError={() => setHasImageError(true)}
      />
    </picture>
  );
}

function getCountryFlagUrl(
  countryCode: string,
  size: string,
  extension: 'webp' | 'png'
) {
  return `${FLAG_CDN_BASE_URL}/${size}/${countryCode.toLowerCase()}.${extension}`;
}
