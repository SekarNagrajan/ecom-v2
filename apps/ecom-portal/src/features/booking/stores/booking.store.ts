// Modified by Sekar Nagarajan (2026-08-27 18:30)
import { create } from 'zustand';
import type {
  BookingDocument,
  BookingPayload,
  CargoData,
  EnsData,
  InsuranceData,
  MasterDetailsData,
  PartiesData,
} from '../types/booking.types';
import { defaultCargoData, migrateLegacyCargo } from '../types/booking.types';

interface BookingState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;

  payload: BookingPayload;

  updateMasterDetails: (data: MasterDetailsData) => void;
  updateParties: (data: PartiesData) => void;
  updateCargo: (data: CargoData) => void;
  updateEns: (data: EnsData) => void;
  updateInsurance: (data: InsuranceData) => void;
  updateDocuments: (documents: BookingDocument[]) => void;
  clearEns: () => void;
  clearInsurance: () => void;
  initializeFromBooking: (payload: BookingPayload) => void;
}

const initialPayload: BookingPayload = {
  masterDetails: null,
  parties: null,
  cargo: null,
  ens: null,
  insurance: null,
  documents: [],
};

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  resetWizard: () => set({ currentStep: 0, payload: initialPayload }),

  payload: initialPayload,

  updateMasterDetails: (data) =>
    set((state) => ({ payload: { ...state.payload, masterDetails: data } })),
  updateParties: (data) =>
    set((state) => ({ payload: { ...state.payload, parties: data } })),
  updateCargo: (data) =>
    set((state) => ({ payload: { ...state.payload, cargo: data } })),
  updateEns: (data) =>
    set((state) => ({ payload: { ...state.payload, ens: data } })),
  updateInsurance: (data) =>
    set((state) => ({ payload: { ...state.payload, insurance: data } })),
  updateDocuments: (documents) =>
    set((state) => ({ payload: { ...state.payload, documents } })),
  clearEns: () =>
    set((state) => ({ payload: { ...state.payload, ens: null } })),
  clearInsurance: () =>
    set((state) => ({ payload: { ...state.payload, insurance: null } })),
  initializeFromBooking: (payload) =>
    set({
      currentStep: 0,
      payload: {
        ...payload,
        cargo: payload.cargo
          ? migrateLegacyCargo(payload.cargo)
          : defaultCargoData(),
        documents: payload.documents ?? [],
      },
    }),
}));
