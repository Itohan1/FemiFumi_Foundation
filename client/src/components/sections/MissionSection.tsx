type MissionStatement = {
  title: string;
  description: string;
};

type MissionSectionProps = {
  missionStatements: readonly MissionStatement[];
};

export default function MissionSection({ missionStatements }: MissionSectionProps) {
  return (
    <section id="mission" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-black text-femiBlue md:text-4xl">
          Mission Statement
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
          Our mission is practical, community-focused and action-driven. Every
          statement below is a direct area of impact.
        </p>
        <div className="mt-8 grid justify-items-center gap-5 md:grid-cols-2 lg:grid-cols-4">
          {missionStatements.map((mission, index) => (
            <article
              key={mission.title}
              className="group flex aspect-square w-full max-w-[320px] flex-col gap-3 rounded-2xl border-2 bg-white px-6 py-6 shadow-[0_12px_26px_rgba(18,60,143,0.22)] transition duration-200 hover:scale-[1.01] hover:border-femiRed hover:shadow-[0_16px_32px_rgba(18,60,143,0.28)]"
            >
              <p className="text-xs font-black uppercase tracking-wider text-femiRed group-hover:text-femiBlue">
                Mission {index + 1}
              </p>
              <h3 className="mt-2 text-2xl font-black text-femiBlue">
                {mission.title}
              </h3>
              <p className="mt-3 text-slate-700">{mission.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
