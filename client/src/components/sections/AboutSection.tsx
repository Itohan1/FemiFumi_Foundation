type AboutSectionProps = {
  visionImpactImage: string;
};

export default function AboutSection({ visionImpactImage }: AboutSectionProps) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid items-stretch gap-6 rounded-3xl border border-femiBlue/20 bg-white p-6 shadow-warm md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-black text-femiBlue md:text-5xl">
            About FemiFunmi Charity Organisation
          </h2>
          <p className="mt-6 leading-8 text-slate-700">
            Our aim is to link the rich and the poor by providing a platform
            where needs are met through fundraising for individuals and groups
            in orphanages, on the streets, in old people homes, rehabilitation
            centers, and hospitals. We partner with compassionate individuals
            and organizations to advance community well-being through food,
            education, social services, medical care, and support for vulnerable
            people.
          </p>
        </div>
        <div className="h-[360px] w-full max-w-[420px] overflow-hidden rounded-2xl md:h-[450px] md:justify-self-end">
          <img
            src={visionImpactImage}
            alt="Our people"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
