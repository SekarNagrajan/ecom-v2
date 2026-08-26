// Modified by Sekar Nagarajan (2026-08-24 17:15)
import { Typography, theme } from 'antd';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppIcon } from '../icons';

const { Title, Text } = Typography;

export interface ModuleScreenHeaderProps {
  extra?: ReactNode;
  icon: LucideIcon;
  marginBottom?: number;
  subtitle?: string;
  title: string;
}

export function ModuleScreenHeader({
  extra,
  icon,
  marginBottom,
  subtitle,
  title,
}: ModuleScreenHeaderProps) {
  const { token } = theme.useToken();

  return (
    <div
      className="module-screen-header"
      style={marginBottom !== undefined ? { marginBottom } : undefined}
    >
      <div>
        <div className="module-screen-header__title-row">
          <AppIcon icon={icon} size={Math.round(token.fontSizeHeading4)} />
          <Title level={4} className="module-screen-header__title">
            {title}
          </Title>
        </div>
        {subtitle ? (
          <Text type="secondary" className="module-screen-header__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {extra ? <div className="module-screen-header__extra">{extra}</div> : null}
    </div>
  );
}
