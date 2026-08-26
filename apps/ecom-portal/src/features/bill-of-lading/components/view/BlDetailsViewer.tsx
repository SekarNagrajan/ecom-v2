// Created by Sekar Nagarajan (2026-08-26 13:04)
import { Card, Col, Row, Table, Typography } from "antd";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { useBLDetailQuery } from "../../api/bl.queries";
import { BlLoadingCenter } from "../bl-loading-center";

const { Title, Text } = Typography;

interface BlDetailsViewerProps {
  blNo: string;
}

export function BlDetailsViewer({ blNo }: BlDetailsViewerProps) {
  const { data, isLoading, isError } = useBLDetailQuery(blNo);

  if (isLoading) {
    return (
      <div className="bl-panel">
        <BlLoadingCenter />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="bl-panel feature-page-card" size="small">
        <Text type="danger">Unable to load Bill of Lading details.</Text>
      </Card>
    );
  }

  return (
    <div className="booking-stack">
      <Card
        className="bl-panel feature-page-card"
        size="small"
        title={
          <Title level={5} className="bl-section-title">
            {WIZARD_STEP_TITLES.masterDetails}
          </Title>
        }
      >
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Booking Number</Text>
            <div className="form-step-readonly-value">{data.bookingNo}</div>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">SI Number</Text>
            <div className="form-step-readonly-value">{data.siNo}</div>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">B/L Type</Text>
            <div className="form-step-readonly-value">{data.blType}</div>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Release Type</Text>
            <div className="form-step-readonly-value">
              {data.releaseType === "O" ? "Original" : "Telex"}
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Freight Option</Text>
            <div className="form-step-readonly-value">{data.freightOption}</div>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Route</Text>
            <div className="form-step-readonly-value">
              {data.origin} → {data.delivery}
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        className="bl-panel feature-page-card"
        size="small"
        title={
          <Title level={5} className="bl-section-title">
            Parties
          </Title>
        }
      >
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">SHIPPER</Text>
              <Text strong>{data.parties.shipper.name}</Text>
              <Text>{data.parties.shipper.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">
                CONSIGNEE{" "}
                {data.parties.consignee.toOrder ? (
                  <Text type="warning">(TO ORDER)</Text>
                ) : null}
              </Text>
              <Text strong>{data.parties.consignee.name}</Text>
              <Text>{data.parties.consignee.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">NOTIFY PARTY</Text>
              <Text strong>{data.parties.notify.name}</Text>
              <Text>{data.parties.notify.address}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        className="bl-panel feature-page-card"
        size="small"
        title={
          <Title level={5} className="bl-section-title">
            Cargo & Containers
          </Title>
        }
      >
        {data.containers.map((c, i) => (
          <div key={c.id} className="bl-container-block">
            <div className="bl-container-block__header">
              <Text strong>
                Container {i + 1}: {c.containerNo} ({c.eqpSize})
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
  );
}
