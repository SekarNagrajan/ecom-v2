// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { Button, Flex, Image, Input, Skeleton, theme } from "antd";
import { useEffect, useState } from "react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { AppIcon, Icons } from "../../../components/icons";

interface ImageCaptchaProps {
  /** RHF control for the captcha field */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** RHF field name */
  name: string;
  /** Optional type param passed to the captcha endpoint (e.g. "LoginRate") */
  captchaType?: string;
  /** Error message from RHF fieldState */
  errorMessage?: string;
}

/**
 * Image CAPTCHA widget — parity with JSP `CaptchaGeneration` servlet.
 *
 * Renders a captcha image + refresh button. The user types the code into
 * the input field which is wired via RHF `Controller`.
 */
export function ImageCaptcha({
  control,
  name,
  captchaType = "",
  errorMessage,
}: ImageCaptchaProps) {
  const { token } = theme.useToken();
  const [version, setVersion] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);

  const params = new URLSearchParams({ v: String(version) });
  if (captchaType) params.set("type", captchaType);
  const src = `/api/captcha/image?${params.toString()}`;

  useEffect(() => {
    setLoaded(false);
  }, [version]);

  const refresh = () => {
    setVersion(Date.now());
  };

  return (
    <Flex vertical gap={token.marginXS}>
      <Flex align="center" gap={token.marginSM}>
        <div
          style={{
            width: 140,
            height: 48,
            borderRadius: token.borderRadius,
            overflow: "hidden",
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainerDisabled,
            flexShrink: 0,
          }}
        >
          {!loaded && (
            <Skeleton.Image active style={{ width: 140, height: 48 }} />
          )}
          <Image
            src={src}
            alt="CAPTCHA"
            preview={false}
            onLoad={() => setLoaded(true)}
            style={{
              display: loaded ? "block" : "none",
              width: 140,
              height: 48,
              objectFit: "contain",
            }}
          />
        </div>
        <Button
          aria-label="Reload captcha"
          icon={<AppIcon icon={Icons.refreshCw} size={16} />}
          onClick={refresh}
          size="middle"
          type="default"
          shape="circle"
        />
        <div style={{ flex: 1, minWidth: 150 }}>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Input
                {...field}
                id={`captcha-${name}`}
                aria-label="Enter captcha code"
                autoComplete="off"
                placeholder="Enter code"
                status={errorMessage ? "error" : undefined}
                style={{
                  height: 48,
                  borderRadius: token.borderRadius,
                  fontSize: 15,
                }}
              />
            )}
          />
        </div>
      </Flex>
      {errorMessage && (
        <span
          role="alert"
          style={{
            color: token.colorError,
            fontSize: token.fontSizeSM,
            marginTop: 4,
          }}
        >
          {errorMessage}
        </span>
      )}
    </Flex>
  );
}
