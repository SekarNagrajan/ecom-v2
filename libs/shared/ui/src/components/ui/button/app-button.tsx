import { Button, ConfigProvider } from 'antd';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactElement,
} from 'react';

import { useAppConfig } from '../../../hooks';
import { getAntdButtonConfig } from './helper';
import type { AppButtonProps, AppButtonVariant } from './types';

export function AppButton({
  children,
  className,
  appVariant,
  enableRateLimit = false,
  rateLimitDuration = 3000,
  onClick,
  disabled,
  loading,
  ...rest
}: AppButtonProps) {
  const { secondaryColor } = useAppConfig();

  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>
    ) => {
      if (cooldown > 0 || loading || disabled) return;

      onClick?.(e);

      if (enableRateLimit) {
        const durationSeconds = Math.ceil(rateLimitDuration / 1000);
        setCooldown(durationSeconds);

        timerRef.current = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    },
    [cooldown, loading, disabled, enableRateLimit, rateLimitDuration, onClick]
  );

  const antdConfig = appVariant ? getAntdButtonConfig(appVariant) : {};
  const isRateLimited = cooldown > 0;

  return (
    <ButtonWrapper variant={appVariant} secondaryColor={secondaryColor}>
      <Button
        {...antdConfig}
        {...rest} // user can override via props
        className={className}
        onClick={handleClick}
        disabled={disabled || isRateLimited}
        loading={loading}
      >
        {children}
        {isRateLimited && (
          <span className="text-xs opacity-80">({cooldown}s)</span>
        )}
      </Button>
    </ButtonWrapper>
  );
}

// Example on how to use custom secondary color
const ButtonWrapper = ({
  variant,
  children,
  secondaryColor,
}: {
  variant?: AppButtonVariant;
  children: ReactElement;
  secondaryColor: string;
}) =>
  variant === 'secondary' ? (
    <ConfigProvider theme={{ token: { colorPrimary: secondaryColor } }}>
      {children}
    </ConfigProvider>
  ) : (
    children
  );
