import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DonationTransaction,
  GalleryItem,
  NewsletterCampaign,
  NewsletterSubscriber,
  RecentUpdate,
  UpcomingEvent,
  adminValidateKey,
  adminSendNewsletter,
  adminCreateGalleryItem,
  adminCreateRecentUpdate,
  adminCreateUpcomingEvent,
  adminDeleteGalleryItem,
  adminDeleteRecentUpdate,
  adminDeleteUpcomingEvent,
  adminUpdateDirectTransferStatus,
  getNewsletterCampaigns,
  getNewsletterSubscribers,
  getDonationTransactions,
  adminUpdateGalleryItem,
  adminUpdateRecentUpdate,
  adminUpdateUpcomingEvent,
  getGalleryItemById,
  getGalleryItems,
  getRecentUpdateById,
  getRecentUpdates,
  getUpcomingEventById,
  getUpcomingEvents
} from "./lib/api";
import { DashboardSection } from "./sections/DashboardSection";
import { DonationGalleryListSection } from "./sections/DonationGalleryListSection";
import { UpcomingEventsSection } from "./sections/UpcomingEventsSection";
import { RecentUpdatesSection } from "./sections/RecentUpdatesSection";
import { CreateGalleryItemSection } from "./sections/CreateGalleryItemSection";
import { CreateUpcomingEventSection } from "./sections/CreateUpcomingEventSection";
import { CreateRecentUpdateItemSection } from "./sections/CreateRecentUpdateItemSection";
import { DonationsTransactionsSection } from "./sections/DonationsTransactionsSection";
import { NewsletterSection } from "./sections/NewsletterSection";
import {
  GalleryFormState,
  GalleryExtraMediaFormItem,
  NewsletterFormState,
  Notice,
  RecentUpdateFormState,
  RecentUpdateMediaFormItem,
  SectionKey,
  UpcomingEventFormState
} from "./types/admin";

const BRAND_LOGO = "/brand/image1.png";
const ADMIN_KEY_SESSION_STORAGE_KEY = "femifunmi_admin_key";

const SECTION_LABEL: Record<SectionKey, string> = {
  dashboard: "Dashboard",
  "recent-updates": "Recent Updates",
  "upcoming-events": "Upcoming Events",
  "donation-gallery": "Donation Gallery",
  donations: "Donations",
  newsletter: "Newsletter",
  "create-recent-update-item": "Create Recent Update Item",
  "create-upcoming-event": "Create Upcoming Event",
  "create-gallery-item": "Create Gallery"
};

const EMPTY_GALLERY_FORM: GalleryFormState = {
  type: "photo",
  donateeName: "",
  title: "",
  description: "",
  location: "",
  address: "",
  date: "",
  priorityplacement: false,
  mediaUrl: ""
};

const EMPTY_UPCOMING_FORM: UpcomingEventFormState = {
  title: "",
  description: "",
  dateIso: "",
  location: "",
  priorityplacement: false
};

const EMPTY_RECENT_UPDATE_FORM: RecentUpdateFormState = {
  title: "",
  description: "",
  date: "",
  location: "",
  mainMediaIndex: 0
};

const EMPTY_NEWSLETTER_FORM: NewsletterFormState = {
  subject: "",
  body: ""
};

function isSectionKey(value: string): value is SectionKey {
  return (
    value === "dashboard" ||
    value === "recent-updates" ||
    value === "upcoming-events" ||
    value === "donation-gallery" ||
    value === "donations" ||
    value === "newsletter" ||
    value === "create-recent-update-item" ||
    value === "create-upcoming-event" ||
    value === "create-gallery-item"
  );
}

function readSectionFromHash(): SectionKey {
  const hashValue = window.location.hash.replace("#", "").trim();
  return isSectionKey(hashValue) ? hashValue : "dashboard";
}

function toDateTimeLocalInputValue(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toOffsetIsoFromDateTimeLocalInput(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  const seconds = String(parsed.getSeconds()).padStart(2, "0");
  const offsetMinutes = -parsed.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, "0");
  const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

async function optimizeRecentUpdateImage(file: File): Promise<File> {
  const isCompressibleType =
    file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png" || file.type === "image/webp";
  const maxBytesBeforeCompress = 1 * 1024 * 1024;

  if (!isCompressibleType || file.size <= maxBytesBeforeCompress) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image for compression."));
      img.src = objectUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.8);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function App() {
  type DeleteTarget = "gallery" | "upcoming" | "recent-update";
  const [adminKey, setAdminKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(ADMIN_KEY_SESSION_STORAGE_KEY) || "";
  });
  const [notice, setNotice] = useState<Notice>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>(() => readSectionFromHash());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [donationTransactions, setDonationTransactions] = useState<DonationTransaction[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterCampaigns, setNewsletterCampaigns] = useState<NewsletterCampaign[]>([]);
  const [newsletterForm, setNewsletterForm] = useState<NewsletterFormState>(EMPTY_NEWSLETTER_FORM);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [isRefreshingNewsletter, setIsRefreshingNewsletter] = useState(false);
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);
  const [isSubmittingUpcoming, setIsSubmittingUpcoming] = useState(false);
  const [isSubmittingRecentUpdate, setIsSubmittingRecentUpdate] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [isUpdatingDonationStatus, setIsUpdatingDonationStatus] = useState(false);

  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [selectedUpcomingId, setSelectedUpcomingId] = useState<string | null>(null);
  const [selectedRecentUpdateId, setSelectedRecentUpdateId] = useState<string | null>(null);

  const [galleryForm, setGalleryForm] = useState<GalleryFormState>(EMPTY_GALLERY_FORM);
  const [upcomingForm, setUpcomingForm] = useState<UpcomingEventFormState>(EMPTY_UPCOMING_FORM);
  const [recentUpdateForm, setRecentUpdateForm] = useState<RecentUpdateFormState>(EMPTY_RECENT_UPDATE_FORM);
  const [recentUpdateMedia, setRecentUpdateMedia] = useState<RecentUpdateMediaFormItem[]>([]);

  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingUpcomingId, setEditingUpcomingId] = useState<string | null>(null);
  const [editingRecentUpdateId, setEditingRecentUpdateId] = useState<string | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState("");
  const [upcomingPreviewUrl, setUpcomingPreviewUrl] = useState("");
  const [galleryMediaFile, setGalleryMediaFile] = useState<File | null>(null);
  const [upcomingImageFile, setUpcomingImageFile] = useState<File | null>(null);
  const [galleryExtraMedia, setGalleryExtraMedia] = useState<GalleryExtraMediaFormItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isAdminKeyVerified, setIsAdminKeyVerified] = useState(false);
  const [isVerifyingAdminKey, setIsVerifyingAdminKey] = useState(false);
  const [adminKeyError, setAdminKeyError] = useState("");
  const [hasAutoValidatedSessionKey, setHasAutoValidatedSessionKey] = useState(false);
  const hasAdminKey = adminKey.trim().length > 0;

  function revokeIfBlobUrl(url: string) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  function toDateInputValue(raw: string): string {
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(raw)) {
      return raw;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function handleAdminKeyInputChange(value: string) {
    setAdminKey(value);
    setIsAdminKeyVerified(false);
    setAdminKeyError("");
  }

  async function verifyAdminKey(): Promise<boolean> {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey) {
      setIsAdminKeyVerified(false);
      setAdminKeyError("Admin key is required.");
      return false;
    }

    setIsVerifyingAdminKey(true);
    setAdminKeyError("");
    try {
      await adminValidateKey(trimmedAdminKey);
      setAdminKey(trimmedAdminKey);
      setIsAdminKeyVerified(true);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid admin key.";
      setIsAdminKeyVerified(false);
      setAdminKeyError(message || "Invalid admin key.");
      return false;
    } finally {
      setIsVerifyingAdminKey(false);
    }
  }

  async function refreshAllLists() {
    const [galleryRes, upcomingRes, recentRes] = await Promise.all([
      getGalleryItems(),
      getUpcomingEvents(),
      getRecentUpdates()
    ]);

    setGalleryItems(galleryRes);
    setUpcomingEvents(upcomingRes);
    setRecentUpdates(recentRes);
  }

  async function refreshRecentUpdatesList() {
    const recentRes = await getRecentUpdates();
    setRecentUpdates(recentRes);
  }

  async function refreshDonationTransactions() {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setDonationTransactions([]);
      return;
    }

    const response = await getDonationTransactions(trimmedAdminKey);
    setDonationTransactions(response);
  }

  async function refreshNewsletterData() {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNewsletterSubscribers([]);
      setNewsletterCampaigns([]);
      return;
    }

    console.log("[NEWSLETTER][ADMIN] Loading newsletter subscribers and campaigns.");
    const [subscribersRes, campaignsRes] = await Promise.all([
      getNewsletterSubscribers(trimmedAdminKey),
      getNewsletterCampaigns(trimmedAdminKey)
    ]);
    setNewsletterSubscribers(subscribersRes);
    setNewsletterCampaigns(campaignsRes);
    console.log(
      `[NEWSLETTER][ADMIN] Loaded subscribers=${subscribersRes.length}, campaigns=${campaignsRes.length}.`
    );
  }

  useEffect(() => {
    setIsLoading(true);
    void refreshAllLists()
      .then(() => setNotice(null))
      .catch(() => {
        setNotice({ text: "Unable to load records from API.", type: "error" });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = readSectionFromHash();
    }

    function onHashChange() {
      setActiveSection(readSectionFromHash());
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const trimmed = adminKey.trim();
    if (!trimmed || !isAdminKeyVerified) {
      window.sessionStorage.removeItem(ADMIN_KEY_SESSION_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(ADMIN_KEY_SESSION_STORAGE_KEY, trimmed);
  }, [adminKey, isAdminKeyVerified]);

  useEffect(() => {
    if (hasAutoValidatedSessionKey) return;
    if (!hasAdminKey) {
      setHasAutoValidatedSessionKey(true);
      return;
    }

    void verifyAdminKey().finally(() => {
      setHasAutoValidatedSessionKey(true);
    });
  }, [hasAutoValidatedSessionKey, hasAdminKey]);

  useEffect(() => {
    if (activeSection !== "newsletter") return;
    if (!isAdminKeyVerified) {
      setNewsletterSubscribers([]);
      setNewsletterCampaigns([]);
      return;
    }

    void refreshNewsletterData().catch(() => {
      setNotice({ text: "Unable to load newsletter records.", type: "error" });
    });
  }, [activeSection, adminKey, isAdminKeyVerified]);

  useEffect(() => {
    if (activeSection !== "donations") return;
    if (!isAdminKeyVerified) {
      setDonationTransactions([]);
      return;
    }

    void refreshDonationTransactions().catch(() => {
      setNotice({ text: "Unable to load donation transactions.", type: "error" });
    });
  }, [activeSection, adminKey, isAdminKeyVerified]);

  useEffect(() => {
    if (!notice) return;

    const stamp = new Date().toISOString();
    if (notice.type === "ok") {
      console.log(`[ADMIN][SUCCESS][${stamp}] ${notice.text}`);
      return;
    }

    console.error(`[ADMIN][ERROR][${stamp}] ${notice.text}`);
  }, [notice]);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function selectGalleryItem(id: string) {
    setSelectedGalleryId(id);
    try {
      const details = await getGalleryItemById(id);
      setGalleryForm({
        type: details.type,
        donateeName: details.donateeName || "",
        title: details.title,
        description: details.description || "",
        location: details.location,
        address: details.address,
        date: details.date,
        priorityplacement: Boolean(details.priorityplacement),
        mediaUrl: details.mediaUrl
      });
      setGalleryPreviewUrl("");
      setGalleryMediaFile(null);
      setGalleryExtraMedia((details.extraMedia || []).map((item) => ({ id: item.id, type: item.type, mediaUrl: item.mediaUrl })));
      setEditingGalleryId(details.id);
    } catch {
      setNotice({ text: "Unable to load gallery details.", type: "error" });
    }
  }

  async function selectUpcomingEvent(id: string) {
    setSelectedUpcomingId(id);
    try {
      const details = await getUpcomingEventById(id);
      setUpcomingForm({
        title: details.title,
        description: details.description,
        dateIso: toDateTimeLocalInputValue(details.dateIso),
        location: details.location,
        priorityplacement: Boolean(details.priorityplacement)
      });
      setUpcomingPreviewUrl(details.imageUrl);
      setUpcomingImageFile(null);
      setEditingUpcomingId(details.id);
    } catch {
      setNotice({ text: "Unable to load upcoming event details.", type: "error" });
    }
  }

  async function selectRecentUpdate(id: string) {
    setSelectedRecentUpdateId(id);
    try {
      const details = await getRecentUpdateById(id);
      const mainMediaIndex = Math.max(0, details.media.findIndex((item) => item.id === details.mainMediaId));

      setRecentUpdateForm({
        title: details.title,
        description: details.description || "",
        date: toDateInputValue(details.date),
        location: details.location,
        mainMediaIndex
      });
      setRecentUpdateMedia(
        details.media.map((item) => ({
          type: item.type,
          mediaUrl: item.mediaUrl,
          caption: item.caption,
          isUploading: false,
          uploadError: false
        }))
      );
      setEditingRecentUpdateId(details.id);
    } catch {
      setNotice({ text: "Unable to load recent update details.", type: "error" });
    }
  }

  function openCreateGalleryPage() {
    resetGalleryForm();
    navigateToSection("create-gallery-item");
  }

  function openCreateUpcomingEventPage() {
    resetUpcomingForm();
    navigateToSection("create-upcoming-event");
  }

  function openCreateRecentUpdatePage() {
    resetRecentUpdateForm();
    navigateToSection("create-recent-update-item");
  }

  async function openEditGalleryPage(id: string) {
    await selectGalleryItem(id);
    navigateToSection("create-gallery-item");
  }

  async function openEditUpcomingEventPage(id: string) {
    await selectUpcomingEvent(id);
    navigateToSection("create-upcoming-event");
  }

  async function openEditRecentUpdatePage(id: string) {
    await selectRecentUpdate(id);
    navigateToSection("create-recent-update-item");
  }

  function resetGalleryForm() {
    galleryExtraMedia.forEach((item) => {
      if (item.previewUrl) {
        revokeIfBlobUrl(item.previewUrl);
      }
    });

    revokeIfBlobUrl(galleryPreviewUrl);
    setEditingGalleryId(null);
    setSelectedGalleryId(null);
    setGalleryForm(EMPTY_GALLERY_FORM);
    setGalleryPreviewUrl("");
    setGalleryMediaFile(null);
    setGalleryExtraMedia([]);
  }

  function resetUpcomingForm() {
    revokeIfBlobUrl(upcomingPreviewUrl);
    setEditingUpcomingId(null);
    setSelectedUpcomingId(null);
    setUpcomingForm(EMPTY_UPCOMING_FORM);
    setUpcomingPreviewUrl("");
    setUpcomingImageFile(null);
  }

  function resetRecentUpdateForm() {
    recentUpdateMedia.forEach((item) => {
      if (item.previewUrl) {
        revokeIfBlobUrl(item.previewUrl);
      }
    });

    setEditingRecentUpdateId(null);
    setSelectedRecentUpdateId(null);
    setRecentUpdateForm(EMPTY_RECENT_UPDATE_FORM);
    setRecentUpdateMedia([]);
  }

  function onSelectGalleryMedia(file: File) {
    const localPreviewUrl = URL.createObjectURL(file);
    setGalleryPreviewUrl((current) => {
      if (current) {
        revokeIfBlobUrl(current);
      }
      return localPreviewUrl;
    });
    setGalleryMediaFile(file);
    setGalleryForm((current) => ({ ...current, mediaUrl: "" }));
  }

  async function uploadGalleryExtraMedia(file: File, type: "photo" | "video") {
    const localPreviewUrl = URL.createObjectURL(file);
    setGalleryExtraMedia((current) => [
      ...current,
      { type, mediaUrl: "", file, previewUrl: localPreviewUrl }
    ]);
  }

  function removeGalleryExtraMedia(index: number) {
    setGalleryExtraMedia((current) =>
      current.filter((item, itemIndex) => {
        if (itemIndex === index && item.previewUrl) {
          revokeIfBlobUrl(item.previewUrl);
        }
        return itemIndex !== index;
      })
    );
  }

  function onSelectUpcomingImage(file: File) {
    const localPreviewUrl = URL.createObjectURL(file);
    setUpcomingPreviewUrl((current) => {
      if (current) {
        revokeIfBlobUrl(current);
      }
      return localPreviewUrl;
    });
    setUpcomingImageFile(file);
  }

  async function uploadRecentUpdateMedia(file: File, type: "photo" | "video") {
    const processedFile = type === "photo" ? await optimizeRecentUpdateImage(file) : file;
    const localPreviewUrl = URL.createObjectURL(processedFile);
    setRecentUpdateMedia((current) => [
      ...current,
      {
        type,
        file: processedFile,
        mediaUrl: "",
        caption: "",
        previewUrl: localPreviewUrl,
        isUploading: false,
        uploadError: false
      }
    ]);
  }

  function updateRecentMediaCaption(index: number, caption: string) {
    setRecentUpdateMedia((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, caption } : item))
    );
  }

  function removeRecentMedia(index: number) {
    setRecentUpdateMedia((current) =>
      current.filter((item, itemIndex) => {
        if (itemIndex === index && item.previewUrl) {
          revokeIfBlobUrl(item.previewUrl);
        }
        return itemIndex !== index;
      })
    );
    setRecentUpdateForm((current) => {
      if (current.mainMediaIndex > index) {
        return { ...current, mainMediaIndex: current.mainMediaIndex - 1 };
      }
      if (current.mainMediaIndex === index) {
        return { ...current, mainMediaIndex: Math.max(0, current.mainMediaIndex - 1) };
      }
      return current;
    });
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingGallery) {
      return;
    }
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before saving.", type: "error" });
      return;
    }
    if (!editingGalleryId && !galleryMediaFile) {
      setNotice({ text: "Upload a photo/video from your device first.", type: "error" });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedGalleryDate = new Date(galleryForm.date);
    if (Number.isNaN(selectedGalleryDate.getTime()) || selectedGalleryDate < today) {
      setNotice({ text: "Gallery date cannot be in the past.", type: "error" });
      return;
    }

    try {
      setIsSubmittingGallery(true);
      if (galleryExtraMedia.some((item) => !item.file && !item.mediaUrl)) {
        setNotice({ text: "Remove invalid additional media entries before saving.", type: "error" });
        return;
      }

      const extraMediaFiles = galleryExtraMedia
        .filter((item) => item.file)
        .map((item) => ({ type: item.type, file: item.file as File }));

      const payload = {
        type: galleryForm.type,
        donateeName: galleryForm.donateeName,
        title: galleryForm.title,
        description: galleryForm.description,
        location: galleryForm.location,
        address: galleryForm.address,
        date: galleryForm.date,
        priorityplacement: galleryForm.priorityplacement,
        mediaUrl: galleryForm.mediaUrl,
        extraMedia: galleryExtraMedia
          .filter((item) => item.mediaUrl)
          .map((item, index) => ({
          id: item.id || `gallery-extra-${index}`,
          type: item.type,
          mediaUrl: item.mediaUrl
          }))
      };

      if (editingGalleryId) {
        await adminUpdateGalleryItem(trimmedAdminKey, editingGalleryId, payload, galleryMediaFile || undefined, extraMediaFiles);
        setNotice({ text: "Gallery item updated.", type: "ok" });
      } else {
        await adminCreateGalleryItem(trimmedAdminKey, payload, galleryMediaFile || undefined, extraMediaFiles);
        setNotice({ text: "Gallery item created.", type: "ok" });
      }

      await refreshAllLists();
      resetGalleryForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save gallery item.";
      setNotice({ text: message, type: "error" });
    } finally {
      setIsSubmittingGallery(false);
    }
  }

  async function handleUpcomingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingUpcoming) {
      return;
    }
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before saving.", type: "error" });
      return;
    }
    if (!editingUpcomingId && !upcomingImageFile) {
      setNotice({ text: "Upload an image from your device first.", type: "error" });
      return;
    }
    const normalizedDateIso = toOffsetIsoFromDateTimeLocalInput(upcomingForm.dateIso);
    if (!normalizedDateIso) {
      setNotice({ text: "Enter a valid upcoming event date and time.", type: "error" });
      return;
    }
    const selectedUpcomingDate = new Date(normalizedDateIso);
    if (Number.isNaN(selectedUpcomingDate.getTime())) {
      setNotice({ text: "Enter a valid upcoming event date and time.", type: "error" });
      return;
    }
    if (selectedUpcomingDate.getTime() < Date.now()) {
      setNotice({ text: "Upcoming event date cannot be in the past.", type: "error" });
      return;
    }

    try {
      const payload = {
        ...upcomingForm,
        dateIso: normalizedDateIso
      };

      setIsSubmittingUpcoming(true);
      if (editingUpcomingId) {
        await adminUpdateUpcomingEvent(trimmedAdminKey, editingUpcomingId, payload, upcomingImageFile || undefined);
        setNotice({ text: "Upcoming event updated.", type: "ok" });
      } else {
        await adminCreateUpcomingEvent(trimmedAdminKey, payload, upcomingImageFile || undefined);
        setNotice({ text: "Upcoming event created.", type: "ok" });
      }

      await refreshAllLists();
      resetUpcomingForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save upcoming event.";
      setNotice({ text: message, type: "error" });
    } finally {
      setIsSubmittingUpcoming(false);
    }
  }

  async function handleRecentUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingRecentUpdate) {
      return;
    }
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before saving.", type: "error" });
      return;
    }

    try {
      if (recentUpdateMedia.length === 0) {
        setNotice({ text: "Upload at least one photo or video for this recent update.", type: "error" });
        return;
      }
      if (recentUpdateMedia.some((item) => !item.file && !item.mediaUrl)) {
        setNotice({ text: "Each media item must be a selected file or existing URL.", type: "error" });
        return;
      }
      setIsSubmittingRecentUpdate(true);

      const payload = {
        title: recentUpdateForm.title,
        description: recentUpdateForm.description,
        date: recentUpdateForm.date,
        location: recentUpdateForm.location,
        mainMediaIndex: recentUpdateForm.mainMediaIndex,
        media: recentUpdateMedia.map((item) => ({
          type: item.type,
          mediaUrl: item.mediaUrl || undefined,
          file: item.file,
          caption: item.caption?.trim() || undefined
        }))
      };

      if (editingRecentUpdateId) {
        await adminUpdateRecentUpdate(trimmedAdminKey, editingRecentUpdateId, payload);
        setNotice({ text: "Recent update updated.", type: "ok" });
      } else {
        await adminCreateRecentUpdate(trimmedAdminKey, payload);
        setNotice({ text: "Recent update created.", type: "ok" });
      }

      await refreshRecentUpdatesList();
      resetRecentUpdateForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save recent update.";
      setNotice({ text: message, type: "error" });
    } finally {
      setIsSubmittingRecentUpdate(false);
    }
  }

  async function handleDeleteGallery() {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before deleting.", type: "error" });
      return;
    }
    if (!editingGalleryId) {
      setNotice({ text: "Select a gallery item first.", type: "error" });
      return;
    }

    try {
      const deleteId = editingGalleryId;
      await adminDeleteGalleryItem(trimmedAdminKey, deleteId);
      setGalleryItems((current) => current.filter((item) => item.id !== deleteId));
      setNotice({ text: "Gallery item deleted.", type: "ok" });
      await refreshAllLists();
      resetGalleryForm();
      navigateToSection("donation-gallery");
    } catch {
      setNotice({ text: "Failed to delete gallery item.", type: "error" });
    }
  }

  async function handleDeleteUpcoming() {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before deleting.", type: "error" });
      return;
    }
    if (!editingUpcomingId) {
      setNotice({ text: "Select an upcoming event first.", type: "error" });
      return;
    }

    try {
      await adminDeleteUpcomingEvent(trimmedAdminKey, editingUpcomingId);
      setNotice({ text: "Upcoming event deleted.", type: "ok" });
      await refreshAllLists();
      resetUpcomingForm();
    } catch {
      setNotice({ text: "Failed to delete upcoming event.", type: "error" });
    }
  }

  async function handleDeleteRecentUpdate() {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before deleting.", type: "error" });
      return;
    }
    if (!editingRecentUpdateId) {
      setNotice({ text: "Select a recent update first.", type: "error" });
      return;
    }

    try {
      await adminDeleteRecentUpdate(trimmedAdminKey, editingRecentUpdateId);
      setNotice({ text: "Recent update deleted.", type: "ok" });
      await refreshRecentUpdatesList();
      resetRecentUpdateForm();
    } catch {
      setNotice({ text: "Failed to delete recent update.", type: "error" });
    }
  }

  async function handleSendNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before sending.", type: "error" });
      console.error("[NEWSLETTER][ADMIN] Send blocked: missing admin key.");
      return;
    }

    const subject = newsletterForm.subject.trim();
    const body = newsletterForm.body.trim();
    if (!subject || !body) {
      setNotice({ text: "Subject and message are required.", type: "error" });
      console.error("[NEWSLETTER][ADMIN] Send blocked: missing subject or body.");
      return;
    }

    setIsSendingNewsletter(true);
    console.log(`[NEWSLETTER][ADMIN] Sending newsletter with subject: "${subject}"`);
    try {
      const response = await adminSendNewsletter(trimmedAdminKey, { subject, body });
      setNotice({ text: `Newsletter sent to ${response.recipientCount} subscribers.`, type: "ok" });
      setNewsletterForm(EMPTY_NEWSLETTER_FORM);
      console.log(
        `[NEWSLETTER][ADMIN] Newsletter send succeeded. recipients=${response.recipientCount}, campaignId=${response.campaign.id}`
      );
      await refreshNewsletterData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send newsletter.";
      setNotice({ text: message, type: "error" });
      console.error("[NEWSLETTER][ADMIN] Newsletter send failed.", error);
    } finally {
      setIsSendingNewsletter(false);
    }
  }

  async function handleRefreshNewsletter() {
    if (isRefreshingNewsletter) {
      return;
    }

    setIsRefreshingNewsletter(true);
    try {
      await refreshNewsletterData();
    } catch {
      setNotice({ text: "Unable to load newsletter records.", type: "error" });
    } finally {
      setIsRefreshingNewsletter(false);
    }
  }

  async function handleUpdateDonationStatus(
    donationId: string,
    status: "pending-review" | "approved" | "rejected"
  ) {
    const trimmedAdminKey = adminKey.trim();
    if (!trimmedAdminKey || !isAdminKeyVerified) {
      setNotice({ text: "Enter Admin Key before updating.", type: "error" });
      return;
    }

    setIsUpdatingDonationStatus(true);
    try {
      await adminUpdateDirectTransferStatus(trimmedAdminKey, donationId, status);
      setNotice({ text: "Donation transaction status updated.", type: "ok" });
      await refreshDonationTransactions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update donation status.";
      setNotice({ text: message, type: "error" });
    } finally {
      setIsUpdatingDonationStatus(false);
    }
  }

  const sidebarItems = useMemo(
    () => [
      { key: "dashboard" as const, label: "Dashboard", count: null },
      { key: "recent-updates" as const, label: "Recent Updates", count: recentUpdates.length },
      { key: "upcoming-events" as const, label: "Upcoming Events", count: upcomingEvents.length },
      { key: "donation-gallery" as const, label: "Donation Gallery", count: galleryItems.length },
      { key: "donations" as const, label: "Donations", count: donationTransactions.length },
      { key: "newsletter" as const, label: "Newsletter", count: newsletterSubscribers.length }
    ],
    [
      donationTransactions.length,
      galleryItems.length,
      newsletterSubscribers.length,
      recentUpdates.length,
      upcomingEvents.length
    ]
  );

  function navigateToSection(section: SectionKey) {
    window.location.hash = section;
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteTarget(target);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target || isDeletingRecord) return;

    setIsDeletingRecord(true);
    try {
      if (target === "gallery") {
        await handleDeleteGallery();
      } else if (target === "upcoming") {
        await handleDeleteUpcoming();
      } else {
        await handleDeleteRecentUpdate();
      }

      setDeleteTarget(null);
    } finally {
      setIsDeletingRecord(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      {!isAdminKeyVerified ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black text-femiBlue">Admin Key Required</h3>
            <p className="mt-2 text-sm text-slate-700">
              Enter your `ADMIN_KEY` before you can continue. It will be saved for this browser session.
            </p>
            <input
              value={adminKey}
              onChange={(event) => handleAdminKeyInputChange(event.target.value)}
              placeholder="Enter ADMIN_KEY"
              autoFocus
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {adminKeyError ? (
              <p className="mt-2 text-sm font-semibold text-red-700">{adminKeyError}</p>
            ) : null}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void verifyAdminKey()}
                disabled={!hasAdminKey || isVerifyingAdminKey}
                className="rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {isVerifyingAdminKey ? (
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isVerifyingAdminKey ? "Verifying..." : "Continue"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {notice ? (
        <div className="fixed right-4 top-4 z-[70] max-w-sm">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              notice.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{notice.text}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-xs font-bold opacity-70 hover:opacity-100"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black text-femiBlue">Confirm Delete</h3>
            <p className="mt-2 text-sm text-slate-700">
              {deleteTarget === "gallery"
                ? "Are you sure you want to delete this gallery item?"
                : deleteTarget === "upcoming"
                  ? "Are you sure you want to delete this upcoming event?"
                  : "Are you sure you want to delete this recent update?"}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingRecord}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingRecord}
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-femiRed px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="inline-flex items-center gap-2">
                  {isDeletingRecord ? (
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isDeletingRecord ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt="Femifunmi Charity" className="h-10 w-auto" />
            <div className="block">
              <p className="font-display text-lg font-black text-femiBlue">Femifunmi Backoffice</p>
              <p className="text-xs font-semibold text-femiRed">Admin Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:5173"
              className="hidden rounded-full bg-femiBlue px-4 py-2 text-sm font-bold text-white md:inline-flex"
            >
              Open Public Site
            </a>
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setIsMobileSidebarOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-xl font-bold md:hidden"
            >
              &#9776;
            </button>
          </div>
        </div>
      </header>

      <div className="mt-[73px] h-[calc(100vh-73px)] overflow-hidden">
        {isMobileSidebarOpen ? (
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-x-0 bottom-0 top-[73px] z-40 bg-slate-900/40"
            />
            <aside className="fixed bottom-0 left-0 top-[73px] z-50 w-56 max-w-[72vw] overflow-y-auto bg-slate-900 text-slate-100 shadow-2xl">
              <div className="w-full px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold">Navigation</p>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="rounded border border-slate-600 px-2 py-1 text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="grid gap-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigateToSection(item.key)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                        activeSection === item.key
                          ? "bg-femiBlue text-white"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.count !== null ? (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.count}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <a
                  href="http://localhost:5173"
                  className="mt-12 inline-flex w-full items-center justify-center rounded-full bg-femiBlue px-4 py-2 text-sm font-bold text-white md:hidden"
                >
                  Open Public Site
                </a>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex h-full gap-4 px-4 py-6 md:gap-0 md:px-0 md:py-0">
          <aside className="hidden h-full w-72 shrink-0 overflow-y-auto bg-slate-900 p-4 text-slate-100 md:block">
            <div className="grid gap-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateToSection(item.key)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    activeSection === item.key ? "bg-femiBlue text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== null ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Page</p>
              <h1 className="text-2xl font-black text-femiBlue">{SECTION_LABEL[activeSection]}</h1>
            </section>

            {isLoading ? <p className="rounded-xl bg-white p-4">Loading records...</p> : null}

            {activeSection === "dashboard" ? (
              <DashboardSection
                adminKey={adminKey}
                setAdminKey={handleAdminKeyInputChange}
                recentUpdatesCount={recentUpdates.length}
                upcomingEventsCount={upcomingEvents.length}
                galleryItemsCount={galleryItems.length}
                donationTransactionsCount={donationTransactions.length}
                newsletterSubscribersCount={newsletterSubscribers.length}
                navigateToSection={navigateToSection}
              />
            ) : null}

            {activeSection === "donations" ? (
              <DonationsTransactionsSection
                transactions={donationTransactions}
                isUpdatingStatus={isUpdatingDonationStatus}
                onUpdateStatus={handleUpdateDonationStatus}
              />
            ) : null}

            {activeSection === "donation-gallery" ? (
              <DonationGalleryListSection
                galleryItems={galleryItems}
                selectedGalleryId={selectedGalleryId}
                selectGalleryItem={openEditGalleryPage}
                onCreateGallery={openCreateGalleryPage}
              />
            ) : null}

            {activeSection === "upcoming-events" ? (
              <UpcomingEventsSection
                upcomingEvents={upcomingEvents}
                selectedUpcomingId={selectedUpcomingId}
                selectUpcomingEvent={openEditUpcomingEventPage}
                onCreateUpcomingEvent={openCreateUpcomingEventPage}
              />
            ) : null}

            {activeSection === "recent-updates" ? (
              <RecentUpdatesSection
                recentUpdates={recentUpdates}
                selectedRecentUpdateId={selectedRecentUpdateId}
                selectRecentUpdate={openEditRecentUpdatePage}
                onCreateRecentUpdate={openCreateRecentUpdatePage}
              />
            ) : null}

            {activeSection === "create-gallery-item" ? (
              <CreateGalleryItemSection
                resetGalleryForm={resetGalleryForm}
                handleGallerySubmit={handleGallerySubmit}
                editingGalleryId={editingGalleryId}
                isSubmittingGallery={isSubmittingGallery}
                galleryForm={galleryForm}
                setGalleryForm={setGalleryForm}
                galleryPreviewUrl={galleryPreviewUrl}
                onSelectGalleryMedia={onSelectGalleryMedia}
                galleryExtraMedia={galleryExtraMedia}
                uploadGalleryExtraMedia={uploadGalleryExtraMedia}
                removeGalleryExtraMedia={removeGalleryExtraMedia}
                handleDeleteGallery={() => requestDelete("gallery")}
                onBackToList={() => navigateToSection("donation-gallery")}
              />
            ) : null}

            {activeSection === "create-upcoming-event" ? (
              <CreateUpcomingEventSection
                resetUpcomingForm={resetUpcomingForm}
                handleUpcomingSubmit={handleUpcomingSubmit}
                editingUpcomingId={editingUpcomingId}
                isSubmittingUpcoming={isSubmittingUpcoming}
                upcomingForm={upcomingForm}
                setUpcomingForm={setUpcomingForm}
                upcomingPreviewUrl={upcomingPreviewUrl}
                onSelectUpcomingImage={onSelectUpcomingImage}
                handleDeleteUpcoming={() => requestDelete("upcoming")}
                onBackToList={() => navigateToSection("upcoming-events")}
              />
            ) : null}

            {activeSection === "create-recent-update-item" ? (
              <CreateRecentUpdateItemSection
                resetRecentUpdateForm={resetRecentUpdateForm}
                handleRecentUpdateSubmit={handleRecentUpdateSubmit}
                editingRecentUpdateId={editingRecentUpdateId}
                isSubmittingRecentUpdate={isSubmittingRecentUpdate}
                recentUpdateForm={recentUpdateForm}
                setRecentUpdateForm={setRecentUpdateForm}
                uploadRecentUpdateMedia={uploadRecentUpdateMedia}
                recentUpdateMedia={recentUpdateMedia}
                updateRecentMediaCaption={updateRecentMediaCaption}
                removeRecentMedia={removeRecentMedia}
                handleDeleteRecentUpdate={() => requestDelete("recent-update")}
                onBackToList={() => navigateToSection("recent-updates")}
              />
            ) : null}

            {activeSection === "newsletter" ? (
              <NewsletterSection
                subscribers={newsletterSubscribers}
                campaigns={newsletterCampaigns}
                newsletterForm={newsletterForm}
                setNewsletterForm={setNewsletterForm}
                onSubmit={handleSendNewsletter}
                isSending={isSendingNewsletter}
                isRefreshing={isRefreshingNewsletter}
                onRefresh={() => void handleRefreshNewsletter()}
              />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
