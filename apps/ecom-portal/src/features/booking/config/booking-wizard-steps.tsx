import type { GlobalToken } from "antd/es/theme/interface";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { CargoStep } from "../components/CargoStep";
import { CustomerDetailsStep } from "../components/CustomerDetailsStep";
import { ENSStep } from "../components/ENSStep";
import { FileUploadStep } from "../components/FileUploadStep";
import { InsuranceStep } from "../components/InsuranceStep";
import { MasterDetailsStep } from "../components/MasterDetailsStep";
import { PreviewStep } from "../components/PreviewStep";
import { ReferenceInformationStep } from "../components/ReferenceInformationStep";
import {
  buildBookingWizardStepIds,
  type BookingWizardConfig,
  type BookingWizardStepId,
} from "./booking-wizard-config";

const PIPELINE_ICON_SIZE = 25;

export interface BookingWizardStepDefinition {
  id: BookingWizardStepId;
  title: string;
  icon: ReactNode;
  render: (props: BookingWizardStepRenderProps) => ReactNode;
}

export interface BookingWizardStepRenderProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const STEP_ICONS: Record<BookingWizardStepId, ReactNode> = {
  master: <AppIcon icon={Icons.settings} size={PIPELINE_ICON_SIZE} />,
  parties: <AppIcon icon={Icons.user} size={PIPELINE_ICON_SIZE} />,
  cargo: <AppIcon icon={Icons.container} size={PIPELINE_ICON_SIZE} />,
  ens: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
  insurance: <AppIcon icon={Icons.checkCircle} size={PIPELINE_ICON_SIZE} />,
  files: <AppIcon icon={Icons.upload} size={PIPELINE_ICON_SIZE} />,
  references: <AppIcon icon={Icons.fileText} size={PIPELINE_ICON_SIZE} />,
  preview: <AppIcon icon={Icons.eye} size={PIPELINE_ICON_SIZE} />,
};

const STEP_RENDERERS: Record<
  BookingWizardStepId,
  (props: BookingWizardStepRenderProps) => ReactNode
> = {
  master: () => <MasterDetailsStep />,
  parties: () => <CustomerDetailsStep />,
  cargo: () => <CargoStep />,
  ens: () => <ENSStep />,
  insurance: () => <InsuranceStep />,
  files: () => <FileUploadStep />,
  references: () => <ReferenceInformationStep />,
  preview: ({ onSubmit, isSubmitting }) => (
    <PreviewStep onSubmit={onSubmit ?? (() => undefined)} isSubmitting={Boolean(isSubmitting)} />
  ),
};

export function buildBookingWizardSteps(
  config: BookingWizardConfig,
  titles: Record<BookingWizardStepId, string>,
): BookingWizardStepDefinition[] {
  return buildBookingWizardStepIds(config).map((id) => ({
    id,
    title: titles[id],
    icon: STEP_ICONS[id],
    render: STEP_RENDERERS[id],
  }));
}

export function getBookingStepIcon(
  icon: ReactNode,
  index: number,
  current: number,
  token: GlobalToken,
): ReactNode {
  const isCompleted = index < current;
  const isActive = index === current;

  let background = token.colorBgContainer;
  let borderColor = token.colorBorder;
  let color = token.colorTextQuaternary;

  if (isCompleted) {
    background = token.colorSuccess;
    borderColor = token.colorSuccess;
    color = token.colorWhite;
  } else if (isActive) {
    background = token.colorPrimary;
    borderColor = token.colorPrimary;
    color = token.colorWhite;
  }

  return (
    <span
      className={[
        "wizard-step-icon",
        isActive ? "pipeline-stage-current-badge" : undefined,
        "app-icon-inherit",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background,
        border: `2px solid ${borderColor}`,
        color,
      }}
    >
      {icon}
    </span>
  );
}
