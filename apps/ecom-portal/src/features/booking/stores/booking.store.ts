// Created by Antigravity (2026-08-22 09:25)
import { create } from 'zustand';
import type { BookingPayload, CargoData, PartiesData, MasterDetailsData, EnsData, InsuranceData } from '../types/booking.types';

interface BookingState {
  // Wizard State
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;

  // Payload Data
  payload: BookingPayload;
  
  // Updaters
  updateMasterDetails: (data: MasterDetailsData) => void;
  updateParties: (data: PartiesData) => void;
  updateCargo: (data: CargoData) => void;
  updateEns: (data: EnsData) => void;
  updateInsurance: (data: InsuranceData) => void;
  initializeFromBooking: (payload: BookingPayload) => void;
}

const initialPayload: BookingPayload = {
  masterDetails: null,
  parties: null,
  cargo: null,
  ens: null,
  insurance: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  resetWizard: () => set({ currentStep: 0, payload: initialPayload }),

  payload: initialPayload,

  updateMasterDetails: (data) => set((state) => ({
    payload: { ...state.payload, masterDetails: data }
  })),
  updateParties: (data) => set((state) => ({
    payload: { ...state.payload, parties: data }
  })),
  updateCargo: (data) => set((state) => ({
    payload: { ...state.payload, cargo: data }
  })),
  updateEns: (data) => set((state) => ({
    payload: { ...state.payload, ens: data }
  })),
  updateInsurance: (data) => set((state) => ({
    payload: { ...state.payload, insurance: data }
  })),
  initializeFromBooking: (payload) => set({ payload, currentStep: 0 }),
}));
