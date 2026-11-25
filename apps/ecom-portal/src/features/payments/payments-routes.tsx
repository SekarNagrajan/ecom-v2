// Modified by Sekar Nagarajan (2026-11-25 14:40)
import { PaymentCheckoutReturn } from "./components/PaymentCheckoutReturn";

export function PaymentCheckoutSuccessRoute() {
  return <PaymentCheckoutReturn mode="success" />;
}

export function PaymentCheckoutCancelRoute() {
  return <PaymentCheckoutReturn mode="cancel" />;
}
