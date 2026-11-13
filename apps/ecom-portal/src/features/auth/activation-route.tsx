// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { Button, Card, Flex, Result, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import i18n from "../../i18n/config";
import { activateUser } from "./api/auth.api";

const { Title, Text } = Typography;

interface ActivationRouteProps {
  onProceedToLogin: () => void;
}

export function ActivationRoute({ onProceedToLogin }: ActivationRouteProps) {
  const { t } = useTranslation("auth");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage(i18n.t("auth:activation.missingToken"));
      return;
    }

    activateUser(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || i18n.t("auth:activation.failedFallback"));
      });
  }, []);

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Card
        style={{ borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.05)" }}
        bodyStyle={{ padding: 48 }}
      >
        {status === "loading" && (
          <Flex vertical align="center" gap={16}>
            <Spin size="medium" />
            <Title level={4} style={{ marginTop: 16 }}>
              {t("activation.loadingTitle")}
            </Title>
            <Text type="secondary">{t("activation.loadingMessage")}</Text>
          </Flex>
        )}

        {status === "success" && (
          <Result
            status="success"
            title={t("activation.successTitle")}
            subTitle={message || t("activation.successDefaultSubtitle")}
            extra={[
              <Button
                type="primary"
                size="large"
                key="login"
                onClick={onProceedToLogin}
                style={{ borderRadius: 8, padding: "0 32px" }}
              >
                {t("activation.proceedToLogin")}
              </Button>,
            ]}
          />
        )}

        {status === "error" && (
          <Result
            status="error"
            title={t("activation.failedTitle")}
            subTitle={message}
            extra={[
              <Button
                type="default"
                size="large"
                key="home"
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{ borderRadius: 8 }}
              >
                {t("activation.backToHome")}
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}
