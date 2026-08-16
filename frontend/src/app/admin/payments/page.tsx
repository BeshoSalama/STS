import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Search, Settings, XCircle } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import {
  approvePayment,
  getManualPaymentSettings,
  manualPaymentMethodLabels,
  rejectPayment,
} from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";

type SearchParams = {
  status?: string;
  paymentMethod?: string;
  planId?: string;
  date?: string;
  q?: string;
  page?: string;
  settingsSaved?: string;
};

async function approvePaymentAction(formData: FormData) {
  "use server";

  const session = await requireAdminSession();

  if (!session) {
    throw new Error("Admin access required");
  }

  await approvePayment(
    String(formData.get("paymentId") ?? ""),
    session.user.id,
    String(formData.get("adminNotes") ?? "")
  );

  revalidatePath("/admin/payments");
  revalidatePath("/profile");
}

async function rejectPaymentAction(formData: FormData) {
  "use server";

  const session = await requireAdminSession();

  if (!session) {
    throw new Error("Admin access required");
  }

  await rejectPayment(
    String(formData.get("paymentId") ?? ""),
    session.user.id,
    String(formData.get("adminNotes") ?? "")
  );

  revalidatePath("/admin/payments");
  revalidatePath("/profile");
}

async function updatePaymentSettingsAction(formData: FormData) {
  "use server";

  if (!(await requireAdminSession())) {
    throw new Error("Admin access required");
  }

  await db.manualPaymentSettings.upsert({
    where: {
      id: 1,
    },

    update: {
      vodafoneCashEnabled:
        formData.get("vodafoneCashEnabled") === "on",

      vodafoneCashNumber: clean(
        formData.get("vodafoneCashNumber")
      ),

      vodafoneCashSecondNumber: clean(
        formData.get("vodafoneCashSecondNumber")
      ),

      vodafoneCashAccountName: clean(
        formData.get("vodafoneCashAccountName")
      ),

      vodafoneCashInstructions: clean(
        formData.get("vodafoneCashInstructions")
      ),

      instapayEnabled:
        formData.get("instapayEnabled") === "on",

      instapayAddress: clean(
        formData.get("instapayAddress")
      ),

      instapayAccountName: clean(
        formData.get("instapayAccountName")
      ),

      instapayInstructions: clean(
        formData.get("instapayInstructions")
      ),
    },

    create: {
      id: 1,

      vodafoneCashEnabled:
        formData.get("vodafoneCashEnabled") === "on",

      vodafoneCashNumber: clean(
        formData.get("vodafoneCashNumber")
      ),

      vodafoneCashSecondNumber: clean(
        formData.get("vodafoneCashSecondNumber")
      ),

      vodafoneCashAccountName: clean(
        formData.get("vodafoneCashAccountName")
      ),

      vodafoneCashInstructions: clean(
        formData.get("vodafoneCashInstructions")
      ),

      instapayEnabled:
        formData.get("instapayEnabled") === "on",

      instapayAddress: clean(
        formData.get("instapayAddress")
      ),

      instapayAccountName: clean(
        formData.get("instapayAccountName")
      ),

      instapayInstructions: clean(
        formData.get("instapayInstructions")
      ),
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/pricing");

  redirect("/admin/payments?settingsSaved=1");
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminSession();

  if (!session) {
    redirect("/login");
  }

  const page = Math.max(
    1,
    Number(searchParams.page || 1)
  );

  const pageSize = 20;

  const where = paymentWhere(searchParams);

  const [
    payments,
    total,
    plans,
    settings,
    counters,
  ] = await Promise.all([
    db.paymentTransaction.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * pageSize,

      take: pageSize,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            period: true,
          },
        },

        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),

    db.paymentTransaction.count({
      where,
    }),

    db.packagePlan.findMany({
      where: {
        name: {
          not: "Custom Package Base Fee",
        },
      },

      orderBy: {
        order: "asc",
      },
    }),

    getManualPaymentSettings(),

    getPaymentCounters(),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  return (
    <div className="grid gap-6">

      {/* =========================
          COUNTERS
      ========================== */}

      <section className="grid gap-3 md:grid-cols-4">
        <Counter
          label="Pending Payments"
          value={counters.pending}
          tone="pending"
        />

        <Counter
          label="Approved Payments"
          value={counters.approved}
          tone="approved"
        />

        <Counter
          label="Rejected Payments"
          value={counters.rejected}
          tone="rejected"
        />

        <Counter
          label="Approved Revenue"
          value={`${counters.revenue.toLocaleString()} EGP`}
          tone="revenue"
        />
      </section>

      {/* =========================
          SETTINGS SAVED MESSAGE
      ========================== */}

      {searchParams.settingsSaved === "1" && (
        <div className="rounded-[8px] border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm font-black text-emerald-100">
          Payment settings saved successfully.
        </div>
      )}

      {/* =========================
          PAYMENT TRANSACTIONS
      ========================== */}

      <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">
              Payment Transactions
            </p>

            <h2 className="mt-2 font-display text-3xl font-black">
              Manual Payments
            </h2>
          </div>

          <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/70">
            {total} transactions
          </span>
        </div>

        {/* =========================
            FILTERS
        ========================== */}

        <form className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr_auto]">

          <label className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              size={16}
            />

            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search email, name, ID, phone, reference"
              className={`${inputClass} pl-9`}
            />
          </label>

          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            name="paymentMethod"
            defaultValue={searchParams.paymentMethod ?? ""}
            className={inputClass}
          >
            <option value="">All methods</option>
            <option value="VODAFONE_CASH">
              Vodafone Cash
            </option>
            <option value="INSTAPAY">
              InstaPay
            </option>
          </select>

          <select
            name="planId"
            defaultValue={searchParams.planId ?? ""}
            className={inputClass}
          >
            <option value="">
              All plans
            </option>

            {plans.map((plan) => (
              <option
                key={plan.id}
                value={plan.id}
              >
                {plan.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            defaultValue={searchParams.date ?? ""}
            className={inputClass}
          />

          <button className="rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black">
            Filter
          </button>
        </form>

        {/* =========================
            TRANSACTIONS TABLE
        ========================== */}

        <div className="mt-5 overflow-x-auto">

          <table className="w-full min-w-[1060px] border-separate border-spacing-y-2 text-left text-sm">

            <thead className="text-xs uppercase tracking-[0.16em] text-white/42">
              <tr>
                <th className="px-3 py-2">
                  Transaction ID
                </th>

                <th className="px-3 py-2">
                  Customer
                </th>

                <th className="px-3 py-2">
                  Plan
                </th>

                <th className="px-3 py-2">
                  Amount
                </th>

                <th className="px-3 py-2">
                  Method
                </th>

                <th className="px-3 py-2">
                  Sender Phone
                </th>

                <th className="px-3 py-2">
                  Reference
                </th>

                <th className="px-3 py-2">
                  Submitted
                </th>

                <th className="px-3 py-2">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {payments.map((payment) => (

                <tr
                  key={payment.id}
                  className="align-top"
                >

                  <td
                    colSpan={9}
                    className="rounded-[8px] border border-white/10 bg-black/20 p-0"
                  >

                    <details>

                      <summary className="grid cursor-pointer grid-cols-[1.2fr_1.3fr_1fr_0.8fr_1fr_1fr_1fr_1fr_0.8fr] gap-2 px-3 py-3 marker:text-violet-200">

                        <span className="break-all font-mono text-xs text-white/72">
                          {payment.id}
                        </span>

                        <span>
                          <strong className="block text-white">
                            {payment.user.name || "Unnamed"}
                          </strong>

                          <span className="text-xs text-white/52">
                            {payment.user.email}
                          </span>
                        </span>

                        <span>
                          {payment.planNameSnapshot}
                        </span>

                        <span>
                          {Number(
                            payment.amount.toString()
                          ).toLocaleString()}{" "}
                          {payment.currency}
                        </span>

                        <span>
                          {methodLabel(
                            payment.paymentMethod
                          )}
                        </span>

                        <span>
                          {payment.senderPhone}
                        </span>

                        <span>
                          {payment.transactionReference || "-"}
                        </span>

                        <span>
                          {payment.createdAt.toLocaleDateString()}
                        </span>

                        <StatusPill
                          status={payment.status}
                        />

                      </summary>

                      <div className="grid gap-5 border-t border-white/10 p-4 lg:grid-cols-[1fr_360px]">

                        {/* =========================
                            PAYMENT DETAILS
                        ========================== */}

                        <div className="grid gap-4">

                          <DetailBlock
                            title="Customer information"
                            items={[
                              [
                                "Name",
                                payment.user.name || "Not set",
                              ],
                              [
                                "Email",
                                payment.user.email,
                              ],
                              [
                                "User ID",
                                payment.user.id,
                              ],
                              [
                                "Phone",
                                payment.user.phone || "Not set",
                              ],
                            ]}
                          />

                          <DetailBlock
                            title="Subscription"
                            items={[
                              [
                                "Selected plan",
                                payment.planNameSnapshot,
                              ],
                              [
                                "Amount",
                                `${Number(
                                  payment.amount.toString()
                                ).toLocaleString()} ${payment.currency}`,
                              ],
                              [
                                "Plan period",
                                payment.plan.period,
                              ],
                            ]}
                          />

                          <DetailBlock
                            title="Payment"
                            items={[
                              [
                                "Method",
                                methodLabel(
                                  payment.paymentMethod
                                ),
                              ],
                              [
                                "Sender name",
                                payment.senderName,
                              ],
                              [
                                "Sender phone",
                                payment.senderPhone,
                              ],
                              [
                                "Transaction reference",
                                payment.transactionReference ||
                                  "-",
                              ],
                              [
                                "Transfer date",
                                payment.transferDate.toLocaleDateString(),
                              ],
                              [
                                "Transfer time",
                                payment.transferTime ||
                                  "-",
                              ],
                              [
                                "Submitted at",
                                payment.createdAt.toLocaleString(),
                              ],
                            ]}
                          />

                          <DetailBlock
                            title="Customer notes"
                            items={[
                              [
                                "Notes",
                                payment.notes ||
                                  "No notes",
                              ],
                            ]}
                          />

                          <DetailBlock
                            title="Admin review"
                            items={[
                              [
                                "Current status",
                                payment.status,
                              ],
                              [
                                "Reviewed by",
                                payment.reviewer?.name ||
                                  payment.reviewer?.email ||
                                  "-",
                              ],
                              [
                                "Reviewed at",
                                payment.reviewedAt?.toLocaleString() ||
                                  "-",
                              ],
                              [
                                "Admin notes",
                                payment.adminNotes ||
                                  "-",
                              ],
                            ]}
                          />

                        </div>

                        {/* =========================
                            PAYMENT PROOF
                        ========================== */}

                        <aside className="grid gap-4">

                          <a
                            href={`/api/admin/manual-payments/${payment.id}/proof`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-[8px] border border-white/10 bg-black/25"
                          >

                            <Image
                              src={`/api/admin/manual-payments/${payment.id}/proof`}
                              alt={`Payment proof ${payment.id}`}
                              width={800}
                              height={800}
                              unoptimized
                              className="max-h-[420px] h-auto w-full object-contain"
                            />

                          </a>

                          {/* =========================
                              APPROVE / REJECT
                          ========================== */}

                          {payment.status === "PENDING" && (

                            <div className="grid gap-3 rounded-[8px] border border-violet-200/12 bg-white/[0.035] p-4">

                              <form
                                action={approvePaymentAction}
                                className="grid gap-3"
                              >

                                <input
                                  type="hidden"
                                  name="paymentId"
                                  value={payment.id}
                                />

                                <textarea
                                  name="adminNotes"
                                  rows={3}
                                  placeholder="Admin notes"
                                  className={inputClass}
                                />

                                <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-emerald-500 px-4 py-3 text-sm font-black text-white">

                                  <CheckCircle2
                                    size={16}
                                  />

                                  Approve Payment

                                </button>

                              </form>

                              <form
                                action={rejectPaymentAction}
                                className="grid gap-3"
                              >

                                <input
                                  type="hidden"
                                  name="paymentId"
                                  value={payment.id}
                                />

                                <textarea
                                  name="adminNotes"
                                  rows={3}
                                  required
                                  placeholder="Rejection reason / admin notes"
                                  className={inputClass}
                                />

                                <button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-red-300/25 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100">

                                  <XCircle
                                    size={16}
                                  />

                                  Reject Payment

                                </button>

                              </form>

                            </div>
                          )}

                        </aside>

                      </div>

                    </details>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {payments.length === 0 && (

            <p className="rounded-[8px] border border-white/10 bg-black/20 p-5 text-sm text-white/60">
              No payment transactions match these filters.
            </p>

          )}

        </div>

        {/* =========================
            PAGINATION
        ========================== */}

        <div className="mt-5 flex items-center justify-between text-sm text-white/65">

          <span>
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">

            <PageLink
              label="Previous"
              page={Math.max(
                1,
                page - 1
              )}
              disabled={page <= 1}
              searchParams={searchParams}
            />

            <PageLink
              label="Next"
              page={Math.min(
                totalPages,
                page + 1
              )}
              disabled={page >= totalPages}
              searchParams={searchParams}
            />

          </div>

        </div>

      </section>

      {/* =========================
          MANUAL PAYMENT SETTINGS
      ========================== */}

      <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">

        <div className="flex items-center gap-3">

          <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-violet-200/20 bg-violet-500/15 text-violet-100">
            <Settings size={18} />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">
              Manual Payment Settings
            </p>

            <h2 className="font-display text-2xl font-black">
              Transfer Destinations
            </h2>
          </div>

        </div>

        <form
          action={updatePaymentSettingsAction}
          className="mt-5 grid gap-5 lg:grid-cols-2"
        >

          {/* VODAFONE CASH */}

          <fieldset className="grid gap-3 rounded-[8px] border border-white/10 bg-black/20 p-4">

            <label className="flex items-center gap-2 text-sm font-black">

              <input
                type="checkbox"
                name="vodafoneCashEnabled"
                defaultChecked={
                  settings.vodafoneCashEnabled
                }
              />

              Vodafone Cash enabled

            </label>

            <input
              name="vodafoneCashNumber"
              defaultValue={
                settings.vodafoneCashNumber ??
                ""
              }
              placeholder="Vodafone Cash Number"
              className={inputClass}
            />

            <input
              name="vodafoneCashSecondNumber"
              defaultValue={
                settings.vodafoneCashSecondNumber ??
                ""
              }
              placeholder="Second Vodafone Cash Number"
              className={inputClass}
            />

            <input
              name="vodafoneCashAccountName"
              defaultValue={
                settings.vodafoneCashAccountName ??
                ""
              }
              placeholder="Account Name"
              className={inputClass}
            />

            <textarea
              name="vodafoneCashInstructions"
              defaultValue={
                settings.vodafoneCashInstructions ??
                ""
              }
              rows={4}
              placeholder="Vodafone Cash instructions"
              className={inputClass}
            />

          </fieldset>

          {/* INSTAPAY */}

          <fieldset className="grid gap-3 rounded-[8px] border border-white/10 bg-black/20 p-4">

            <label className="flex items-center gap-2 text-sm font-black">

              <input
                type="checkbox"
                name="instapayEnabled"
                defaultChecked={
                  settings.instapayEnabled
                }
              />

              InstaPay enabled

            </label>

            <input
              name="instapayAddress"
              defaultValue={
                settings.instapayAddress ??
                ""
              }
              placeholder="InstaPay Address / Username / Number"
              className={inputClass}
            />

            <input
              name="instapayAccountName"
              defaultValue={
                settings.instapayAccountName ??
                ""
              }
              placeholder="Account Name"
              className={inputClass}
            />

            <textarea
              name="instapayInstructions"
              defaultValue={
                settings.instapayInstructions ??
                ""
              }
              rows={4}
              placeholder="InstaPay instructions"
              className={inputClass}
            />

          </fieldset>

          <button className="w-fit rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black lg:col-span-2">
            Save Payment Settings
          </button>

        </form>

      </section>

    </div>
  );
}

const inputClass =
  "min-h-11 rounded-[8px] border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";

function paymentWhere(
  searchParams: SearchParams
): Prisma.PaymentTransactionWhereInput {

  const q = searchParams.q?.trim();

  return {
    ...(searchParams.status
      ? {
          status: searchParams.status,
        }
      : {}),

    ...(searchParams.paymentMethod
      ? {
          paymentMethod:
            searchParams.paymentMethod,
        }
      : {}),

    ...(searchParams.planId
      ? {
          planId: searchParams.planId,
        }
      : {}),

    ...(searchParams.date
      ? dateRangeFilter(
          searchParams.date
        )
      : {}),

    ...(q
      ? {
          OR: [
            {
              id: {
                contains: q,
              },
            },

            {
              senderPhone: {
                contains: q,
              },
            },

            {
              transactionReference: {
                contains: q,
              },
            },

            {
              user: {
                email: {
                  contains: q,
                },
              },
            },

            {
              user: {
                name: {
                  contains: q,
                },
              },
            },
          ],
        }
      : {}),
  };
}

function dateRangeFilter(
  date: string
): Prisma.PaymentTransactionWhereInput {

  const start = new Date(date);

  if (Number.isNaN(start.getTime())) {
    return {};
  }

  const end = new Date(start);

  end.setDate(
    end.getDate() + 1
  );

  return {
    createdAt: {
      gte: start,
      lt: end,
    },
  };
}

async function getPaymentCounters() {

  const [
    pending,
    approved,
    rejected,
    revenue,
  ] = await Promise.all([

    db.paymentTransaction.count({
      where: {
        status: "PENDING",
      },
    }),

    db.paymentTransaction.count({
      where: {
        status: "APPROVED",
      },
    }),

    db.paymentTransaction.count({
      where: {
        status: "REJECTED",
      },
    }),

    db.paymentTransaction.aggregate({
      where: {
        status: "APPROVED",
      },

      _sum: {
        amount: true,
      },
    }),

  ]);

  return {
    pending,
    approved,
    rejected,

    revenue: Number(
      revenue._sum.amount?.toString() ??
        0
    ),
  };
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;

  tone:
    | "pending"
    | "approved"
    | "rejected"
    | "revenue";
}) {

  const tones = {
    pending:
      "border-amber-300/20 bg-amber-400/8 text-amber-100",

    approved:
      "border-emerald-300/20 bg-emerald-400/8 text-emerald-100",

    rejected:
      "border-red-300/20 bg-red-500/8 text-red-100",

    revenue:
      "border-violet-300/20 bg-violet-500/10 text-violet-100",
  };

  return (
    <div
      className={`rounded-[8px] border p-4 ${tones[tone]}`}
    >

      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>

      <strong className="mt-2 block font-display text-3xl font-black">
        {value}
      </strong>

    </div>
  );
}

function StatusPill({
  status,
}: {
  status: string;
}) {

  const className =
    status === "APPROVED"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : status === "REJECTED"
        ? "border-red-300/25 bg-red-500/10 text-red-100"
        : "border-amber-300/25 bg-amber-400/10 text-amber-100";

  return (
    <span
      className={`h-fit rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
  );
}

function DetailBlock({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {

  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.025] p-4">

      <h3 className="font-display text-lg font-black">
        {title}
      </h3>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">

        {items.map(
          ([label, value]) => (

            <div key={label}>

              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
                {label}
              </dt>

              <dd className="mt-1 break-words text-sm font-semibold text-white/78">
                {value}
              </dd>

            </div>

          )
        )}

      </dl>

    </section>
  );
}

function methodLabel(
  method: string
) {

  return (
    manualPaymentMethodLabels[
      method as keyof typeof manualPaymentMethodLabels
    ] || method
  );
}

function clean(
  value: FormDataEntryValue | null
) {

  const text = String(
    value ?? ""
  ).trim();

  return text.length > 0
    ? text
    : null;
}

function PageLink({
  label,
  page,
  disabled,
  searchParams,
}: {
  label: string;
  page: number;
  disabled: boolean;
  searchParams: SearchParams;
}) {

  const params =
    new URLSearchParams();

  for (
    const [key, value] of
    Object.entries(searchParams)
  ) {

    if (
      value &&
      key !== "page"
    ) {
      params.set(
        key,
        value
      );
    }
  }

  params.set(
    "page",
    String(page)
  );

  const href =
    `/admin/payments?${params.toString()}`;

  return disabled ? (

    <span className="rounded-full border border-white/10 px-4 py-2 opacity-40">
      {label}
    </span>

  ) : (

    <a
      href={href}
      className="rounded-full border border-white/15 px-4 py-2 font-bold"
    >
      {label}
    </a>

  );
}