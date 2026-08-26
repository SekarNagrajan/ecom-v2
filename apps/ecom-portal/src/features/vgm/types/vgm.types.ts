// Modified by Sekar Nagarajan (2026-08-26 12:48)
import { z } from "zod";

export interface VgmContainerDTO {
  containerNo: string;
  eqpType: string;
  tareWeight: number;
  vgmWeight: number | null;
  vgmUnit: "K" | "T";
  method: "SM1" | "SM2";
  date: string | null;
}

export interface VgmReferenceDetailsDTO {
  referenceNo: string;
  type: "bookno" | "blno";
  shipperName: string;
  apName: string;
  origin: string;
  delivery: string;
  pol: string;
  pod: string;
}

export interface VgmDeclarationDTO {
  referenceDetails: VgmReferenceDetailsDTO;
  containers: VgmContainerDTO[];
  companyName?: string;
  orderNo?: string;
  addr1?: string;
  addr2?: string;
  obtainDate?: string;
  obtainMethod?: "SM1" | "SM2";
  authPerson?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  zipcode?: string;
  fax?: string;
}

export interface VgmSubmitPayload {
  referenceNo: string;
  type: "bookno" | "blno";
  partyDetails: Omit<VgmDeclarationDTO, "referenceDetails" | "containers">;
  containers: {
    containerNo: string;
    vgmWeight: number;
    vgmUnit: "K" | "T";
    method: "SM1" | "SM2";
    date: string;
  }[];
  sendEmailId: string;
}

export const vgmSearchSchema = z.object({
  submissionBy: z.enum(["bookno", "blno"]),
  referenceNo: z.string().min(1, "Reference No is required"),
});
export type VgmSearchValues = z.infer<typeof vgmSearchSchema>;

export const vgmFormSchema = z.object({
  companyName: z.string().optional(),
  orderNo: z.string().optional(),
  addr1: z.string().optional(),
  addr2: z.string().optional(),
  obtainDate: z.string().min(1, "Obtained Date is required"),
  obtainMethod: z.enum(["SM1", "SM2"]),
  authPerson: z.string().min(1, "Authorized Person is required"),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  zipcode: z.string().optional(),
  fax: z.string().optional(),
  sendEmailId: z.string().email("Valid Email is required"),
  containers: z
    .array(
      z.object({
        containerNo: z.string(),
        eqpType: z.string(),
        tareWeight: z.number(),
        vgmWeight: z.coerce.number().min(1, "VGM weight is required"),
        vgmUnit: z.enum(["K", "T"]),
        method: z.enum(["SM1", "SM2"]),
        date: z.string().min(1, "Date required"),
      }),
    )
    .min(1, "At least one container is required"),
});
export type VgmFormValues = z.infer<typeof vgmFormSchema>;
