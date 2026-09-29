// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppTextarea } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Input, Row, Typography } from "antd";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AppIcon, Icons } from "../../components/icons";
import { useAiTextAssist } from "../ai-assist";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { RESPONSIVE_COL } from "../../constants/responsive-grid";
import {
  useMCNDetailQuery,
  useMCNPrintMutation,
} from "./api/bl.queries";
import { submitMCN, updateMCN } from "./api/bl.api";
import { BlLoadingCenter } from "./components/bl-loading-center";
import { BlModuleStyles } from "./components/bl-module-styles";

const { Text } = Typography;

type McnEditTranslateFn = (key: string) => string;

function createMcnEditSchema(t: McnEditTranslateFn) {
  return z.object({
    remarks: z.string().optional(),
    cargoDescription: z.string().min(1, t("mcn.cargoDescriptionRequired")),
    freightTerms: z.string().min(1, t("mcn.freightTermsRequired")),
  });
}

type McnEditValues = z.infer<ReturnType<typeof createMcnEditSchema>>;

export function BillOfLadingMcnEditRoute() {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const navigate = useNavigate();
  const toast = useToast();
  const { textareaAssistProps } = useAiTextAssist();
  const { mcnId } = useParams({ strict: false }) as { mcnId: string };
  const { data: detail, isLoading } = useMCNDetailQuery(mcnId);
  const { mutate: printMcn } = useMCNPrintMutation();

  const mcnEditSchema = useMemo(() => createMcnEditSchema(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<McnEditValues>({
    resolver: zodResolver(mcnEditSchema),
    values: {
      remarks: detail?.remarks ?? "",
      cargoDescription: detail?.cargoDescription ?? "",
      freightTerms: detail?.freightTerms ?? "PREPAID",
    },
  });

  const onSave = async (values: McnEditValues) => {
    const res = await updateMCN(mcnId, values);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(t("toasts.mcnSaved"));
  };

  const onSubmitMcn = async (values: McnEditValues) => {
    const saveRes = await updateMCN(mcnId, values);
    if (saveRes.error) {
      toast.error(saveRes.error.message);
      return;
    }
    const submitRes = await submitMCN(mcnId);
    if (submitRes.error) {
      toast.error(submitRes.error.message);
      return;
    }
    toast.success(t("toasts.mcnSubmitted"));
    navigate({ to: "/app/bl/mcn" });
  };

  if (isLoading || !detail) {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <BlLoadingCenter fill />
      </FeaturePageShell>
    );
  }

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={Icons.clipboardList}
          title={t("mcn.editTitle", { mcnId })}
          subtitle={t("mcn.editSubtitle", {
            blNo: detail.blNo,
            status: detail.status,
          })}
          extra={
            <AppButton onClick={() => navigate({ to: "/app/bl/mcn" })}>
              {t("actions.back")}
            </AppButton>
          }
        />

        <form
          onSubmit={handleSubmit(onSubmitMcn)}
          className="form-step-layout form-step-section"
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  {t("mcn.cargoDescription")}
                </label>
                <Controller
                  control={control}
                  name="cargoDescription"
                  render={({ field }) => <Input {...field} size="large" />}
                />
                {errors.cargoDescription ? (
                  <Text type="danger">{errors.cargoDescription.message}</Text>
                ) : null}
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  {t("mcn.freightTerms")}
                </label>
                <Controller
                  control={control}
                  name="freightTerms"
                  render={({ field }) => <Input {...field} size="large" />}
                />
                {errors.freightTerms ? (
                  <Text type="danger">{errors.freightTerms.message}</Text>
                ) : null}
              </div>
            </Col>
            <Col span={24}>
              <div className="form-field-cell">
                <label className="form-field-label">{t("labels.remarks")}</label>
                <Controller
                  control={control}
                  name="remarks"
                  render={({ field }) => (
                    <AppTextarea {...field} rows={3} {...textareaAssistProps} />
                  )}
                />
              </div>
            </Col>
          </Row>

          <div className="form-step-footer form-step-footer--split">
            <AppButton onClick={() => handleSubmit(onSave)()}>
              {t("common:actions.save")}
            </AppButton>
            <AppButton
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              onClick={() => printMcn({ mcnId })}
            >
              {t("common:actions.print")}
            </AppButton>
            <AppButton type="primary" htmlType="submit">
              {t("mcn.submit")}
            </AppButton>
          </div>
        </form>
      </Card>
    </FeaturePageShell>
  );
}
