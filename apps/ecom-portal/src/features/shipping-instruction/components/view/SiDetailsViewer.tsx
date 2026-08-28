// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { Card, Col, Row, Table, Typography } from "antd";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { useSiDetailQuery } from "../../api/si.queries";
import { SI_CARGO_LINE_COLUMNS } from "../../utils/si-cargo-line-columns";
import { SiLoadingCenter } from "../si-loading-center";

const { Title, Text } = Typography;

interface SiDetailsViewerProps {
  siId: string;
}

export function SiDetailsViewer({ siId }: SiDetailsViewerProps) {
  const { data, isLoading, isError } = useSiDetailQuery(siId);

  if (isLoading) {
    return (
      <div className="si-panel">
        <SiLoadingCenter />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="si-panel feature-page-card" size="small">
        <Text type="danger">Unable to load Shipping Instruction details.</Text>
      </Card>
    );
  }

  return (
    <div className="booking-stack">
      <Card
        className="si-panel feature-page-card"
        size="small"
        title={
          <Title level={5} className="si-section-title">
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
            <div className="form-step-readonly-value">
              {data.siNo || "Draft"}
            </div>
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
        </Row>
      </Card>

      <Card
        className="si-panel feature-page-card"
        size="small"
        title={
          <Title level={5} className="si-section-title">
            Parties
          </Title>
        }
      >
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.third}>
            <div className="si-party-block">
              <Text className="form-field-label">Shipper</Text>
              <Text strong>{data.parties.shipper.name}</Text>
              <Text>{data.parties.shipper.address}</Text>
              <Text>
                {data.parties.shipper.city}, {data.parties.shipper.country}
              </Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="si-party-block">
              <Text className="form-field-label">
                Consignee{" "}
                {data.parties.consignee.toOrder ? (
                  <Text type="warning">(To Order)</Text>
                ) : null}
              </Text>
              <Text strong>{data.parties.consignee.name}</Text>
              <Text>{data.parties.consignee.address}</Text>
              <Text>
                {data.parties.consignee.city}, {data.parties.consignee.country}
              </Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="si-party-block">
              <Text className="form-field-label">Notify Party</Text>
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
        className="si-panel feature-page-card"
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
                Container {index + 1}: {container.containerNo} ({container.eqpSize})
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
                scroll={{ x: 640 }}
                columns={SI_CARGO_LINE_COLUMNS}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
