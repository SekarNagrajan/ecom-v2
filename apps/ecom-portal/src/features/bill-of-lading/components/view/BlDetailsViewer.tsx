// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { Card, Col, Row, Table, Typography } from "antd";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { SI_CARGO_LINE_COLUMNS } from "../../../shipping-instruction/utils/si-cargo-line-columns";
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

      {data.routing ? (
        <Card
          className="bl-panel feature-page-card"
          size="small"
          title={
            <Title level={5} className="bl-section-title">
              {WIZARD_STEP_TITLES.routing}
            </Title>
          }
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">Origin (Print)</Text>
              <div className="form-step-readonly-value">{data.routing.originPrint}</div>
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <Text className="form-field-label">POL (Print)</Text>
              <div className="form-step-readonly-value">{data.routing.polPrint}</div>
            </Col>
          </Row>
        </Card>
      ) : null}

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

      {data.charges && data.charges.length > 0 ? (
        <Card className="bl-panel feature-page-card" size="small" title={<Title level={5}>Charges</Title>}>
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={data.charges}
            columns={[
              { title: "Code", dataIndex: "chargeCode" },
              { title: "Description", dataIndex: "description" },
              { title: "P/C/E", dataIndex: "prepaidCollect", width: 90 },
            ]}
          />
        </Card>
      ) : null}

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
                columns={SI_CARGO_LINE_COLUMNS}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
