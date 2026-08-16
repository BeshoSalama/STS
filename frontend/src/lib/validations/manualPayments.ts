import { z } from "zod";

export const paymentMethods = ["VODAFONE_CASH", "INSTAPAY"] as const;
export const paymentStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

export const createManualPaymentSchema = z.object({
  planId: z.string().trim().min(1, "Plan is required"),
  paymentMethod: z.enum(paymentMethods),
  senderName: z.string().trim().min(2, "Sender name is required").max(120),
  senderPhone: z.string().trim().min(6, "Sender phone is required").max(40),
  transactionReference: z.string().trim().max(120).optional().or(z.literal("")),
  transferDate: z.string().trim().min(1, "Transfer date is required"),
  transferTime: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const adminPaymentDecisionSchema = z.object({
  adminNotes: z.string().trim().max(1500).optional().or(z.literal("")),
});

export const manualPaymentSettingsSchema = z.object({
  vodafoneCashEnabled: z.coerce.boolean().default(true),
  vodafoneCashNumber: z.string().trim().max(80).optional().or(z.literal("")),
  vodafoneCashSecondNumber: z.string().trim().max(80).optional().or(z.literal("")),
  vodafoneCashAccountName: z.string().trim().max(120).optional().or(z.literal("")),
  vodafoneCashInstructions: z.string().trim().max(1500).optional().or(z.literal("")),
  instapayEnabled: z.coerce.boolean().default(true),
  instapayAddress: z.string().trim().max(120).optional().or(z.literal("")),
  instapayAccountName: z.string().trim().max(120).optional().or(z.literal("")),
  instapayInstructions: z.string().trim().max(1500).optional().or(z.literal("")),
});

export type PaymentMethod = (typeof paymentMethods)[number];
