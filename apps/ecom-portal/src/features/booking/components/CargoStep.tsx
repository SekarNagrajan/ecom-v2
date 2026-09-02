// Modified by Sekar Nagarajan (2026-09-02 11:27)
import { useBookingStore } from "../stores/booking.store";
import {
  defaultCargoData,
  migrateLegacyCargo,
} from "../types/booking.types";
import { BookingCargoLinesEditor } from "./booking-cargo-lines-editor";

export function CargoStep() {
  const { payload, updateCargo, nextStep, prevStep } = useBookingStore();

  return (
    <BookingCargoLinesEditor
      defaultValues={
        payload.cargo ? migrateLegacyCargo(payload.cargo) : defaultCargoData()
      }
      onSubmit={(data) => {
        updateCargo(data);
        nextStep();
      }}
      onPrevious={prevStep}
    />
  );
}
