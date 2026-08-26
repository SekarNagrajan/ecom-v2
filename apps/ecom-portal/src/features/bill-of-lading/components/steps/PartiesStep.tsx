// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Input, Row, Switch, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type { BLPartiesStepValues } from "../../types/bl.types";
import { blPartiesStepSchema } from "../../types/bl.types";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text, Title } = Typography;
const { TextArea } = Input;

export function PartiesStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onCancel,
  isSubmitting,
}: BLWizardStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLPartiesStepValues>({
    resolver: zodResolver(blPartiesStepSchema),
    defaultValues: {
      shipperName: data.parties.shipper.name,
      shipperAddress: data.parties.shipper.address ?? "",
      shipperPrint: data.parties.shipper.printOnBl ?? true,
      consigneeName: data.parties.consignee.name,
      consigneeAddress: data.parties.consignee.address ?? "",
      consigneePrint: data.parties.consignee.printOnBl ?? true,
      consigneeToOrder: data.parties.consignee.toOrder,
      notifyName: data.parties.notify.name,
      notifyAddress: data.parties.notify.address ?? "",
      notifyPrint: data.parties.notify.printOnBl ?? true,
    },
  });

  const onValid = (values: BLPartiesStepValues) => {
    onUpdate({
      parties: {
        shipper: {
          ...data.parties.shipper,
          name: values.shipperName,
          address: values.shipperAddress,
          printOnBl: values.shipperPrint,
        },
        consignee: {
          ...data.parties.consignee,
          name: values.consigneeName,
          address: values.consigneeAddress,
          printOnBl: values.consigneePrint,
          toOrder: values.consigneeToOrder,
        },
        notify: {
          ...data.parties.notify,
          name: values.notifyName,
          address: values.notifyAddress,
          printOnBl: values.notifyPrint,
        },
      },
    });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <div className="form-step-card-toolbar">
            <Title level={5} className="form-step-card-title">
              Shipper
            </Title>
            <div className="form-step-card-toolbar__actions">
              <Text>Print on B/L</Text>
              <Controller
                control={control}
                name="shipperPrint"
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Shipper Name <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="shipperName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter Shipper Name"
                      size="large"
                    />
                  )}
                />
                {errors.shipperName ? (
                  <Text type="danger" className="form-field-error">
                    {errors.shipperName.message}
                  </Text>
                ) : null}
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Address <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="shipperAddress"
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Enter Address"
                      size="large"
                    />
                  )}
                />
                {errors.shipperAddress ? (
                  <Text type="danger" className="form-field-error">
                    {errors.shipperAddress.message}
                  </Text>
                ) : null}
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="form-step-card form-step-section">
          <div className="form-step-card-toolbar">
            <div className="form-step-card-toolbar__actions">
              <Title level={5} className="form-step-card-title">
                Consignee
              </Title>
              <Text>To Order</Text>
              <Controller
                control={control}
                name="consigneeToOrder"
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            </div>
            <div className="form-step-card-toolbar__actions">
              <Text>Print on B/L</Text>
              <Controller
                control={control}
                name="consigneePrint"
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Consignee Name <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="consigneeName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter Consignee Name"
                      size="large"
                    />
                  )}
                />
                {errors.consigneeName ? (
                  <Text type="danger" className="form-field-error">
                    {errors.consigneeName.message}
                  </Text>
                ) : null}
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Address <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="consigneeAddress"
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Enter Address"
                      size="large"
                    />
                  )}
                />
                {errors.consigneeAddress ? (
                  <Text type="danger" className="form-field-error">
                    {errors.consigneeAddress.message}
                  </Text>
                ) : null}
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="form-step-card form-step-section">
          <div className="form-step-card-toolbar">
            <Title level={5} className="form-step-card-title">
              Notify Party
            </Title>
            <div className="form-step-card-toolbar__actions">
              <Text>Print on B/L</Text>
              <Controller
                control={control}
                name="notifyPrint"
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Notify Party Name <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="notifyName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter Notify Party Name"
                      size="large"
                    />
                  )}
                />
                {errors.notifyName ? (
                  <Text type="danger" className="form-field-error">
                    {errors.notifyName.message}
                  </Text>
                ) : null}
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Address <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="notifyAddress"
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Enter Address"
                      size="large"
                    />
                  )}
                />
                {errors.notifyAddress ? (
                  <Text type="danger" className="form-field-error">
                    {errors.notifyAddress.message}
                  </Text>
                ) : null}
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
