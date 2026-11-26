// Modified by Sekar Nagarajan (2026-11-25 14:40)
/** Checkout types mirroring GWFC secureStripePayment.do / OnlinePaymentVO. */

export type CheckoutPaymentType = "BKG" | "BL" | "INV";
export type CheckoutGateway = "STRIPE" | "NGENIUS";

export interface CheckoutReference {
  refNo: string;
  amount: number;
  customerType?: string;
}

export interface CreateCheckoutRequest {
  paymentType: CheckoutPaymentType;
  customerType: string;
  agencyCode: string;
  totalAmount: number;
  references: CheckoutReference[];
}

export interface CheckoutSessionDTO {
  success: boolean;
  message: string;
  requestId?: string;
  checkoutUrl?: string;
  cancelUrl?: string;
  gateway?: CheckoutGateway;
  status?: string;
  amountUsd?: number;
  currency?: string;
  agencyCode?: string;
  /** ISO timestamp when the session was last updated / completed. */
  paidAt?: string;
  referenceCount?: number;
}
/** One outstanding line shown in the Pay Pending drawer. */
export interface PayPendingItem {
  /** Stable selection key (usually shipment id or ref). */
  id: string;
  bookNo: string;
  blNo: string;
  invNo: string;
  agencyCode: string;
  amountUsd: number;
  paymentType: CheckoutPaymentType;
  /** Primary gateway reference number for this line. */
  refNo: string;
  customerType: string;
  originLabel?: string;
  deliveryLabel?: string;
}

export interface PayPendingDrawerState {
  open: boolean;
  /** Items to list (already filtered by caller). */
  items: PayPendingItem[];
  /** Pre-selected item ids. */
  selectedIds: string[];
  /** Optional title override context. */
  titleKey?: "planning" | "ongoing" | "default";
}
