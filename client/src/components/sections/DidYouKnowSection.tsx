type DidYouKnowSectionProps = {
  lines: readonly string[];
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

export default function DidYouKnowSection({
  lines,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
}: DidYouKnowSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-3xl border border-femiBlue/20 bg-white p-6 shadow-warm md:p-8">
        <h2 className="text-center text-3xl font-black text-femiBlue">
          Do you know?
        </h2>
        <div className="mt-5 min-h-[140px] rounded-2xl bg-femiCream p-5 md:min-h-[120px]">
          <p key={activeIndex} className="text-center text-lg leading-8 text-slate-700">
            {lines[activeIndex]}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous line"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-femiBlue/30 bg-white text-lg font-black text-femiBlue transition hover:bg-femiBlue hover:text-white"
          >
            &larr;
          </button>
          {lines.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Go to line ${index + 1}`}
              className={`h-3 w-3 rounded-full transition ${
                activeIndex === index ? "bg-femiRed" : "bg-femiBlue/25"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={onNext}
            aria-label="Next line"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-femiBlue/30 bg-white text-lg font-black text-femiBlue transition hover:bg-femiBlue hover:text-white"
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
