// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Table, Tag, Typography } from "antd";

import type { SIDTO } from "../types/si.types";

const { Text } = Typography;

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

export function CargoStep({
  data,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting,
}: StepProps) {
  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        {data.containers.map((container, index) => (
          <Card
            key={container.id}
            className="form-step-card form-step-section si-cargo-card"
            title={
              <div className="si-cargo-card-toolbar">
                <span>
                  Container {index + 1}:{" "}
                  <Text strong>{container.containerNo}</Text>
                </span>
                <Tag color="processing">{container.eqpSize}</Tag>
              </div>
            }
          >
            <Row gutter={[24, 24]} className="form-step-section">
              <Col xs={24} md={12}>
                <div className="form-field-cell">
                  <span className="form-field-label">Carrier Seal</span>
                  <div className="form-step-readonly-value">
                    {container.carrierSeal || "N/A"}
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="form-field-cell">
                  <span className="form-field-label">Shipper Seal</span>
                  <div className="form-step-readonly-value">
                    {container.shipperSeal || "N/A"}
                  </div>
                </div>
              </Col>
            </Row>

            <div className="responsive-table-wrap custom-scroll">
              <Table
                dataSource={container.cargoLines}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 720 }}
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
                    title: "Commodity",
                    dataIndex: "commodityCode",
                    key: "commodityCode",
                  },
                  { title: "HS Code", dataIndex: "hsCode", key: "hsCode" },
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
                  {
                    title: "Volume (CBM)",
                    dataIndex: "volume",
                    key: "volume",
                  },
                ]}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
