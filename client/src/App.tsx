import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  DonationContent,
  GalleryItem,
  RecentUpdate,
  getDonationContent,
  getGalleryItems,
  getUpcomingEvents,
  getRecentUpdates,
  UpcomingEvent,
  subscribeToNewsletter,
  sendContactMessage,
} from "./lib/api";
import SiteFooter from "./components/layout/SiteFooter";
import SiteHeader from "./components/layout/SiteHeader";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";
import DidYouKnowSection from "./components/sections/DidYouKnowSection";
import DonationsSection from "./components/sections/DonationsSection";
import HeroSection from "./components/sections/HeroSection";
import MissionSection from "./components/sections/MissionSection";
import RecentUpdatesSection from "./components/sections/RecentUpdatesSection";
import SupportSection from "./components/sections/SupportSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import RecentUpdateDetailPage from "./components/pages/RecentUpdateDetailPage";
import DonationDetailPage from "./components/pages/DonationDetailPage";
import WhatWeAreUpToSection from "./components/sections/WhatWeAreUpToSection";
import {
  BRAND_LOGO,
  DEFAULT_DONATION_CONTENT,
  DID_YOU_KNOW_LINES,
  FEATURED_VOICES,
  MISSION_STATEMENTS,
  TESTIMONIAL_FALLBACK_IMAGE,
  TESTIMONIALS,
  VISION_IMPACT_IMAGE,
  WHO_WE_SUPPORT_IMAGE,
  KIDS_OUTREACH,
} from "./data/siteContent";

type ToastMessage = {
  text: string;
  type: "ok" | "error";
} | null;

type PriorityPopupPayload =
  | { kind: "upcoming"; event: UpcomingEvent }
  | { kind: "donation"; donation: GalleryItem };

function formatPriorityCountdown(targetIso: string): string {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return "Date to be announced";
  }

  const nowMs = Date.now();
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

function MainSite() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [donationContent, setDonationContent] = useState<DonationContent>(
    DEFAULT_DONATION_CONTENT,
  );
  const [contactStatus, setContactStatus] = useState<string>("");
  const [newsletterStatus, setNewsletterStatus] = useState<string>("");
  const [didYouKnowIndex, setDidYouKnowIndex] = useState<number>(0);
  const [testimonialIndex, setTestimonialIndex] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showAllVoices, setShowAllVoices] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage>(null);
  const [priorityPopupIndex, setPriorityPopupIndex] = useState<number>(0);
  const [priorityPopupVisible, setPriorityPopupVisible] = useState<boolean>(true);

  const priorityUpcomingEvent = useMemo(
    () => upcomingEvents.find((item) => item.priorityplacement),
    [upcomingEvents]
  );
  const priorityDonationItem = useMemo(
    () => galleryItems.find((item) => item.priorityplacement && item.mediaUrl),
    [galleryItems]
  );
  const priorityPopupQueue = useMemo(() => {
    const queue: PriorityPopupPayload[] = [];
    if (priorityUpcomingEvent) {
      queue.push({ kind: "upcoming", event: priorityUpcomingEvent });
    }
    if (priorityDonationItem) {
      queue.push({ kind: "donation", donation: priorityDonationItem });
    }
    return queue;
  }, [priorityUpcomingEvent, priorityDonationItem]);
  const activePriorityPopup =
    priorityPopupQueue.length > 0 ? priorityPopupQueue[priorityPopupIndex % priorityPopupQueue.length] : null;

  const refreshDonationSectionData = useCallback(async () => {
    try {
      const [content, gallery] = await Promise.all([
        getDonationContent(),
        getGalleryItems(),
      ]);
      setDonationContent(content);
      setGalleryItems(gallery);
    } catch {
      // Keep current UI data when background refresh fails.
    }
  }, []);

  const refreshUpcomingEventsData = useCallback(async () => {
    try {
      const events = await getUpcomingEvents();
      setUpcomingEvents(events);
    } catch (error) {
      console.error("[UPCOMING][CLIENT] Failed to refresh upcoming events.", error);
    }
  }, []);

  useEffect(() => {
    void refreshDonationSectionData();
    void refreshUpcomingEventsData();
    void getRecentUpdates()
      .then(setRecentUpdates)
      .catch(() => setRecentUpdates([]));
  }, [refreshDonationSectionData, refreshUpcomingEventsData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshDonationSectionData();
      void refreshUpcomingEventsData();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [refreshDonationSectionData, refreshUpcomingEventsData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (priorityPopupQueue.length === 0) {
      setPriorityPopupIndex(0);
      setPriorityPopupVisible(false);
      return;
    }

    setPriorityPopupVisible(true);
    setPriorityPopupIndex((current) => current % priorityPopupQueue.length);

    if (priorityPopupQueue.length === 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setPriorityPopupVisible(true);
      setPriorityPopupIndex((current) => (current + 1) % priorityPopupQueue.length);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [priorityPopupQueue.length]);

  function goToPreviousDidYouKnowLine() {
    setDidYouKnowIndex((current) =>
      current === 0 ? DID_YOU_KNOW_LINES.length - 1 : current - 1,
    );
  }

  function goToNextDidYouKnowLine() {
    setDidYouKnowIndex((current) => (current + 1) % DID_YOU_KNOW_LINES.length);
  }

  function goToPreviousTestimonial() {
    setTestimonialIndex((current) =>
      current === 0 ? TESTIMONIALS.length - 1 : current - 1,
    );
  }

  function goToNextTestimonial() {
    setTestimonialIndex((current) => (current + 1) % TESTIMONIALS.length);
  }

  function toggleFeaturedVoice(voiceId: string, script: string) {
    if (!("speechSynthesis" in window)) return;

    if (playingVoiceId === voiceId) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    setPlayingVoiceId(voiceId);
    window.speechSynthesis.speak(utterance);
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();

    console.log(`[CONTACT][CLIENT] Sending contact message from ${email || "unknown-email"}.`);
    try {
      await sendContactMessage({
        fullName: String(formData.get("fullName") || ""),
        email,
        phoneNumber: String(formData.get("phone") || ""),
        message: String(formData.get("message") || ""),
      });

      setContactStatus("Your message has been sent.");
      setToast({ text: "Your message has been sent.", type: "ok" });
      console.log(`[CONTACT][CLIENT] Contact message sent successfully for ${email || "unknown-email"}.`);
      form.reset();
    } catch (error) {
      setContactStatus("Unable to send message right now.");
      setToast({ text: "Unable to send message right now.", type: "error" });
      console.error("[CONTACT][CLIENT] Contact submit failed.", error);
    }
  }

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!firstName || !email) {
      setNewsletterStatus("Please enter your first name and email.");
      setToast({ text: "Please enter your first name and email.", type: "error" });
      console.error("[NEWSLETTER][CLIENT] Missing firstName or email in subscribe form.");
      return;
    }

    console.log(`[NEWSLETTER][CLIENT] Subscribing ${email} from contact section.`);
    try {
      const response = await subscribeToNewsletter({
        firstName,
        email,
        consentGiven: true,
        source: "contact-section"
      });

      setNewsletterStatus(
        response.alreadySubscribed
          ? "You are already subscribed. We've updated your details."
          : "Thanks for subscribing to our newsletter."
      );
      setToast({
        text: response.alreadySubscribed
          ? "You're already subscribed. Details updated."
          : "Newsletter subscription successful.",
        type: "ok"
      });
      console.log(
        `[NEWSLETTER][CLIENT] Subscribe success for ${email}. alreadySubscribed=${response.alreadySubscribed}`
      );
      form.reset();
    } catch (error) {
      setNewsletterStatus("Unable to subscribe right now. Please try again.");
      setToast({ text: "Unable to subscribe right now. Please try again.", type: "error" });
      console.error("[NEWSLETTER][CLIENT] Subscribe failed.", error);
    }
  }

  function openRecentUpdate(id: string) {
    const path = `/recent-updates/${encodeURIComponent(id)}`;
    window.open(path, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-femiCream text-slate-900">
      {toast ? (
        <div className="fixed right-4 top-4 z-[80] max-w-sm">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.text}</p>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs font-bold opacity-70 hover:opacity-100"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {priorityPopupVisible && activePriorityPopup ? (
        <div className="fixed bottom-4 left-4 right-4 z-[75] mx-auto max-w-md">
          <div className="rounded-xl border border-femiBlue/20 bg-white p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-femiRed">
                {activePriorityPopup.kind === "upcoming" ? "Priority Upcoming Event" : "Priority Donation"}
              </p>
              <button
                type="button"
                onClick={() => setPriorityPopupVisible(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                CLOSE
              </button>
            </div>
            <div className="grid grid-cols-[96px_1fr] gap-3">
              {activePriorityPopup.kind === "upcoming" ? (
                <img
                  src={activePriorityPopup.event.imageUrl}
                  alt={activePriorityPopup.event.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : activePriorityPopup.donation.type === "video" ? (
                <iframe
                  src={activePriorityPopup.donation.mediaUrl}
                  title={activePriorityPopup.donation.title}
                  className="h-24 w-24 rounded-lg border border-slate-200 bg-slate-100"
                  allowFullScreen
                />
              ) : (
                <img
                  src={activePriorityPopup.donation.mediaUrl}
                  alt={activePriorityPopup.donation.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-femiBlue">
                  {activePriorityPopup.kind === "upcoming" ? activePriorityPopup.event.title : activePriorityPopup.donation.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-700">
                  {activePriorityPopup.kind === "upcoming"
                    ? activePriorityPopup.event.description
                    : activePriorityPopup.donation.description || "Support this donation case."}
                </p>
                {activePriorityPopup.kind === "upcoming" ? (
                  <p className="mt-1 text-xs font-semibold text-femiRed">
                    Countdown: {formatPriorityCountdown(activePriorityPopup.event.dateIso)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.open(`/donations/${encodeURIComponent(activePriorityPopup.donation.id)}`, "_blank", "noopener,noreferrer")}
                    className="mt-1 rounded bg-femiBlue px-2 py-1 text-xs font-semibold text-white"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <SiteHeader brandLogo={BRAND_LOGO} />

      <main>
        <HeroSection brandLogo={BRAND_LOGO} backgroundImage={KIDS_OUTREACH} />
        <AboutSection visionImpactImage={VISION_IMPACT_IMAGE} />
        <DidYouKnowSection
          lines={DID_YOU_KNOW_LINES}
          activeIndex={didYouKnowIndex}
          onPrevious={goToPreviousDidYouKnowLine}
          onNext={goToNextDidYouKnowLine}
          onSelect={setDidYouKnowIndex}
        />
        <MissionSection missionStatements={MISSION_STATEMENTS} />
        <SupportSection supportImage={WHO_WE_SUPPORT_IMAGE} />
        <TestimonialsSection
          testimonials={TESTIMONIALS}
          fallbackImage={TESTIMONIAL_FALLBACK_IMAGE}
          testimonialIndex={testimonialIndex}
          onPrevious={goToPreviousTestimonial}
          onNext={goToNextTestimonial}
          onSelect={setTestimonialIndex}
          featuredVoices={FEATURED_VOICES}
          showAllVoices={showAllVoices}
          onToggleShowAllVoices={() => setShowAllVoices((current) => !current)}
          playingVoiceId={playingVoiceId}
          onToggleVoice={toggleFeaturedVoice}
        />
        <WhatWeAreUpToSection events={upcomingEvents} />
        <RecentUpdatesSection
          items={recentUpdates}
          onOpenUpdate={openRecentUpdate}
        />
        <DonationsSection
          galleryItems={galleryItems}
          donationContent={donationContent}
        />
        <ContactSection
          contactStatus={contactStatus}
          newsletterStatus={newsletterStatus}
          onContactSubmit={handleContactSubmit}
          onNewsletterSubmit={handleNewsletterSubmit}
        />
      </main>

      <SiteFooter brandLogo={BRAND_LOGO} />
    </div>
  );
}

export default function App() {
  const donationMatch = window.location.pathname.match(/^\/donations\/([^/]+)$/);
  if (donationMatch) {
    return <DonationDetailPage donationId={decodeURIComponent(donationMatch[1])} />;
  }

  const match = window.location.pathname.match(/^\/recent-updates\/([^/]+)$/);
  if (match) {
    return <RecentUpdateDetailPage updateId={decodeURIComponent(match[1])} />;
  }

  return <MainSite />;
}
