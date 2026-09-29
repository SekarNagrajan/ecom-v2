// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Space, Table, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { NavBillOfLadingIcon } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../../constants/module-titles";
import {
  useModuleTitles,
  useWizardStepTitles,
} from "../../../i18n/use-module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { SI_CARGO_LINE_COLUMNS } from "../../shipping-instruction/utils/si-cargo-line-columns";
import type { BLDTO, BLRowStatus } from "../types/bl.types";
import { getBLStatusColor, getBLStatusLabel } from "../utils/bl-status";
import { BlLoadingCenter } from "./bl-loading-center";

const { Title, Text } = Typography;

const TIMELINE_STATUS_KEYS: BLRowStatus[] = ["D", "S", "C", "I"];

interface BillOfLadingViewProps {
  detail: BLDTO | undefined;
  loading: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onVerify?: () => void;
  onCancel?: () => void;
  onPrint?: (type: "draft" | "original" | "nn") => void;
  onCharges?: () => void;
  extra?: React.ReactNode;
}

export function BillOfLadingView({
  detail,
  loading,
  onBack,
  onEdit,
  onVerify,
  onCancel,
  onPrint,
  onCharges,
  extra,
}: BillOfLadingViewProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const WIZARD_STEP_TITLES = useWizardStepTitles();

  const timelineSteps = useMemo(
    () =>
      TIMELINE_STATUS_KEYS.map((key) => ({
        key,
        label: getBLStatusLabel(key, t),
      })),
    [t],
  );

  if (loading) {
    return <BlLoadingCenter fill />;
  }

  if (!detail) {
    return <Text type="danger">{t("empty.blNotFound")}</Text>;
  }

  const statusIndex = timelineSteps.findIndex((s) => s.key === detail.status);

  return (
    <Space direction="vertical" size="large" className="feature-page-stack">
      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={NavBillOfLadingIcon}
          title={formatModuleScreenTitle(
            MODULE_TITLES.billOfLading,
            detail.blNo,
          )}
          marginBottom={0}
          extra={
            <Space wrap>
              {onCharges ? (
                <AppButton onClick={onCharges}>{t("actions.charges")}</AppButton>
              ) : null}
              {onPrint && detail.status !== "I" ? (
                <AppButton onClick={() => onPrint("draft")}>
                  {t("actions.draftPrint")}
                </AppButton>
              ) : null}
              {onPrint && detail.status === "C" && detail.printCount > 0 ? (
                <AppButton type="primary" onClick={() => onPrint("original")}>
                  {t("actions.originalPrint")}
                </AppButton>
              ) : null}
              {onVerify && detail.status === "D" ? (
                <AppButton type="primary" onClick={onVerify}>
                  {t("actions.accept")}
                </AppButton>
              ) : null}
              {onCancel && detail.status === "S" ? (
                <AppButton danger onClick={onCancel}>
                  {t("actions.cancel")}
                </AppButton>
              ) : null}
              {onEdit && detail.status !== "I" ? (
                <AppButton onClick={onEdit}>{t("actions.edit")}</AppButton>
              ) : null}
              {extra}
              <AppButton onClick={onBack}>{t("actions.back")}</AppButton>
            </Space>
          }
        />
        <div className="bl-view-timeline">
          {timelineSteps.map((step, index) => (
            <span
              key={step.key}
              className={[
                "bl-view-timeline__step",
                index < statusIndex ? "is-done" : undefined,
                index === statusIndex ? "is-current" : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {step.label}
            </span>
          ))}
        </div>
        <Tag className="bl-status-tag" color={getBLStatusColor(detail.status)}>
          {getBLStatusLabel(detail.status, t)}
        </Tag>
      </Card>

      <Card
        className="feature-page-card"
        title={<Title level={5}>{WIZARD_STEP_TITLES.masterDetails}</Title>}
        size="small"
      >
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.bookingNumber")}</Text>
            <Text strong>{detail.bookingNo}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.siNumber")}</Text>
            <Text strong>{detail.siNo}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.blType")}</Text>
            <Text strong>{detail.blType}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.releaseType")}</Text>
            <Text strong>
              {detail.releaseType === "O"
                ? t("labels.original")
                : t("labels.telex")}
            </Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.freightOption")}</Text>
            <Text strong>{detail.freightOption}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">{t("labels.route")}</Text>
            <Text strong>
              {detail.origin} → {detail.delivery}
            </Text>
          </Col>
        </Row>
      </Card>

      {detail.routing ? (
        <Card
          className="feature-page-card"
          title={<Title level={5}>{WIZARD_STEP_TITLES.routing}</Title>}
          size="small"
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">{t("labels.originPrint")}</Text>
              <Text strong>{detail.routing.originPrint}</Text>
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">{t("labels.polPrint")}</Text>
              <Text strong>{detail.routing.polPrint}</Text>
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">{t("labels.podPrint")}</Text>
              <Text strong>{detail.routing.podPrint}</Text>
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">{t("labels.deliveryPrint")}</Text>
              <Text strong>{detail.routing.deliveryPrint}</Text>
            </Col>
            {detail.routing.vesselVoyage ? (
              <Col {...RESPONSIVE_COL.formHalf}>
                <Text className="form-field-label">{t("labels.vesselVoyage")}</Text>
                <Text strong>{detail.routing.vesselVoyage}</Text>
              </Col>
            ) : null}
          </Row>
        </Card>
      ) : null}

      <Card
        className="feature-page-card"
        title={<Title level={5}>{t("labels.parties")}</Title>}
        size="small"
      >
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">{t("labels.shipper")}</Text>
              <Text strong>{detail.parties.shipper.name}</Text>
              <Text>{detail.parties.shipper.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">
                {t("labels.consignee")}{" "}
                {detail.parties.consignee.toOrder ? (
                  <Text type="warning">{t("labels.toOrder")}</Text>
                ) : null}
              </Text>
              <Text strong>{detail.parties.consignee.name}</Text>
              <Text>{detail.parties.consignee.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">{t("labels.notifyParty")}</Text>
              <Text strong>{detail.parties.notify.name}</Text>
              <Text>{detail.parties.notify.address}</Text>
            </div>
          </Col>
          {detail.parties.notify2 ? (
            <Col {...RESPONSIVE_COL.third}>
              <div className="bl-party-block">
                <Text className="form-field-label">{t("labels.notify2")}</Text>
                <Text strong>{detail.parties.notify2.name}</Text>
              </div>
            </Col>
          ) : null}
          {detail.parties.forwarder ? (
            <Col {...RESPONSIVE_COL.third}>
              <div className="bl-party-block">
                <Text className="form-field-label">{t("labels.forwarder")}</Text>
                <Text strong>{detail.parties.forwarder.name}</Text>
              </div>
            </Col>
          ) : null}
        </Row>
      </Card>

      {detail.charges && detail.charges.length > 0 ? (
        <Card
          className="feature-page-card"
          title={<Title level={5}>{t("labels.charges")}</Title>}
          size="small"
        >
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={detail.charges}
            columns={[
              { title: t("columns.code"), dataIndex: "chargeCode" },
              { title: t("columns.description"), dataIndex: "description" },
              {
                title: t("columns.pce"),
                dataIndex: "prepaidCollect",
                width: 90,
              },
              { title: t("columns.payor"), dataIndex: "payByCustType" },
            ]}
          />
        </Card>
      ) : null}

      {detail.insurance?.isInsuranceRequired ? (
        <Card
          className="feature-page-card"
          title={<Title level={5}>{t("labels.insurance")}</Title>}
          size="small"
        >
          <Text>
            {t("labels.coverage", {
              currency: detail.insurance.currency,
              value: detail.insurance.cargoValue,
            })}
            {detail.insurance.policyNo
              ? t("labels.policySuffix", {
                  policyNo: detail.insurance.policyNo,
                })
              : ""}
          </Text>
        </Card>
      ) : null}

      {detail.preview && Object.keys(detail.preview).length > 0 ? (
        <Card
          className="feature-page-card"
          title={<Title level={5}>{t("labels.previewFields")}</Title>}
          size="small"
        >
          <Row gutter={[24, 24]}>
            {detail.preview.declaredValue ? (
              <Col {...RESPONSIVE_COL.formThird}>
                <Text className="form-field-label">{t("labels.declaredValue")}</Text>
                <Text strong>{detail.preview.declaredValue}</Text>
              </Col>
            ) : null}
            {detail.preview.siCustRemarks ? (
              <Col {...RESPONSIVE_COL.formHalf}>
                <Text className="form-field-label">{t("labels.remarks")}</Text>
                <Text>{detail.preview.siCustRemarks}</Text>
              </Col>
            ) : null}
          </Row>
        </Card>
      ) : null}

      <Card
        className="feature-page-card"
        title={<Title level={5}>{t("labels.cargoContainers")}</Title>}
        size="small"
      >
        {detail.containers.map((c, i) => (
          <div key={c.id} className="bl-container-block">
            <div className="bl-container-block__header">
              <Text strong>
                {t("labels.containerN", {
                  n: i + 1,
                  containerNo: c.containerNo,
                  eqpSize: c.eqpSize,
                })}
              </Text>
            </div>
            <div className="responsive-table-wrap custom-scroll">
              <Table
                size="small"
                dataSource={c.cargoLines}
                rowKey="id"
                pagination={false}
                bordered
                scroll={{ x: 640 }}
                columns={SI_CARGO_LINE_COLUMNS}
              />
            </div>
          </div>
        ))}
      </Card>
    </Space>
  );
}
