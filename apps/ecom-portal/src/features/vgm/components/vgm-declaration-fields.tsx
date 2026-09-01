// Modified by Sekar Nagarajan (2026-09-01 00:56) — 5-column grid layout
import {
  FormDatePicker,
  FormInput,
  FormSelect,
} from "@solverminds/shared-ui";
import { Card } from "antd";
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

export function VgmDeclarationFields({ control }: VgmDeclarationFieldsProps) {
  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Declaration Details"
      bordered={false}
    >
      <div className="vgm-declaration-grid">
        <FormInput
          control={control}
          name="companyName"
          label={vgmOptionalLabel("Company Name")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="orderNo"
          label={vgmOptionalLabel("Reference / Order No")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="addr1"
          label={vgmOptionalLabel("Address 1")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="addr2"
          label={vgmOptionalLabel("Address 2")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormDatePicker
          control={control}
          name="obtainDate"
          label={vgmReqLabel("Obtained Date")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormSelect
          control={control}
          name="obtainMethod"
          label={vgmReqLabel("Obtained Method")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
          options={[
            { label: "SM1", value: "SM1" },
            { label: "SM2", value: "SM2" },
          ]}
        />
        <FormInput
          control={control}
          name="authPerson"
          label={vgmReqLabel("Authorized Person")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="country"
          label={vgmOptionalLabel("Country")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="city"
          label={vgmOptionalLabel("City")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="zipcode"
          label={vgmOptionalLabel("Zip Code")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="phone"
          label={vgmOptionalLabel("Telephone")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="fax"
          label={vgmOptionalLabel("Fax")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
        <FormInput
          control={control}
          name="email"
          label={vgmOptionalLabel("Email")}
          size="large"
          formItemProps={VGM_FIELD_ITEM_PROPS}
        />
      </div>
    </Card>
  );
}
