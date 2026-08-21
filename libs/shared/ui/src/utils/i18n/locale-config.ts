import type { Locale } from 'antd/es/locale';
import enUS from 'antd/locale/en_US';

// It'll load only used locales as needed.
// 'en-US' is intentionally omitted: it's the default and is statically imported
// above (used as the synchronous fallback in `getAntdLocale`). Listing it here
// would create a mixed static+dynamic import for `antd/locale/en_US`, which
// prevents Vite from chunk-splitting the locale.
const localeLoaders: Record<string, () => Promise<{ default: Locale }>> = {
  'ar-EG': () => import('antd/locale/ar_EG'),
  'az-AZ': () => import('antd/locale/az_AZ'),
  'bg-BG': () => import('antd/locale/bg_BG'),
  'bn-BD': () => import('antd/locale/bn_BD'),
  'by-BY': () => import('antd/locale/by_BY'),
  'ca-ES': () => import('antd/locale/ca_ES'),
  'cs-CZ': () => import('antd/locale/cs_CZ'),
  'da-DK': () => import('antd/locale/da_DK'),
  'de-DE': () => import('antd/locale/de_DE'),
  'el-GR': () => import('antd/locale/el_GR'),
  'en-GB': () => import('antd/locale/en_GB'),
  'es-ES': () => import('antd/locale/es_ES'),
  'et-EE': () => import('antd/locale/et_EE'),
  'fa-IR': () => import('antd/locale/fa_IR'),
  'fi-FI': () => import('antd/locale/fi_FI'),
  'fr-BE': () => import('antd/locale/fr_BE'),
  'fr-CA': () => import('antd/locale/fr_CA'),
  'fr-FR': () => import('antd/locale/fr_FR'),
  'ga-IE': () => import('antd/locale/ga_IE'),
  'gl-ES': () => import('antd/locale/gl_ES'),
  'he-IL': () => import('antd/locale/he_IL'),
  'hi-IN': () => import('antd/locale/hi_IN'),
  'hr-HR': () => import('antd/locale/hr_HR'),
  'hu-HU': () => import('antd/locale/hu_HU'),
  'hy-AM': () => import('antd/locale/hy_AM'),
  'id-ID': () => import('antd/locale/id_ID'),
  'is-IS': () => import('antd/locale/is_IS'),
  'it-IT': () => import('antd/locale/it_IT'),
  'ja-JP': () => import('antd/locale/ja_JP'),
  'ka-GE': () => import('antd/locale/ka_GE'),
  'kk-KZ': () => import('antd/locale/kk_KZ'),
  'kn-IN': () => import('antd/locale/kn_IN'),
  'ko-KR': () => import('antd/locale/ko_KR'),
  'km-KH': () => import('antd/locale/km_KH'),
  'ku-IQ': () => import('antd/locale/ku_IQ'),
  'lv-LV': () => import('antd/locale/lv_LV'),
  'lt-LT': () => import('antd/locale/lt_LT'),
  'mk-MK': () => import('antd/locale/mk_MK'),
  'ml-IN': () => import('antd/locale/ml_IN'),
  'mn-MN': () => import('antd/locale/mn_MN'),
  'ms-MY': () => import('antd/locale/ms_MY'),
  'nb-NO': () => import('antd/locale/nb_NO'),
  'ne-NP': () => import('antd/locale/ne_NP'),
  'nl-BE': () => import('antd/locale/nl_BE'),
  'nl-NL': () => import('antd/locale/nl_NL'),
  'pl-PL': () => import('antd/locale/pl_PL'),
  'pt-BR': () => import('antd/locale/pt_BR'),
  'pt-PT': () => import('antd/locale/pt_PT'),
  'ro-RO': () => import('antd/locale/ro_RO'),
  'ru-RU': () => import('antd/locale/ru_RU'),
  'sk-SK': () => import('antd/locale/sk_SK'),
  'sl-SI': () => import('antd/locale/sl_SI'),
  'sr-RS': () => import('antd/locale/sr_RS'),
  'sv-SE': () => import('antd/locale/sv_SE'),
  'ta-IN': () => import('antd/locale/ta_IN'),
  'th-TH': () => import('antd/locale/th_TH'),
  'tr-TR': () => import('antd/locale/tr_TR'),
  'uk-UA': () => import('antd/locale/uk_UA'),
  'ur-PK': () => import('antd/locale/ur_PK'),
  'vi-VN': () => import('antd/locale/vi_VN'),
  'zh-CN': () => import('antd/locale/zh_CN'),
  'zh-HK': () => import('antd/locale/zh_HK'),
  'zh-TW': () => import('antd/locale/zh_TW'),
};

/**
 * Returns a Promise. You must await this in your App Provider.
 */
export const getAntdLocale = async (localeCode?: string): Promise<Locale> => {
  // 1. Fallback to English immediately if no code or default
  if (!localeCode || localeCode === 'en-US' || localeCode === 'en') {
    return enUS;
  }

  // 2. Look up the loader function
  const loadLocale = localeLoaders[localeCode];

  // 3. If the language isn't supported/defined in the map, fallback to English
  if (!loadLocale) {
    console.warn(
      `Locale ${localeCode} not supported in locale-config, falling back to en-US`
    );
    return enUS;
  }

  try {
    // 4. Load the specific chunk
    const module = await loadLocale();
    return module.default;
  } catch (error) {
    console.error(`Failed to load locale: ${localeCode}`, error);
    return enUS;
  }
};
