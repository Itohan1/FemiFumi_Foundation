import { useEffect, useMemo, useState } from "react";
import { RecentUpdate } from "../../lib/api";

type RecentUpdatesSectionProps = {
  items: RecentUpdate[];
  onOpenUpdate: (id: string) => void;
};

function formatDateDayMonthYear(value: string): string {
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dateOnlyMatch = value.match(isoDateOnly);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}-${dateOnlyMatch[2]}-${dateOnlyMatch[1]}`;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function RecentUpdatesSection({
  items,
  onOpenUpdate
}: RecentUpdatesSectionProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;
  const canSlide = items.length > visibleCount;

  const visibleItems = useMemo(() => {
    if (items.length <= visibleCount) return items;

    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = (startIndex + offset) % items.length;
      return items[index];
    });
  }, [items, startIndex]);

  useEffect(() => {
    if (items.length === 0) {
      setStartIndex(0);
      return;
    }

    if (startIndex > items.length - 1) {
      setStartIndex(0);
    }
  }, [items.length, startIndex]);

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [canSlide, items.length]);

  function goPrevious() {
    setStartIndex((current) => (current === 0 ? items.length - 1 : current - 1));
  }

  function goNext() {
    setStartIndex((current) => (current + 1) % items.length);
  }

  return (
    <section id="recent-updates" className="bg-femiCream py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-black text-femiBlue">Recent Updates</h2>
        <p className="mt-3 max-w-3xl text-slate-700">
          See our latest activities with photos and videos. Open any update to
          view full details and the complete media list.
        </p>

        {items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-femiBlue/20 bg-white p-6 text-slate-600">
            No recent updates available yet.
          </p>
        ) : (
          <div className="mt-8 relative">
            <div className="grid gap-5 md:grid-cols-2">
            {visibleItems.map((item, visibleIndex) => {
              const mainMedia =
                item.media.find((media) => media.id === item.mainMediaId) ??
                item.media[0];

              return (
                <article
                  key={`${item.id}-${startIndex}-${visibleIndex}`}
                  className="overflow-hidden rounded-2xl border border-femiBlue/20 bg-white shadow-sm"
                >
                  <div className="h-52 w-full bg-femiBlue/10">
                    {mainMedia.type === "video" ? (
                      <iframe
                        title={item.title}
                        src={mainMedia.mediaUrl}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={mainMedia.mediaUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-femiRed">
                      {formatDateDayMonthYear(item.date)} - {item.location}
                    </div>
                    <h3 className="text-xl font-bold text-femiBlue">
                      {item.title}
                    </h3>
                    <p
                      className="text-sm text-slate-700 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenUpdate(item.id)}
                      className="rounded-lg bg-femiBlue px-4 py-2 text-sm font-semibold text-white hover:bg-femiBlue/90"
                    >
                      View Full Details
                    </button>
                  </div>
                </article>
              );
            })}
            </div>
            {canSlide ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Previous recent updates"
                  onClick={goPrevious}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8249;
                </button>
                <div className="min-w-0 w-full max-w-[520px] overflow-x-auto">
                  <div className="flex w-max items-center justify-center gap-2 px-1">
                    {items.map((item, index) => (
                      <button
                        key={`${item.id}-dot-${index}`}
                        type="button"
                        aria-label={`Go to recent update position ${index + 1}`}
                        onClick={() => setStartIndex(index)}
                        className={`h-2.5 w-2.5 shrink-0 rounded-full transition ${
                          index === startIndex ? "bg-femiBlue" : "bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Next recent updates"
                  onClick={goNext}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8250;
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
