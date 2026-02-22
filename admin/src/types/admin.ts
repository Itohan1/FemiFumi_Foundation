import { RecentUpdateMediaInput } from "../lib/api";

export type Notice = { text: string; type: "ok" | "error" } | null;

export type SectionKey =
  | "dashboard"
  | "recent-updates"
  | "upcoming-events"
  | "donation-gallery"
  | "donations"
  | "newsletter"
  | "create-recent-update-item"
  | "create-upcoming-event"
  | "create-gallery-item";

export type GalleryFormState = {
  type: "photo" | "video";
  donateeName: string;
  title: string;
  description: string;
  location: string;
  address: string;
  date: string;
  priorityplacement: boolean;
  mediaUrl: string;
};

export type GalleryExtraMediaFormItem = {
  id?: string;
  type: "photo" | "video";
  mediaUrl: string;
  file?: File;
  previewUrl?: string;
  isUploading?: boolean;
  uploadError?: boolean;
};

export type UpcomingEventFormState = {
  title: string;
  description: string;
  dateIso: string;
  location: string;
  priorityplacement: boolean;
};

export type RecentUpdateFormState = {
  title: string;
  description: string;
  date: string;
  location: string;
  mainMediaIndex: number;
};

export type RecentUpdateMediaFormItem = RecentUpdateMediaInput & {
  file?: File;
  previewUrl?: string;
  isUploading?: boolean;
  uploadError?: boolean;
};

export type NewsletterFormState = {
  subject: string;
  body: string;
};
