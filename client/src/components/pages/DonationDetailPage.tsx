import { useEffect, useMemo, useState } from "react";
import { GalleryItem, getGalleryItemById } from "../../lib/api";
import SiteFooter from "../layout/SiteFooter";
import { BRAND_LOGO } from "../../data/siteContent";

type DonationDetailPageProps = {
  donationId: string;
};

export default function DonationDetailPage({
  donationId,
}: DonationDetailPageProps) {
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showDonatePopup, setShowDonatePopup] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paystack" | "direct-transfer">("paystack");

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    void getGalleryItemById(donationId)
      .then((selected) => {
        setItem(selected);
      })
      .catch(() => {
        setHasError(true);
        setItem(null);
      })
      .finally(() => setIsLoading(false));
  }, [donationId]);

  const relatedMedia = useMemo(() => {
    if (!item) return [];

    const cover = [
      { id: `${item.id}-cover`, type: item.type, mediaUrl: item.mediaUrl },
    ];
    const extra = (item.extraMedia || []).map((media) => ({
      id: media.id,
      type: media.type,
      mediaUrl: media.mediaUrl,
    }));
    return [...cover, ...extra];
  }, [item]);

  function closeDonatePopup() {
    setShowDonatePopup(false);
  }

  return (
    <div className="min-h-screen bg-femiCream text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/"
            className="inline-flex items-center rounded-lg border border-femiBlue/30 bg-white px-4 py-2 text-sm font-semibold text-femiBlue"
          >
            Back to Home
          </a>
        </div>

        {isLoading ? (
          <p className="mt-6 text-slate-600">Loading donation details...</p>
        ) : null}

        {!isLoading && hasError ? (
          <p className="mt-6 rounded-xl border border-femiRed/20 bg-white p-4 text-femiRed">
            Unable to load this donation.
          </p>
        ) : null}

        {!isLoading && !hasError && item ? (
          <article className="mt-6 space-y-6 rounded-2xl border border-femiBlue/20 bg-white p-6 shadow-sm">
            <header className="relative pr-28">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-femiRed">
                  {item.donateeName || "Anonymous Beneficiary"}
                </p>
                <h1 className="text-3xl font-black text-femiBlue">
                  {item.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentMethod("paystack");
                  setShowDonatePopup(true);
                }}
                className="absolute right-0 top-0 inline-flex rounded-lg bg-femiBlue px-5 py-3 text-sm font-black text-white transition hover:bg-femiBlue/90"
              >
                Donate
              </button>
            </header>

            <section>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {relatedMedia.map((media, index) => (
                  <div
                    key={`${media.id}-${index}`}
                    className="overflow-hidden rounded-xl border border-femiBlue/15 bg-femiCream"
                  >
                    {media.type === "video" ? (
                      <iframe
                        title={`${item.title}-${index}`}
                        src={media.mediaUrl}
                        className="h-64 w-full"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={media.mediaUrl}
                        alt={item.title}
                        className="h-64 w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="mt-2 text-base leading-7 text-slate-700 break-words whitespace-pre-wrap">
                {item.description || "No description available."}
              </p>
            </section>
          </article>
        ) : null}
      </main>
      {showDonatePopup && item ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              aria-label="Close donate popup"
              onClick={closeDonatePopup}
              className="absolute -right-12 top-0 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-black text-slate-700 shadow"
            >
              x
            </button>

            <div className="grid h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
              <div className="h-64 bg-femiBlue/10 md:h-full">
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

              <div className="space-y-3 overflow-y-auto p-6">
                <h3 className="text-2xl font-black text-femiBlue">
                  Give your to help change the live of {item.title}
                </h3>
                <p className="text-sm font-semibold text-femiRed">Enter your personal details</p>

                <p className="pt-1 text-xs font-bold uppercase tracking-wide text-slate-500">Profile</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input placeholder="First name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <input placeholder="Last name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <input placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input
                  defaultValue="Nigeria"
                  placeholder="Country"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-[96px_1fr] gap-2">
                  <input
                    defaultValue="+234"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  />
                  <input placeholder="Mobile" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Payment Methods
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("paystack")}
                    className={`inline-flex rounded-lg border px-4 py-2 text-sm font-bold transition ${
                      selectedPaymentMethod === "paystack"
                        ? "border-femiBlue bg-femiBlue text-white"
                        : "border-femiBlue bg-white text-femiBlue hover:bg-femiBlue/5"
                    }`}
                  >
                    Paystack
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("direct-transfer")}
                    className={`inline-flex rounded-lg border px-4 py-2 text-sm font-bold transition ${
                      selectedPaymentMethod === "direct-transfer"
                        ? "border-femiBlue bg-femiBlue text-white"
                        : "border-femiBlue bg-white text-femiBlue hover:bg-femiBlue/5"
                    }`}
                  >
                    Direct Transfer
                  </button>
                </div>
                {selectedPaymentMethod === "direct-transfer" ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Upload payment confirmation screenshot
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Affiliated banks for transfer
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      FEMIFUNMI CHARITY ORGANISATION - Zenith Bank - 1234567890
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      FEMIFUNMI CHARITY ORGANISATION - GTBank - 0123456789
                    </p>
                    <p className="mt-2 text-sm text-slate-700">Contact: femifunmicharity@gmail.com</p>
                    <p className="mt-2 text-sm text-slate-700">
                      A Thank You Email will be forwarded to You once your transaction is approved by Us.
                    </p>
                  </div>
                ) : null}
                <div className="mt-2 flex items-end justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled
                      className="rounded-lg bg-femiBlue px-5 py-3 text-sm font-black text-white opacity-70 transition hover:bg-femiBlue/90 disabled:cursor-not-allowed"
                    >
                      Donate Securely Online
                    </button>
                    <p className="text-xs font-semibold text-femiBlue">Paystack</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <SiteFooter brandLogo={BRAND_LOGO} />
    </div>
  );
}
