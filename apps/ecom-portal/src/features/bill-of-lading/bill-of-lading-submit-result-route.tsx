// Created by Sekar Nagarajan (2026-08-28 11:50)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, InputNumber, Result, Space, Typography } from "antd";
import { useNavigate, useParams } from "@tanstack/react-router";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { sendBLAmendmentMail } from "./api/bl.api";
import { useBLDetailQuery } from "./api/bl.queries";
import { BlModuleStyles } from "./components/bl-module-styles";
import type { BLSubmitResult } from "./types/bl.types";

const { Text, Paragraph } = Typography;

export function BillOfLadingSubmitResultRoute() {
  const navigate = useNavigate();
  const toast = useToast();
  const { blNo } = useParams({ strict: false }) as { blNo: string };
  const { data: detail } = useBLDetailQuery(blNo);

  const submitResult = detail?.submitResult;

  const handleAmendmentMail = async () => {
    const res = await sendBLAmendmentMail(blNo);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Amendment notification sent (mock)");
  };

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="wizard-page-card">
        <ModuleScreenHeader
          icon={Icons.fileCheck}
          title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
          marginBottom={0}
        />
        <Result
          status={submitResult?.success ? "success" : "warning"}
          title="B/L Submitted"
          subTitle={
            <Space direction="vertical" className="bl-submit-result">
              {(submitResult?.messages ?? ["B/L submitted."]).map((msg) => (
                <Paragraph key={msg}>{msg}</Paragraph>
              ))}
              {submitResult?.insuranceMessage ? (
                <Text type="secondary">{submitResult.insuranceMessage}</Text>
              ) : null}
              {submitResult?.fileRestrictionMessage ? (
                <Text type="warning">{submitResult.fileRestrictionMessage}</Text>
              ) : null}
            </Space>
          }
          extra={
            <Space wrap>
              <AppButton
                type="primary"
                onClick={() => navigate({ to: `/app/bl/${blNo}` })}
              >
                View B/L
              </AppButton>
              <AppButton onClick={() => navigate({ to: "/app/bl" })}>
                Back to List
              </AppButton>
              {detail?.status === "S" ? (
                <AppButton
                  icon={<AppIcon icon={Icons.mail} size={16} />}
                  onClick={handleAmendmentMail}
                >
                  Send Amendment Mail
                </AppButton>
              ) : null}
            </Space>
          }
        />
      </Card>
    </FeaturePageShell>
  );
}
