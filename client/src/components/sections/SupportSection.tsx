type SupportSectionProps = {
  supportImage: string;
};

export default function SupportSection({ supportImage }: SupportSectionProps) {
  return (
    <section id="support" className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="mb-6 font-display text-3xl font-black text-femiBlue">
        Who We Support
      </h2>
      <div className="grid items-stretch overflow-hidden rounded-3xl border border-femiBlue/20 bg-white shadow-warm md:grid-cols-2">
        <div className="h-full min-h-[320px]">
          <img
            src={supportImage}
            alt="Close-up smiley African girls outdoors"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-8">
          <h3 className="text-xl font-black text-femiRed">Lives We Touch</h3>
          <p className="mt-4 text-slate-700">
            We support children, orphans, people with disabilities, the sick,
            the aged, drug addicts, and less privileged families who need urgent
            financial or social assistance.
          </p>
          <ul className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
            <li>Children and orphans</li>
            <li>People with disabilities</li>
            <li>The sick and the aged</li>
            <li>Drug addicts and vulnerable families</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
