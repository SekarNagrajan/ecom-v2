import { theme } from 'antd';

import { useAppConfig } from '../../../../hooks/use-app-config';

type EditorToken = ReturnType<typeof theme.useToken>['token'] & {
  colorFieldBg?: string;
  colorFieldBorder?: string;
};

export interface EditorTheme {
  contentClass: string;
  wrapperStyle: React.CSSProperties;
  primaryColor: string;
  fieldBackgroundColor: string;
  fieldBorderColor: string;
  fontFamily: string;
  isDark: boolean;
}

export function useEditorTheme(): EditorTheme {
  const { token } = theme.useToken();
  const { effectiveThemeMode } = useAppConfig();

  const isDark = effectiveThemeMode === 'dark';
  const editorToken = token as EditorToken;
  const fieldBackgroundColor =
    editorToken.colorFieldBg ?? token.colorBgContainer;
  const fieldBorderColor = editorToken.colorFieldBorder ?? token.colorBorder;

  return {
    contentClass: isDark ? 'editor-dark' : 'editor-light',
    wrapperStyle: {
      backgroundColor: fieldBackgroundColor,
      borderColor: fieldBorderColor,
      borderRadius: token.borderRadiusLG,
      borderWidth: token.lineWidth,
      borderStyle: 'solid',
    },
    primaryColor: token.colorPrimary,
    fieldBackgroundColor,
    fieldBorderColor,
    fontFamily: token.fontFamily,
    isDark,
  };
}
