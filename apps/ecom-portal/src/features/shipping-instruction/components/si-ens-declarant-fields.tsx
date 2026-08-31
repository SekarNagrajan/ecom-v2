// Modified by Sekar Nagarajan (2026-08-31 16:19)
import { Input, Segmented, Typography } from "antd";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { SiEnsStepForm } from "../types/si.types";

const { Text } = Typography;

interface SiEnsDeclarantFieldsProps {
  control: Control<SiEnsStepForm>;
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

export function SiEnsDeclarantFields({
  control,
  errors,
}: SiEnsDeclarantFieldsProps) {
  const dErrors = errors.declarant;

  return (
    <div className="si-ens-party-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          Declarant Name <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.name"
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
        <FieldError message={dErrors?.name?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Address <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.address"
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
        <FieldError message={dErrors?.address?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Address 2 <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.address2"
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
        <FieldError message={dErrors?.address2?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          City <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.city"
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
        <FieldError message={dErrors?.city?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">Zip Code</label>
        <Controller
          control={control}
          name="declarant.zip"
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
        <label className="form-field-label">
          Country <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.country"
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
        <FieldError message={dErrors?.country?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          State <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.state"
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
        <FieldError message={dErrors?.state?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Telephone <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.telephone"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={25}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.telephone?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          EORI <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.eori"
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
        <FieldError message={dErrors?.eori?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Email <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.email"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={100}
              type="email"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.email?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          Declarant Filing Type <Text type="danger"> *</Text>
        </label>
        <Controller
          control={control}
          name="declarant.fillingType"
          render={({ field: { value, onChange } }) => (
            <Segmented
              block
              className="form-field-full-width si-master-segmented"
              value={value ?? "House BL"}
              onChange={onChange}
              options={[
                { label: "House BL", value: "House BL" },
                { label: "Sub-House BL", value: "Sub-House BL" },
              ]}
            />
          )}
        />
        <FieldError message={dErrors?.fillingType?.message} />
      </div>
    </div>
  );
}
