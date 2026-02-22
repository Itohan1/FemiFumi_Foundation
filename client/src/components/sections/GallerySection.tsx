import { GalleryItem } from "../../lib/api";

type GallerySectionProps = {
  items: GalleryItem[];
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

export default function GallerySection({ items }: GallerySectionProps) {
  return (
    <section id="gallery" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-black text-femiBlue">Gallery</h2>
        <p className="mt-3 text-slate-600">
          Photos and videos from outreach locations, with address, dates and
          details.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-femiBlue/20 bg-femiCream"
            >
              <div className="h-40 w-full bg-femiBlue/10">
                {item.type === "video" ? (
                  <iframe
                    title={item.title}
                    src={item.mediaUrl}
                    className="h-full w-full"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-femiBlue">{item.title}</h3>
                <p className="text-sm text-slate-700">{item.location}</p>
                <p className="text-sm text-slate-600">{item.address}</p>
                <p className="mt-2 text-xs font-semibold text-femiRed">
                  {formatDateDayMonthYear(item.date)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
