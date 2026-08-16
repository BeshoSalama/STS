import { NextResponse } from "next/server";
import { getManualPaymentSettings, publicPaymentSettings } from "@/lib/manualPayments";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getManualPaymentSettings();
  return NextResponse.json(publicPaymentSettings(settings));
}
