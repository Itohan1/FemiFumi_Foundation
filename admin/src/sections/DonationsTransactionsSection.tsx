import { DonationTransaction } from "../lib/api";

type Props = {
  transactions: DonationTransaction[];
  isUpdatingStatus: boolean;
  onUpdateStatus: (
    donationId: string,
    status: "pending-review" | "approved" | "rejected"
  ) => Promise<void>;
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function DonationsTransactionsSection({
  transactions,
  isUpdatingStatus,
  onUpdateStatus
}: Props) {
  function paymentMethodLabel(value: DonationTransaction["paymentMethod"]): string {
    return value === "direct-transfer" ? "Direct Transfer" : "Paystack";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-xl font-black text-femiBlue">Donation Transactions</h2>
        <p className="text-sm text-slate-600">{transactions.length} records</p>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
          No donation transactions yet.
        </p>
      ) : null}

      {transactions.length > 0 ? (
        <div className="grid gap-3">
          {transactions.map((item) => {
            const fullName = `${item.firstName} ${item.lastName}`.trim();
            const canUpdate = item.paymentMethod === "direct-transfer";

            return (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{fullName}</p>
                    <p className="text-xs text-slate-600">{item.email}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Donation: <span className="font-semibold text-slate-800">{item.donationTitle}</span>
                    </p>
                    <p className="mt-2">
                      <span className="inline-flex rounded-full border border-femiBlue/30 bg-femiBlue/10 px-2 py-0.5 text-[11px] font-semibold text-femiBlue">
                        Payment Method: {paymentMethodLabel(item.paymentMethod)}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 sm:text-right">
                    <p>
                      Method: <span className="font-semibold">{paymentMethodLabel(item.paymentMethod)}</span>
                    </p>
                    <p>
                      Status: <span className="font-semibold uppercase">{item.transactionStatus}</span>
                    </p>
                    <p>{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>

                {item.proofImageUrl ? (
                  <a
                    href={item.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-femiBlue underline"
                  >
                    View proof screenshot
                  </a>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canUpdate || isUpdatingStatus}
                    onClick={() => void onUpdateStatus(item.id, "pending-review")}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Pending Review
                  </button>
                  <button
                    type="button"
                    disabled={!canUpdate || isUpdatingStatus}
                    onClick={() => void onUpdateStatus(item.id, "approved")}
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={!canUpdate || isUpdatingStatus}
                    onClick={() => void onUpdateStatus(item.id, "rejected")}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
                {!canUpdate ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Paystack transaction status is managed from Paystack API/webhooks.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
