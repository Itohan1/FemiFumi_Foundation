import { useEffect, useMemo, useState } from "react";
import { RecentUpdate, getRecentUpdateById } from "../../lib/api";

type RecentUpdateDetailPageProps = {
  updateId: string;
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

export default function RecentUpdateDetailPage({
  updateId
}: RecentUpdateDetailPageProps) {
  const [item, setItem] = useState<RecentUpdate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    void getRecentUpdateById(updateId)
      .then((data) => setItem(data))
      .catch(() => {
        setHasError(true);
        setItem(null);
      })
      .finally(() => setIsLoading(false));
  }, [updateId]);

  const mainMedia = useMemo(() => {
    if (!item) return null;
    return item.media.find((media) => media.id === item.mainMediaId) ?? null;
  }, [item]);

  return (
    <div className="min-h-screen bg-femiCream text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <a
          href="/"
          className="inline-flex items-center rounded-lg border border-femiBlue/30 bg-white px-4 py-2 text-sm font-semibold text-femiBlue"
        >
          Back to Home
        </a>

        {isLoading ? (
          <p className="mt-6 text-slate-600">Loading update details...</p>
        ) : null}

        {!isLoading && hasError ? (
          <p className="mt-6 rounded-xl border border-femiRed/20 bg-white p-4 text-femiRed">
            Unable to load this recent update.
          </p>
        ) : null}

        {!isLoading && !hasError && item ? (
          <article className="mt-6 space-y-6 rounded-2xl border border-femiBlue/20 bg-white p-6 shadow-sm">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-femiRed">
                {formatDateDayMonthYear(item.date)} - {item.location}
              </p>
              <h1 className="break-words text-3xl font-black text-femiBlue">{item.title}</h1>
              <p className="break-words whitespace-pre-wrap text-base leading-7 text-slate-700">
                {item.description}
              </p>
            </header>

            {mainMedia ? (
              <div className="overflow-hidden rounded-2xl border border-femiBlue/15 bg-femiBlue/5">
                {mainMedia.type === "video" ? (
                  <iframe
                    title={`${item.title} main media`}
                    src={mainMedia.mediaUrl}
                    className="h-80 w-full"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={mainMedia.mediaUrl}
                    alt={item.title}
                    className="h-80 w-full object-cover"
                  />
                )}
              </div>
            ) : null}

            <section>
              <h2 className="text-xl font-bold text-femiBlue">More Pictures and Videos</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {item.media.map((media) => (
                  <figure
                    key={media.id}
                    className="overflow-hidden rounded-xl border border-femiBlue/15 bg-femiCream"
                  >
                    {media.type === "video" ? (
                      <iframe
                        title={media.caption || item.title}
                        src={media.mediaUrl}
                        className="h-56 w-full"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={media.mediaUrl}
                        alt={media.caption || item.title}
                        className="h-56 w-full object-cover"
                      />
                    )}
                    {media.caption ? (
                      <figcaption className="break-words p-3 text-sm text-slate-700">
                        {media.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          </article>
        ) : null}
      </main>
    </div>
  );
}
