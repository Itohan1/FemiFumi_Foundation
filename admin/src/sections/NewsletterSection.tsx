import { FormEvent } from "react";
import { NewsletterCampaign, NewsletterSubscriber } from "../lib/api";
import { NewsletterFormState } from "../types/admin";

type Props = {
  subscribers: NewsletterSubscriber[];
  campaigns: NewsletterCampaign[];
  newsletterForm: NewsletterFormState;
  setNewsletterForm: (value: NewsletterFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSending: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function NewsletterSection({
  subscribers,
  campaigns,
  newsletterForm,
  setNewsletterForm,
  onSubmit,
  isSending,
  isRefreshing,
  onRefresh
}: Props) {
  const activeSubscribers = subscribers.filter((item) => item.isActive).length;

  return (
    <section className="grid min-w-0 gap-4">
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-femiBlue">Send Newsletter</h2>
            <p className="text-sm text-slate-600">
              {activeSubscribers} active subscribers out of {subscribers.length} total.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              {isRefreshing ? (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-700"
                  aria-hidden="true"
                />
              ) : null}
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3">
          <label className="text-sm font-semibold text-slate-700" htmlFor="newsletterSubject">
            Subject
          </label>
          <input
            id="newsletterSubject"
            value={newsletterForm.subject}
            onChange={(event) => setNewsletterForm({ ...newsletterForm, subject: event.target.value })}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Enter newsletter subject"
          />
          <label className="text-sm font-semibold text-slate-700" htmlFor="newsletterBody">
            Message
          </label>
          <textarea
            id="newsletterBody"
            value={newsletterForm.body}
            onChange={(event) => setNewsletterForm({ ...newsletterForm, body: event.target.value })}
            required
            rows={8}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Write newsletter content..."
          />
          <button
            type="submit"
            disabled={isSending || activeSubscribers === 0}
            className="w-full rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            <span className="inline-flex items-center gap-2">
              {isSending ? (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                  aria-hidden="true"
                />
              ) : null}
              {isSending ? "Sending..." : "Send Newsletter"}
            </span>
          </button>
        </form>
      </article>

      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-black text-femiBlue">Subscribers</h3>
        <p className="mb-3 text-sm text-slate-600">All newsletter signups from the contact section.</p>
        <div className="grid gap-2 md:hidden">
          {subscribers.length === 0 ? (
            <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">No subscribers yet.</p>
          ) : (
            subscribers.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">{item.firstName}</p>
                <p className="mt-1 break-all text-slate-700">{item.email}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Status:{" "}
                  <span className={item.isActive ? "font-semibold text-emerald-700" : "font-semibold text-slate-600"}>
                    {item.isActive ? "Active" : "Unsubscribed"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-600">Subscribed: {formatDate(item.createdAt)}</p>
              </article>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td className="px-3 py-2 text-slate-500" colSpan={4}>
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 align-top">{item.firstName}</td>
                    <td className="px-3 py-2 align-top break-all">{item.email}</td>
                    <td className="px-3 py-2">
                      {item.isActive ? (
                        <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-black text-femiBlue">Recent Campaigns</h3>
        <p className="mb-3 text-sm text-slate-600">Latest newsletters sent from admin.</p>
        <div className="grid gap-2 md:hidden">
          {campaigns.length === 0 ? (
            <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">No campaign sent yet.</p>
          ) : (
            campaigns.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">{item.subject}</p>
                <p className="mt-2 text-xs text-slate-600">Recipients: {item.recipientCount}</p>
                <p className="mt-1 text-xs text-slate-600">Sent: {formatDate(item.sentAt)}</p>
              </article>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
          <table className="min-w-[560px] w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Recipients</th>
                <th className="px-3 py-2">Sent</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td className="px-3 py-2 text-slate-500" colSpan={3}>
                    No campaign sent yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 break-words">{item.subject}</td>
                    <td className="px-3 py-2">{item.recipientCount}</td>
                    <td className="px-3 py-2">{formatDate(item.sentAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
