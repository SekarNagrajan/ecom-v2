// Modified by Sekar Nagarajan (2026-09-01 10:52) — form-field-cell gap (commodity card parity)
import {
  FormDatePicker,
  FormInput,
  FormSelect,
} from "@solverminds/shared-ui";
import { Card } from "antd";
import type { ReactNode } from "react";
import type { Control } from "react-hook-form";

import type { VgmFormValues } from "../types/vgm.types";
import {
  VGM_FIELD_ITEM_PROPS,
  vgmOptionalLabel,
  vgmReqLabel,
} from "../utils/vgm-form-labels";

interface VgmDeclarationFieldsProps {
  control: Control<VgmFormValues>;
}

function VgmDeclarationFieldCell({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="form-field-cell">
      {label}
      {children}
    </div>
  );
}

const DECLARATION_FIELD_PROPS = {
  ...VGM_FIELD_ITEM_PROPS,
  className: "vgm-declaration-field-item",
};

export function VgmDeclarationFields({ control }: VgmDeclarationFieldsProps) {
  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Declaration Details"
      bordered={false}
    >
      <div className="vgm-declaration-grid">
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Company Name")}>
          <FormInput
            control={control}
            name="companyName"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell
          label={vgmOptionalLabel("Reference / Order No")}
        >
          <FormInput
            control={control}
            name="orderNo"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Address 1")}>
          <FormInput
            control={control}
            name="addr1"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Address 2")}>
          <FormInput
            control={control}
            name="addr2"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmReqLabel("Obtained Date")}>
          <FormDatePicker
            control={control}
            name="obtainDate"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmReqLabel("Obtained Method")}>
          <FormSelect
            control={control}
            name="obtainMethod"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
            options={[
              { label: "SM1", value: "SM1" },
              { label: "SM2", value: "SM2" },
            ]}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmReqLabel("Authorized Person")}>
          <FormInput
            control={control}
            name="authPerson"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Country")}>
          <FormInput
            control={control}
            name="country"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("City")}>
          <FormInput
            control={control}
            name="city"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Zip Code")}>
          <FormInput
            control={control}
            name="zipcode"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Telephone")}>
          <FormInput
            control={control}
            name="phone"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Fax")}>
          <FormInput
            control={control}
            name="fax"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
        <VgmDeclarationFieldCell label={vgmOptionalLabel("Email")}>
          <FormInput
            control={control}
            name="email"
            size="large"
            formItemProps={DECLARATION_FIELD_PROPS}
          />
        </VgmDeclarationFieldCell>
      </div>
    </Card>
  );
}
