import { useEffect, useMemo, useState } from "react";
import { UpcomingEvent } from "../../data/siteContent";

type WhatWeAreUpToSectionProps = {
  events: UpcomingEvent[];
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

function formatCountdown(targetIso: string, nowMs: number): string {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return "Date to be announced";
  }

  const difference = targetMs - nowMs;
  if (difference <= 0) {
    return "Event has started";
  }

  const seconds = Math.floor(difference / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
}

export default function WhatWeAreUpToSection({
  events,
}: WhatWeAreUpToSectionProps) {
  const [showUpcomingEvents, setShowUpcomingEvents] = useState<boolean>(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    if (!showUpcomingEvents) return;

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showUpcomingEvents]);

  useEffect(() => {
    if (!showUpcomingEvents) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUpcomingEvents(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showUpcomingEvents]);

  const cards = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        countdown: formatCountdown(event.dateIso, nowMs),
        formattedDate: formatDateDayMonthYear(event.dateIso),
      })),
    [events, nowMs],
  );

  const activeEvent = cards[activeEventIndex];

  function openUpcomingModal() {
    setActiveEventIndex(0);
    setShowUpcomingEvents(true);
  }

  function showPreviousEvent() {
    if (cards.length === 0) return;
    setActiveEventIndex((current) =>
      current === 0 ? cards.length - 1 : current - 1,
    );
  }

  function showNextEvent() {
    if (cards.length === 0) return;
    setActiveEventIndex((current) => (current + 1) % cards.length);
  }

  return (
    <section
      id="what-we-are-up-to"
      className="relative overflow-hidden bg-gradient-to-br from-femiBlue via-femiBlue/95 to-slate-900 py-20 text-white"
    >
      <div className="pointer-events-none absolute -left-16 top-6 h-44 w-44 rounded-full bg-femiRed/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4">
        <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
          Live Activity
        </p>
        <h2 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-5xl">
          What We Are Up To
        </h2>
        <p className="mt-4 max-w-3xl text-base text-white/90 md:text-lg">
          Stay close to our next humanitarian missions, outreach days, and
          community support events.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/15 px-4 py-2">
            {events.length} upcoming events
          </span>
          <span className="rounded-full bg-white/15 px-4 py-2">
            Education, health, and relief programs
          </span>
        </div>

        <button
          type="button"
          onClick={openUpcomingModal}
          className="mt-8 animate-pulse rounded-xl bg-femiRed px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_14px_30px_rgba(255,77,77,0.45)] transition hover:-translate-y-0.5 hover:bg-femiRed/90 hover:shadow-[0_18px_34px_rgba(255,77,77,0.55)]"
        >
          View Upcoming Event
        </button>
      </div>

      {showUpcomingEvents ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upcoming events"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setShowUpcomingEvents(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black text-femiBlue">
                Upcoming Events
              </h3>
              <button
                type="button"
                onClick={() => setShowUpcomingEvents(false)}
                className="rounded-lg border border-femiBlue/30 px-3 py-1 text-sm font-semibold text-femiBlue"
              >
                Close
              </button>
            </div>

            {activeEvent ? (
              <article className="overflow-hidden rounded-xl border border-femiBlue/20 bg-femiCream">
                <img
                  src={activeEvent.imageUrl}
                  alt={activeEvent.title}
                  className="h-56 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <h4 className="text-lg font-bold text-femiBlue">
                    {activeEvent.title}
                  </h4>
                  <p className="text-sm text-slate-700">
                    {activeEvent.description}
                  </p>
                  <p className="text-sm font-semibold text-femiRed">
                    Date: {activeEvent.formattedDate}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Countdown: {activeEvent.countdown}
                  </p>
                </div>
              </article>
            ) : null}

            {cards.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="Previous upcoming event"
                  onClick={showPreviousEvent}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8249;
                </button>
                <p className="text-sm font-semibold text-slate-700">
                  {activeEventIndex + 1} / {cards.length}
                </p>
                <button
                  type="button"
                  aria-label="Next upcoming event"
                  onClick={showNextEvent}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8250;
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
