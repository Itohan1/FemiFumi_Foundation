import { UpcomingEvent } from "../lib/api";

type Props = {
  upcomingEvents: UpcomingEvent[];
  selectedUpcomingId: string | null;
  selectUpcomingEvent: (id: string) => Promise<void>;
  onCreateUpcomingEvent: () => void;
};

function formatDateDayMonthYear(value: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export function UpcomingEventsSection({
  upcomingEvents,
  selectedUpcomingId,
  selectUpcomingEvent,
  onCreateUpcomingEvent
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-femiBlue">Upcoming Events</h2>
          <p className="text-sm text-slate-600">{upcomingEvents.length} items</p>
        </div>
        <button
          type="button"
          onClick={onCreateUpcomingEvent}
          className="w-full rounded-lg bg-femiBlue px-3 py-2 text-sm font-semibold text-white sm:w-auto"
        >
          Create Upcoming Event
        </button>
      </div>
      <div className="grid gap-2 md:hidden">
        {upcomingEvents.length === 0 ? (
          <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
            No upcoming events yet.
          </p>
        ) : (
          upcomingEvents.map((item) => (
            <button
              key={`${item.id}-mobile`}
              type="button"
              onClick={() => void selectUpcomingEvent(item.id)}
              className={`rounded-lg border p-3 text-left text-sm ${
                selectedUpcomingId === item.id
                  ? "border-femiBlue bg-femiBlue/10"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-slate-700">Location: {item.location}</p>
              <p className="mt-1 text-xs text-slate-600">Date: {formatDateDayMonthYear(item.dateIso)}</p>
            </button>
          ))
        )}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
        <table className="min-w-[560px] w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map((item) => (
              <tr
                key={item.id}
                onClick={() => void selectUpcomingEvent(item.id)}
                className={`cursor-pointer border-t border-slate-100 ${
                  selectedUpcomingId === item.id ? "bg-femiBlue/10" : "hover:bg-slate-50"
                }`}
              >
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{item.location}</td>
                <td className="px-3 py-2">{formatDateDayMonthYear(item.dateIso)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
