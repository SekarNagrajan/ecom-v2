// Modified by Sekar Nagarajan (2026-08-26 17:19)
import { FormInput } from "@solverminds/shared-ui";
import { Alert, Card, Col, Row } from "antd";
import type { Control } from "react-hook-form";

import type { VgmFormValues } from "../types/vgm.types";
import { VGM_FIELD_ITEM_PROPS, vgmReqLabel } from "../utils/vgm-form-labels";

interface VgmAdditionalInfoProps {
  control: Control<VgmFormValues>;
}

export function VgmAdditionalInfo({ control }: VgmAdditionalInfoProps) {
  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Additional Information"
      bordered={false}
    >
      <Row gutter={[24, 16]} align="stretch">
        <Col xs={24} md={10}>
          <FormInput
            control={control}
            name="sendEmailId"
            label={vgmReqLabel("Acknowledgement Email ID")}
            placeholder="Comma separated for multiple emails"
            size="large"
            formItemProps={VGM_FIELD_ITEM_PROPS}
          />
        </Col>
        <Col xs={24} md={14}>
          <Alert
            message="VGM Weighing Methods"
            description={
              <ul className="vgm-methods-list">
                <li>
                  <strong>Method 1:</strong> Upon the conclusion of packing and
                  sealing a container, the shipper may weigh the packed
                  container.
                </li>
                <li>
                  <strong>Method 2:</strong> The shipper may weigh all packages
                  and cargo items, including the mass of pallets, dunnage, and
                  other securing material.
                </li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </Card>
  );
}
