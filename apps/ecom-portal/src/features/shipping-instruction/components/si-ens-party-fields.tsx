// Modified by Sekar Nagarajan (2026-08-31 16:19)
import { Input, Select, Typography } from "antd";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  SI_ENS_PERSON_TYPE_OPTIONS,
  type SiEnsStepForm,
} from "../types/si.types";

const { Text } = Typography;

type PartyPrefix = "buyer" | "seller";

interface SiEnsPartyFieldsProps {
  control: Control<SiEnsStepForm>;
  prefix: PartyPrefix;
  errors: FieldErrors<SiEnsStepForm>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text type="danger" className="form-field-error">
      {message}
    </Text>
  );
}

export function SiEnsPartyFields({
  control,
  prefix,
  errors,
}: SiEnsPartyFieldsProps) {
  const partyErrors = errors[prefix];
  const label = prefix === "buyer" ? "Buyer" : "Seller";

  return (
    <div className="si-ens-party-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          {label} Name <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name={`${prefix}.name`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.name?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Address <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name={`${prefix}.address`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.address?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Address 2</label>
        <Controller
          control={control}
          name={`${prefix}.address2`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={150}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          City <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name={`${prefix}.city`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.city?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Country <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name={`${prefix}.country`}
          render={({ field }) => (
            <Input {...field} size="large" maxLength={50} />
          )}
        />
        <FieldError message={partyErrors?.country?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">State</label>
        <Controller
          control={control}
          name={`${prefix}.state`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={50}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Zip Code</label>
        <Controller
          control={control}
          name={`${prefix}.zip`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={15}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Telephone</label>
        <Controller
          control={control}
          name={`${prefix}.phone`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={20}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Fax</label>
        <Controller
          control={control}
          name={`${prefix}.fax`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={20}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Email</label>
        <Controller
          control={control}
          name={`${prefix}.email`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={75}
              type="email"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">EORI</label>
        <Controller
          control={control}
          name={`${prefix}.eori`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={17}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Type of Person</label>
        <Controller
          control={control}
          name={`${prefix}.personType`}
          render={({ field }) => (
            <Select
              size="large"
              className="form-field-full-width"
              options={[...SI_ENS_PERSON_TYPE_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
    </div>
  );
}
