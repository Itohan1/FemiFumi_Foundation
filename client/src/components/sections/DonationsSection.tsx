import { FormEvent, useEffect, useMemo, useState } from "react";
import { DonationContent, GalleryItem, createDonationTransaction } from "../../lib/api";

type DonationsSectionProps = {
  galleryItems: GalleryItem[];
  donationContent: DonationContent;
};

export default function DonationsSection({
  galleryItems,
  donationContent,
}: DonationsSectionProps) {
  const DESCRIPTION_PREVIEW_LIMIT = 150;
  const [startIndex, setStartIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );
  const [selectedDonation, setSelectedDonation] = useState<GalleryItem | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paystack" | "direct-transfer">("paystack");
  const [donationForm, setDonationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "Nigeria",
    phoneCountryCode: "+234",
    mobile: ""
  });
  const [directTransferProofFile, setDirectTransferProofFile] = useState<File | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [donationFormNotice, setDonationFormNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const visibleCount = isMobileView ? 1 : 2;
  const donationItems = useMemo(
    () => galleryItems.filter((item) => Boolean(item.mediaUrl)),
    [galleryItems],
  );
  const canSlide = donationItems.length > visibleCount;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = () => {
      setIsMobileView(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const visibleItems = useMemo(() => {
    if (donationItems.length <= visibleCount) return donationItems;

    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = (startIndex + offset) % donationItems.length;
      return donationItems[index];
    });
  }, [donationItems, startIndex]);

  useEffect(() => {
    if (donationItems.length === 0) {
      setStartIndex(0);
      return;
    }

    if (startIndex > donationItems.length - 1) {
      setStartIndex(0);
    }
  }, [donationItems.length, startIndex]);

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % donationItems.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [canSlide, donationItems.length]);

  function goPrevious() {
    setStartIndex((current) =>
      current === 0 ? donationItems.length - 1 : current - 1,
    );
  }

  function goNext() {
    setStartIndex((current) => (current + 1) % donationItems.length);
  }

  function closeDonationModal() {
    setSelectedDonation(null);
    setDonationFormNotice(null);
    setDirectTransferProofFile(null);
  }

  function openDonationDetails(id: string) {
    window.location.href = `/donations/${encodeURIComponent(id)}`;
  }

  useEffect(() => {
    if (selectedDonation) {
      setSelectedPaymentMethod("paystack");
      setDonationFormNotice(null);
      setDirectTransferProofFile(null);
    }
  }, [selectedDonation]);

  async function handleSubmitDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDonation) return;

    if (!donationForm.firstName.trim() || !donationForm.lastName.trim() || !donationForm.email.trim()) {
      setDonationFormNotice({ type: "error", text: "First name, last name, and email are required." });
      return;
    }

    if (!donationForm.mobile.trim()) {
      setDonationFormNotice({ type: "error", text: "Mobile number is required." });
      return;
    }

    if (selectedPaymentMethod === "direct-transfer" && !directTransferProofFile) {
      setDonationFormNotice({
        type: "error",
        text: "Upload payment confirmation screenshot for direct transfer."
      });
      return;
    }

    setIsSubmittingDonation(true);
    setDonationFormNotice(null);
    try {
      await createDonationTransaction({
        donationGalleryItemId: selectedDonation.id,
        donationTitle: selectedDonation.title,
        firstName: donationForm.firstName.trim(),
        lastName: donationForm.lastName.trim(),
        email: donationForm.email.trim(),
        country: donationForm.country.trim(),
        phoneCountryCode: donationForm.phoneCountryCode.trim(),
        mobile: donationForm.mobile.trim(),
        paymentMethod: selectedPaymentMethod,
        proofImageFile: selectedPaymentMethod === "direct-transfer" ? directTransferProofFile || undefined : undefined
      });

      setDonationFormNotice({
        type: "ok",
        text:
          selectedPaymentMethod === "direct-transfer"
            ? "Donation submitted. Awaiting admin review."
            : "Donation submitted. Paystack status will be updated automatically."
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit donation.";
      setDonationFormNotice({ type: "error", text: message });
    } finally {
      setIsSubmittingDonation(false);
    }
  }

  function getDescriptionPreview(text: string) {
    const trimmed = text.trim();
    if (trimmed.length <= DESCRIPTION_PREVIEW_LIMIT) {
      return { preview: trimmed, truncated: false };
    }
    return {
      preview: `${trimmed.slice(0, DESCRIPTION_PREVIEW_LIMIT).trimEnd()}...`,
      truncated: true
    };
  }

  return (
    <section id="donations" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-black text-femiBlue">Donations</h2>
      <p className="mt-3 text-slate-700">{donationContent.introText}</p>
      <p className="mt-3 font-semibold text-femiRed">{donationContent.missionText}</p>
      <div className="mt-8">
        {donationItems.length === 0 && (
          <article className="rounded-2xl border border-femiBlue/20 bg-white p-5 shadow-warm">
            <p className="text-sm text-slate-700">
              No gallery entries are published yet. Please check back soon.
            </p>
          </article>
        )}
        {donationItems.length > 0 && (
          <div className="relative">
            <div className="grid gap-5 md:grid-cols-2">
              {visibleItems.map((item, visibleIndex) => (
                <article
                  key={`${item.id}-${startIndex}-${visibleIndex}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-femiRed/20 bg-white shadow-warm"
                >
                  {item.mediaUrl && (
                    <div className="h-48 w-full bg-femiBlue/10">
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
                          className="h-full w-full cursor-pointer object-cover"
                          onClick={() => openDonationDetails(item.id)}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm font-semibold text-femiRed">
                      {item.donateeName || "Anonymous Beneficiary"}
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-femiBlue">
                      {item.title}
                    </h3>
                    {(() => {
                      const fullDescription = item.description || "No description available.";
                      const { preview, truncated } = getDescriptionPreview(fullDescription);
                      return (
                        <p
                          className="mt-2 text-sm leading-6 text-slate-700"
                          style={{
                            maxHeight: "4.5rem",
                            overflow: "hidden",
                            wordBreak: "break-word"
                          }}
                        >
                          {preview}
                          {truncated ? (
                            <>
                              {" "}
                              <button
                                type="button"
                                onClick={() => openDonationDetails(item.id)}
                                className="inline p-0 text-sm font-semibold text-femiBlue underline underline-offset-2"
                              >
                                View more
                              </button>
                            </>
                          ) : null}
                        </p>
                      );
                    })()}
                    <div className="mt-auto flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedDonation(item)}
                        className="rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white transition hover:bg-femiBlue/90"
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {canSlide && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="Previous donations"
                  onClick={goPrevious}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8249;
                </button>
                <div className="flex items-center justify-center gap-2">
                  {donationItems.map((item, index) => (
                    <button
                      key={`${item.id}-dot-${index}`}
                      type="button"
                      aria-label={`Go to gallery position ${index + 1}`}
                      onClick={() => setStartIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        index === startIndex ? "bg-femiBlue" : "bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Next donations"
                  onClick={goNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-femiBlue bg-femiBlue text-2xl font-black text-white shadow-md transition hover:bg-femiBlue/90"
                >
                  &#8250;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-10 rounded-2xl bg-femiBlue p-6 text-white">
        <h3 className="text-xl font-bold">{donationContent.paymentHeading}</h3>
        <p className="mt-2 text-sm text-white/90">
          {donationContent.paymentDescription}
        </p>
        <div className="mt-4 inline-flex flex-col items-start gap-1">
          <button
            type="button"
            aria-disabled="true"
            className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-femiBlue opacity-80 transition hover:bg-femiCream hover:opacity-100"
          >
            {donationContent.onlinePlatformLabel}
          </button>
          <p className="text-xs font-semibold text-femiMustard">Paystack</p>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-femiMustard">
          Affiliated banks for transfer
        </p>
        <ul className="mt-2 grid gap-1 text-sm text-white/90">
          {donationContent.bankTransferDetails.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm">Contact: femifunmicharity@gmail.com</p>
      </div>

      {selectedDonation ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              aria-label="Close donate popup"
              onClick={closeDonationModal}
              className="absolute right-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-black text-slate-700 shadow md:-right-12 md:top-0"
            >
              x
            </button>

            <div className="grid h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
              <div className="h-64 bg-femiBlue/10 md:h-full">
                {selectedDonation.type === "video" ? (
                  <iframe
                    title={selectedDonation.title}
                    src={selectedDonation.mediaUrl}
                    className="h-full w-full"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={selectedDonation.mediaUrl}
                    alt={selectedDonation.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <form className="space-y-3 overflow-y-auto p-6" onSubmit={handleSubmitDonation}>
                <h3 className="text-2xl font-black text-femiBlue">
                  Give your to help change the live of {selectedDonation.title}
                </h3>
                <p className="text-sm font-semibold text-femiRed">Enter your personal details</p>

                <p className="pt-1 text-xs font-bold uppercase tracking-wide text-slate-500">Profile</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    required
                    value={donationForm.firstName}
                    onChange={(event) =>
                      setDonationForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    placeholder="First name"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    value={donationForm.lastName}
                    onChange={(event) =>
                      setDonationForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    placeholder="Last name"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  required
                  type="email"
                  value={donationForm.email}
                  onChange={(event) =>
                    setDonationForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  value={donationForm.country}
                  onChange={(event) =>
                    setDonationForm((current) => ({ ...current, country: event.target.value }))
                  }
                  placeholder="Country"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-[96px_1fr] gap-2">
                  <input
                    value={donationForm.phoneCountryCode}
                    onChange={(event) =>
                      setDonationForm((current) => ({ ...current, phoneCountryCode: event.target.value }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  />
                  <input
                    required
                    value={donationForm.mobile}
                    onChange={(event) =>
                      setDonationForm((current) => ({ ...current, mobile: event.target.value }))
                    }
                    placeholder="Mobile"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
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
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setDirectTransferProofFile(file);
                      }}
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
                {donationFormNotice ? (
                  <p
                    className={`text-sm font-semibold ${
                      donationFormNotice.type === "ok" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {donationFormNotice.text}
                  </p>
                ) : null}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingDonation}
                    className="mt-2 rounded-lg bg-femiBlue px-5 py-3 text-sm font-black text-white transition hover:bg-femiBlue/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="inline-flex items-center gap-2">
                      {isSubmittingDonation ? (
                        <span
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                          aria-hidden="true"
                        />
                      ) : null}
                      {isSubmittingDonation ? "Submitting..." : "Donate Now"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
