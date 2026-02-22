import { useEffect, useRef, useState } from "react";

type HeroSectionProps = {
  brandLogo: string;
  backgroundImage: string;
};

const HERO_STATS = [
  {
    target: 1500,
    suffix: "+",
    label: "Africans impacted",
  },
  {
    target: 2500,
    suffix: "+",
    label: "Young African Children, Widows and Unemployed",
  },
  {
    target: 500,
    suffix: "+",
    label: "Regions",
  },
] as const;

export default function HeroSection({
  brandLogo,
  backgroundImage,
}: HeroSectionProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(
    HERO_STATS.map(() => 0),
  );
  const [isStatsInView, setIsStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const valuesRef = useRef<number[]>(HERO_STATS.map(() => 0));

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsStatsInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const durationMs = 1000;
    const startTime = performance.now();
    const startValues = [...valuesRef.current];
    const targetValues = HERO_STATS.map((stat) => (isStatsInView ? stat.target : 0));
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const nextValues = startValues.map((startValue, index) =>
        Math.round(
          startValue + (targetValues[index] - startValue) * easedProgress,
        ),
      );
      valuesRef.current = nextValues;
      setAnimatedValues(nextValues);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [isStatsInView]);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-femiRed via-femiBlue to-femiMustard text-white"
    >
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 md:pb-40 md:pt-28">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center rounded-2xl bg-white px-4 py-2 shadow-xl">
              <img
                src={brandLogo}
                alt="Femifunmi Charity Organisation"
                className="h-14 w-auto"
              />
            </div>
            <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-bold">
              Loving and Giving
            </p>
            <h1 className="font-display text-4xl font-black leading-tight md:text-6xl">
              Femi & Funmi Charity Organisation
            </h1>
            <p className="mt-6 max-w-xl text-white/90">
              A non-governmental and non-profitable charity organization
              established in September 2018 to support less privileged
              communities in Sub-Saharan Africa.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#donations"
                className="rounded-full bg-white px-6 py-3 font-bold text-femiRed"
              >
                Donate Now
              </a>
              <a
                href="#about"
                className="rounded-full border border-white px-6 py-3 font-bold"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
            <h2 className="text-xl font-bold">Registered Details</h2>
            <p className="mt-3 text-sm">
              Registered under the Corporate Affairs Commission of the Federal
              Republic of Nigeria.
            </p>
            <p className="mt-2 text-sm">
              Company and Allied Matters Act (1990) | Registered Number: 154899
            </p>
            <p className="mt-4 text-sm">
              Founded by Mr. & Mrs. Olufemi and Olufunmi Oguntoyinbo in Ikeja,
              Lagos.
            </p>
            <p className="mt-4 text-sm font-semibold">
              Website: www.femifunmicharity.org
            </p>
            <p className="text-sm">Email: femifunmicharity@gmail.com</p>
            <div className="mt-5 h-28 w-36 overflow-hidden rounded-xl border border-white/30 bg-white/10">
              <iframe
                title="Certificate of incorporation preview"
                src="/certificates/certificate-of-incorporation.pdf#page=1&zoom=page-fit"
                className="h-full w-full"
              />
            </div>
            <div className="mt-3">
              <a
                href="/certificates/certificate-of-incorporation.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-femiBlue transition hover:bg-white/90"
              >
                View Certificate
              </a>
            </div>
          </div>
        </div>

        <div
          ref={statsRef}
          className="mt-8 grid w-full gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:absolute md:bottom-0 md:left-0 md:right-0 md:mt-0 md:grid-cols-3"
        >
          {HERO_STATS.map((stat, index) => (
            <article
              key={stat.label}
              className="rounded-xl bg-white/10 px-4 py-4 text-center"
            >
              <p className="text-3xl font-black md:text-4xl">
                {animatedValues[index].toLocaleString()}
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/90">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
