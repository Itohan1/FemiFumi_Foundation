type Testimonial = {
  name: string;
  position: string;
  image: string;
  quote: string;
};

type FeaturedVoice = {
  id: string;
  name: string;
  role: string;
  script: string;
};

type TestimonialsSectionProps = {
  testimonials: readonly Testimonial[];
  fallbackImage: string;
  testimonialIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  featuredVoices: readonly FeaturedVoice[];
  showAllVoices: boolean;
  onToggleShowAllVoices: () => void;
  playingVoiceId: string | null;
  onToggleVoice: (voiceId: string, script: string) => void;
};

export default function TestimonialsSection({
  testimonials,
  fallbackImage,
  testimonialIndex,
  onPrevious,
  onNext,
  onSelect,
  featuredVoices,
  showAllVoices,
  onToggleShowAllVoices,
  playingVoiceId,
  onToggleVoice,
}: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className="bg-gradient-to-br from-femiCream via-white to-femiMustard/25 py-16"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black text-femiBlue">
          Testimonials
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Real voices from people and partners who have experienced our impact.
        </p>
        <div className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-[220px_1fr_220px] lg:items-stretch">
          <aside className="hidden rounded-3xl border border-femiBlue/20 bg-white/80 p-5 shadow-warm lg:flex lg:flex-col">
            <p className="text-xs font-black uppercase tracking-wider text-femiRed">
              Community Voices
            </p>
            <h3 className="mt-2 text-lg font-black leading-tight text-femiBlue">
              Real stories from outreach, volunteering, and recovery.
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Each testimony reflects practical support delivered to people in
              urgent need and long-term programs that restore hope.
            </p>
            <div className="mt-4 grid gap-2">
              <div className="rounded-xl border border-femiBlue/20 bg-femiCream px-3 py-2">
                <p className="text-lg font-black text-femiBlue">5+</p>
                <p className="text-xs font-semibold text-slate-600">
                  Featured voices
                </p>
              </div>
              <div className="rounded-xl border border-femiBlue/20 bg-femiCream px-3 py-2">
                <p className="text-lg font-black text-femiBlue">100%</p>
                <p className="text-xs font-semibold text-slate-600">
                  Mission-aligned impact stories
                </p>
              </div>
            </div>
          </aside>

          <div className="rounded-3xl border border-femiBlue/20 bg-femiCream p-6 shadow-warm md:p-8">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className={
                  testimonialIndex === index
                    ? "flex min-h-[320px] items-center justify-center"
                    : "hidden"
                }
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  <p className="mt-5 text-lg leading-8 text-slate-700">
                    "{testimonial.quote}"
                  </p>
                  <p className="mt-5 text-xl font-black text-femiBlue">
                    {testimonial.name}
                  </p>
                  <p className="text-sm font-semibold text-femiRed">
                    {testimonial.position}
                  </p>
                </div>
              </article>
            ))}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onPrevious}
                aria-label="Previous testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-femiBlue/30 bg-white text-lg font-black text-femiBlue transition hover:bg-femiBlue hover:text-white"
              >
                &lt;
              </button>
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`h-3 w-3 rounded-full transition ${
                    testimonialIndex === index
                      ? "scale-110 bg-femiRed"
                      : "bg-femiBlue/25 hover:bg-femiBlue/45"
                  }`}
                />
              ))}
              <button
                type="button"
                onClick={onNext}
                aria-label="Next testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-femiBlue/30 bg-white text-lg font-black text-femiBlue transition hover:bg-femiBlue hover:text-white"
              >
                &gt;
              </button>
            </div>
          </div>

          <aside className="hidden rounded-3xl border border-femiBlue/20 bg-white/70 p-5 shadow-warm lg:flex lg:flex-col">
            <div className="rounded-2xl bg-femiBlue px-4 py-3 text-center text-white">
              <p className="text-xl font-black">5</p>
              <p className="text-xs font-semibold uppercase tracking-wide">
                Featured Voices
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Partners, volunteers and beneficiaries sharing how lives were
                changed.
              </p>
              {(showAllVoices ? featuredVoices : featuredVoices.slice(0, 3)).map(
                (voice) => (
                  <div
                    key={voice.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-femiBlue/20 bg-femiCream px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-femiBlue">
                        {voice.name}
                      </p>
                      <p className="text-xs text-slate-600">{voice.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleVoice(voice.id, voice.script)}
                      aria-label={
                        playingVoiceId === voice.id
                          ? `Stop ${voice.name} voice`
                          : `Play ${voice.name} voice`
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-femiBlue transition hover:bg-femiBlue hover:text-white"
                    >
                      {playingVoiceId === voice.id ? "■" : "▶"}
                    </button>
                  </div>
                ),
              )}
              {featuredVoices.length > 3 && (
                <button
                  type="button"
                  onClick={onToggleShowAllVoices}
                  className="mt-1 rounded-md border border-femiBlue/30 bg-white px-3 py-2 text-xs font-semibold text-femiBlue transition hover:bg-femiBlue hover:text-white"
                >
                  {showAllVoices ? "View less" : "View more"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
