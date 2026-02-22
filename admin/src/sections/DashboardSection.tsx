import { SectionKey } from "../types/admin";

type Props = {
  adminKey: string;
  setAdminKey: (value: string) => void;
  recentUpdatesCount: number;
  upcomingEventsCount: number;
  galleryItemsCount: number;
  donationTransactionsCount: number;
  newsletterSubscribersCount: number;
  navigateToSection: (section: SectionKey) => void;
};

export function DashboardSection({
  adminKey,
  setAdminKey,
  recentUpdatesCount,
  upcomingEventsCount,
  galleryItemsCount,
  donationTransactionsCount,
  newsletterSubscribersCount,
  navigateToSection
}: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-3">
        <h2 className="text-lg font-black text-femiBlue">Admin Key</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste your `ADMIN_KEY` here before creating, editing, or deleting records.
        </p>
        <input
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="Enter ADMIN_KEY"
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-600">Recent Updates</p>
        <p className="mt-2 text-3xl font-black text-femiBlue">{recentUpdatesCount}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigateToSection("recent-updates")}
            className="rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => navigateToSection("create-recent-update-item")}
            className="rounded-lg border border-femiBlue px-3 py-2 text-sm font-semibold text-femiBlue"
          >
            Create Recent Update Item
          </button>
        </div>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-600">Upcoming Events</p>
        <p className="mt-2 text-3xl font-black text-femiBlue">{upcomingEventsCount}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigateToSection("upcoming-events")}
            className="rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => navigateToSection("create-upcoming-event")}
            className="rounded-lg border border-femiBlue px-3 py-2 text-sm font-semibold text-femiBlue"
          >
            Create Upcoming Event
          </button>
        </div>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-600">Donations</p>
        <p className="mt-2 text-3xl font-black text-femiBlue">{donationTransactionsCount}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigateToSection("donations")}
            className="rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white"
          >
            Open
          </button>
        </div>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-600">Newsletter</p>
        <p className="mt-2 text-3xl font-black text-femiBlue">{newsletterSubscribersCount}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigateToSection("newsletter")}
            className="rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white"
          >
            Open
          </button>
        </div>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-600">Donation Gallery</p>
        <p className="mt-2 text-3xl font-black text-femiBlue">{galleryItemsCount}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => navigateToSection("donation-gallery")}
            className="rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => navigateToSection("create-gallery-item")}
            className="rounded-lg border border-femiBlue px-3 py-2 text-sm font-semibold text-femiBlue"
          >
            Create Gallery
          </button>
        </div>
      </article>
    </section>
  );
}
