// Modified by Sekar Nagarajan (2026-08-26 12:53)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { DateTime } from "luxon";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";

import { useSubmitVgmMutation } from "../api/vgm.queries";
import type {
  VgmDeclarationDTO,
  VgmFormValues,
} from "../types/vgm.types";
import { vgmFormSchema } from "../types/vgm.types";
import { extractVgmErrorMessage } from "../utils/vgm.utils";
import { VgmAdditionalInfo } from "./vgm-additional-info";
import { VgmContainersTable } from "./vgm-containers-table";
import { VgmDeclarationFields } from "./vgm-declaration-fields";
import { VgmReferenceStrip } from "./vgm-reference-strip";

function buildFormValues(data: VgmDeclarationDTO): VgmFormValues {
  const nowIso = DateTime.utc().toISO() || "";
  return {
    companyName: data.companyName || "",
    orderNo: data.orderNo || "",
    addr1: data.addr1 || "",
    addr2: data.addr2 || "",
    obtainDate: data.obtainDate || nowIso,
    obtainMethod: data.obtainMethod || "SM1",
    authPerson: data.authPerson || "",
    country: data.country || "",
    city: data.city || "",
    phone: data.phone || "",
    email: data.email || "",
    zipcode: data.zipcode || "",
    fax: data.fax || "",
    sendEmailId: "",
    containers: data.containers.map((c) => ({
      containerNo: c.containerNo,
      eqpType: c.eqpType,
      tareWeight: c.tareWeight,
      vgmWeight: c.vgmWeight || 0,
      vgmUnit: c.vgmUnit || "K",
      method: c.method || "SM1",
      date: c.date || nowIso,
    })),
  };
}

interface VgmDeclarationFormProps {
  data: VgmDeclarationDTO;
  referenceType: "bookno" | "blno";
  referenceNo: string;
  onCancel: () => void;
  onSubmitted: () => void;
}

export function VgmDeclarationForm({
  data,
  referenceType,
  referenceNo,
  onCancel,
  onSubmitted,
}: VgmDeclarationFormProps) {
  const toast = useToast();
  const submitMutation = useSubmitVgmMutation();

  // defaultValues only — RHF `values` with a fresh object each render loops forever
  const vgmForm = useForm<VgmFormValues>({
    // Zod coerce on vgmWeight widens input type; assert resolver for RHF
    resolver: zodResolver(vgmFormSchema) as Resolver<VgmFormValues>,
    defaultValues: buildFormValues(data),
  });

  const { fields } = useFieldArray({
    control: vgmForm.control,
    name: "containers",
  });

  const onSubmitVgm = async (values: VgmFormValues) => {
    try {
      const res = await submitMutation.mutateAsync({
        type: referenceType,
        referenceNo,
        partyDetails: {
          companyName: values.companyName,
          orderNo: values.orderNo,
          addr1: values.addr1,
          addr2: values.addr2,
          obtainDate: values.obtainDate,
          obtainMethod: values.obtainMethod,
          authPerson: values.authPerson,
          country: values.country,
          city: values.city,
          phone: values.phone,
          email: values.email,
          zipcode: values.zipcode,
          fax: values.fax,
        },
        containers: values.containers.map((c) => ({
          containerNo: c.containerNo,
          vgmWeight: c.vgmWeight,
          vgmUnit: c.vgmUnit,
          method: c.method,
          date: c.date,
        })),
        sendEmailId: values.sendEmailId,
      });
      toast.success(res.data?.message || "VGM submitted successfully.");
      onSubmitted();
    } catch (error: unknown) {
      toast.error(
        extractVgmErrorMessage(error, "An error occurred during submission"),
      );
    }
  };

  return (
    <form
      onSubmit={vgmForm.handleSubmit(onSubmitVgm)}
      className="vgm-form-layout form-step-layout"
      autoComplete="off"
    >
      <div className="vgm-form-scroll custom-scroll form-step-scroll">
        <VgmReferenceStrip details={data.referenceDetails} />
        <VgmDeclarationFields control={vgmForm.control} />
        <VgmContainersTable control={vgmForm.control} fields={fields} />
        <VgmAdditionalInfo control={vgmForm.control} />
      </div>

      <div className="form-step-footer form-step-footer--split">
        <AppButton onClick={onCancel} disabled={submitMutation.isPending}>
          Cancel
        </AppButton>
        <AppButton
          type="primary"
          htmlType="submit"
          loading={submitMutation.isPending}
        >
          Save
        </AppButton>
      </div>
    </form>
  );
}
