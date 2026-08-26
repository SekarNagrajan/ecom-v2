// Created by Sekar Nagarajan (2026-08-26 12:48)
import {
  FormDatePicker,
  FormInput,
  FormSelect,
} from "@solverminds/shared-ui";
import { Card, Col, Row } from "antd";
import type { Control } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { VgmFormValues } from "../types/vgm.types";
import { vgmOptionalLabel, vgmReqLabel } from "../utils/vgm-form-labels";

interface VgmDeclarationFieldsProps {
  control: Control<VgmFormValues>;
}

export function VgmDeclarationFields({ control }: VgmDeclarationFieldsProps) {
  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Declaration Details"
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="companyName"
            label={vgmOptionalLabel("Company Name")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="orderNo"
            label={vgmOptionalLabel("Reference / Order No")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="addr1"
            label={vgmOptionalLabel("Address 1")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="addr2"
            label={vgmOptionalLabel("Address 2")}
            size="large"
          />
        </Col>

        <Col {...RESPONSIVE_COL.quarter}>
          <FormDatePicker
            control={control}
            name="obtainDate"
            label={vgmReqLabel("Obtained Date")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormSelect
            control={control}
            name="obtainMethod"
            label={vgmReqLabel("Obtained Method")}
            size="large"
            options={[
              { label: "SM1", value: "SM1" },
              { label: "SM2", value: "SM2" },
            ]}
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="authPerson"
            label={vgmReqLabel("Authorized Person")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="country"
            label={vgmOptionalLabel("Country")}
            size="large"
          />
        </Col>

        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="city"
            label={vgmOptionalLabel("City")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="zipcode"
            label={vgmOptionalLabel("Zip Code")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="phone"
            label={vgmOptionalLabel("Telephone")}
            size="large"
          />
        </Col>
        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="fax"
            label={vgmOptionalLabel("Fax")}
            size="large"
          />
        </Col>

        <Col {...RESPONSIVE_COL.quarter}>
          <FormInput
            control={control}
            name="email"
            label={vgmOptionalLabel("Email")}
            size="large"
          />
        </Col>
      </Row>
    </Card>
  );
}
