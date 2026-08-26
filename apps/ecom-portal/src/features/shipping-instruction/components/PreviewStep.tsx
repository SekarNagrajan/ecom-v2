// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Table, Typography } from "antd";

import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../../constants/module-titles";
import type { SIDTO } from "../types/si.types";

const { Title, Text } = Typography;

interface StepProps {
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onCancel,
  isSubmitting,
}: StepProps) {
  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Title level={4} className="form-step-card-title si-preview-title">
          {MODULE_TITLES.shippingInstructionSummary}
        </Title>

        <Card
          className="form-step-card form-step-section"
          size="small"
          title={
            <Title level={5} className="si-section-title">
              {WIZARD_STEP_TITLES.masterDetails}
            </Title>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <span className="form-field-label">Booking Number</span>
                <div className="form-step-readonly-value">{data.bookingNo}</div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <span className="form-field-label">B/L Type</span>
                <div className="form-step-readonly-value">{data.blType}</div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <span className="form-field-label">Freight Option</span>
                <div className="form-step-readonly-value">
                  {data.freightOption}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Card
          className="form-step-card form-step-section"
          size="small"
          title={
            <Title level={5} className="si-section-title">
              Parties
            </Title>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="si-party-block">
                <span className="form-field-label">Shipper</span>
                <Text strong>{data.parties.shipper.name}</Text>
                <Text>{data.parties.shipper.address}</Text>
                <Text>
                  {data.parties.shipper.city}, {data.parties.shipper.country}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="si-party-block">
                <span className="form-field-label">
                  Consignee{" "}
                  {data.parties.consignee.toOrder ? (
                    <Text type="warning">(To Order)</Text>
                  ) : null}
                </span>
                <Text strong>{data.parties.consignee.name}</Text>
                <Text>{data.parties.consignee.address}</Text>
                <Text>
                  {data.parties.consignee.city},{" "}
                  {data.parties.consignee.country}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="si-party-block">
                <span className="form-field-label">Notify Party</span>
                <Text strong>{data.parties.notify.name}</Text>
                <Text>{data.parties.notify.address}</Text>
                <Text>
                  {data.parties.notify.city}, {data.parties.notify.country}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Card
          className="form-step-card form-step-section"
          size="small"
          title={
            <Title level={5} className="si-section-title">
              Cargo & Containers
            </Title>
          }
        >
          {data.containers.map((container, index) => (
            <div key={container.id} className="si-container-block">
              <div className="si-container-block__header">
                <Text strong>
                  Container {index + 1}: {container.containerNo} (
                  {container.eqpSize})
                </Text>
                <div>
                  <Text type="secondary">
                    Carrier Seal:{" "}
                    <Text strong>{container.carrierSeal || "N/A"}</Text>
                  </Text>
                  {" · "}
                  <Text type="secondary">
                    Shipper Seal:{" "}
                    <Text strong>{container.shipperSeal || "N/A"}</Text>
                  </Text>
                </div>
              </div>
              <div className="responsive-table-wrap custom-scroll">
                <Table
                  size="small"
                  dataSource={container.cargoLines}
                  rowKey="id"
                  pagination={false}
                  bordered
                  columns={[
                    {
                      title: "Marks & Numbers",
                      dataIndex: "marksAndNumbers",
                      key: "marksAndNumbers",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                    },
                    {
                      title: "Packages",
                      key: "packages",
                      render: (_, record) =>
                        `${record.packageCount} ${record.packageType}`,
                    },
                    {
                      title: "Gross Wt (KG)",
                      dataIndex: "grossWeight",
                      key: "grossWeight",
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={onSubmit} loading={isSubmitting}>
          Submit to ESL
        </AppButton>
      </div>
    </div>
  );
}
