// Created by Sekar Nagarajan (2026-08-28 12:00)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Input, Row, Typography } from "antd";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { RESPONSIVE_COL } from "../../constants/responsive-grid";
import {
  useMCNDetailQuery,
  useMCNPrintMutation,
} from "./api/bl.queries";
import { submitMCN, updateMCN } from "./api/bl.api";
import { BlModuleStyles } from "./components/bl-module-styles";

const { Text } = Typography;

const mcnEditSchema = z.object({
  remarks: z.string().optional(),
  cargoDescription: z.string().min(1, "Cargo description is required"),
  freightTerms: z.string().min(1, "Freight terms are required"),
});

type McnEditValues = z.infer<typeof mcnEditSchema>;

export function BillOfLadingMcnEditRoute() {
  const navigate = useNavigate();
  const toast = useToast();
  const { mcnId } = useParams({ strict: false }) as { mcnId: string };
  const { data: detail, isLoading } = useMCNDetailQuery(mcnId);
  const { mutate: printMcn } = useMCNPrintMutation();

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
    toast.success("MCN saved");
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
    toast.success("MCN submitted");
    navigate({ to: "/app/bl/mcn" });
  };

  if (isLoading || !detail) {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <Card loading={isLoading}>Loading MCN…</Card>
      </FeaturePageShell>
    );
  }

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={Icons.clipboardList}
          title={`Edit MCN: ${mcnId}`}
          subtitle={`B/L ${detail.blNo} · ${detail.status}`}
          extra={
            <AppButton onClick={() => navigate({ to: "/app/bl/mcn" })}>
              Back
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
                <label className="form-field-label">Cargo Description</label>
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
                <label className="form-field-label">Freight Terms</label>
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
                <label className="form-field-label">Remarks</label>
                <Controller
                  control={control}
                  name="remarks"
                  render={({ field }) => (
                    <Input.TextArea {...field} rows={3} />
                  )}
                />
              </div>
            </Col>
          </Row>

          <div className="form-step-footer form-step-footer--split">
            <AppButton onClick={() => handleSubmit(onSave)()}>Save Draft</AppButton>
            <AppButton
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              onClick={() => printMcn({ mcnId })}
            >
              Print
            </AppButton>
            <AppButton type="primary" htmlType="submit">
              Submit MCN
            </AppButton>
          </div>
        </form>
      </Card>
    </FeaturePageShell>
  );
}
