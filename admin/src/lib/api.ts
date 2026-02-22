export type DonationContent = {
  introText: string;
  missionText: string;
  paymentHeading: string;
  paymentDescription: string;
  onlinePlatformLabel: string;
  onlinePlatformUrl: string;
  bankTransferDetails: string[];
};

export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  donateeName?: string;
  title: string;
  description?: string;
  location: string;
  address: string;
  date: string;
  mediaUrl: string;
  priorityplacement?: boolean;
  extraMedia?: Array<{
    id: string;
    type: "photo" | "video";
    mediaUrl: string;
  }>;
};

export type RecentUpdateMediaInput = {
  type: "photo" | "video";
  mediaUrl: string;
  caption?: string;
};

export type RecentUpdateMedia = RecentUpdateMediaInput & {
  id: string;
};

export type RecentUpdate = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  mainMediaId: string;
  media: RecentUpdateMedia[];
};

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  dateIso: string;
  location: string;
  imageUrl: string;
  priorityplacement?: boolean;
};

export type DonationTransactionPaymentMethod = "paystack" | "direct-transfer";

export type DonationTransactionStatus =
  | "pending"
  | "pending-review"
  | "approved"
  | "rejected"
  | "success"
  | "failed";

export type DonationTransaction = {
  id: string;
  donationGalleryItemId: string;
  donationTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCountryCode: string;
  mobile: string;
  paymentMethod: DonationTransactionPaymentMethod;
  transactionStatus: DonationTransactionStatus;
  proofImageUrl?: string;
  paystackReference?: string;
  amountNaira?: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMediaUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
};

export type GalleryExtraMediaUploadInput = {
  type: "photo" | "video";
  file: File;
};

export type NewsletterSubscriber = {
  id: string;
  firstName: string;
  email: string;
  consentGiven: boolean;
  isActive: boolean;
  createdAt: string;
  unsubscribedAt?: string;
  source?: string;
};

export type NewsletterCampaign = {
  id: string;
  subject: string;
  body: string;
  recipientCount: number;
  sentAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const raw = await response.text();
    let message = raw || "Request failed";

    try {
      const parsed = JSON.parse(raw) as {
        message?: string;
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
      if (parsed?.message) {
        message = parsed.message;
      } else if (parsed?.fieldErrors || parsed?.formErrors) {
        const fieldErrorMessages = Object.entries(parsed.fieldErrors || {})
          .flatMap(([field, errors]) => (errors || []).map((entry) => `${field}: ${entry}`))
          .filter(Boolean);
        const formErrorMessages = (parsed.formErrors || []).filter(Boolean);
        const merged = [...fieldErrorMessages, ...formErrorMessages];
        if (merged.length > 0) {
          message = merged.join(" | ");
        } else {
          message = "Validation failed. Please check your input.";
        }
      }
    } catch {
      // keep plain text fallback
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function adminRequest<T>(
  adminKey: string,
  path: string,
  method: "POST" | "PUT" | "DELETE",
  payload?: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined
  });

  return parseResponse<T>(response);
}

async function adminMultipartRequest<T>(
  adminKey: string,
  path: string,
  method: "POST" | "PUT",
  formData: FormData
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "x-admin-key": adminKey
    },
    body: formData
  });

  return parseResponse<T>(response);
}

export async function getDonationContent(): Promise<DonationContent> {
  const response = await fetch(`${API_BASE_URL}/api/donation-content`);
  return parseResponse<DonationContent>(response);
}

export async function adminUpdateDonationContent(
  adminKey: string,
  payload: DonationContent
): Promise<DonationContent> {
  return adminRequest<DonationContent>(adminKey, "/api/donation-content", "PUT", payload);
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/gallery`);
  return parseResponse<GalleryItem[]>(response);
}

export async function getGalleryItemById(id: string): Promise<GalleryItem> {
  const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`);
  return parseResponse<GalleryItem>(response);
}

export async function adminCreateGalleryItem(
  adminKey: string,
  payload: Omit<GalleryItem, "id">,
  mediaFile?: File,
  extraMediaFiles: GalleryExtraMediaUploadInput[] = []
): Promise<GalleryItem> {
  const formData = new FormData();
  formData.append("type", payload.type);
  formData.append("donateeName", payload.donateeName || "");
  formData.append("title", payload.title);
  formData.append("description", payload.description || "");
  formData.append("location", payload.location);
  formData.append("address", payload.address);
  formData.append("date", payload.date);
  formData.append("priorityplacement", String(Boolean(payload.priorityplacement)));
  formData.append("extraMediaJson", JSON.stringify(payload.extraMedia || []));
  if (payload.mediaUrl) {
    formData.append("mediaUrl", payload.mediaUrl);
  }
  if (mediaFile) {
    formData.append("media", mediaFile);
  }
  for (const item of extraMediaFiles) {
    formData.append("extraMediaFiles", item.file);
    formData.append("extraMediaFileTypes", item.type);
  }

  return adminMultipartRequest<GalleryItem>(adminKey, "/api/gallery", "POST", formData);
}

export async function adminUpdateGalleryItem(
  adminKey: string,
  id: string,
  payload: Omit<GalleryItem, "id">,
  mediaFile?: File,
  extraMediaFiles: GalleryExtraMediaUploadInput[] = []
): Promise<GalleryItem> {
  const formData = new FormData();
  formData.append("type", payload.type);
  formData.append("donateeName", payload.donateeName || "");
  formData.append("title", payload.title);
  formData.append("description", payload.description || "");
  formData.append("location", payload.location);
  formData.append("address", payload.address);
  formData.append("date", payload.date);
  formData.append("priorityplacement", String(Boolean(payload.priorityplacement)));
  formData.append("extraMediaJson", JSON.stringify(payload.extraMedia || []));
  if (payload.mediaUrl) {
    formData.append("mediaUrl", payload.mediaUrl);
  }
  if (mediaFile) {
    formData.append("media", mediaFile);
  }
  for (const item of extraMediaFiles) {
    formData.append("extraMediaFiles", item.file);
    formData.append("extraMediaFileTypes", item.type);
  }

  return adminMultipartRequest<GalleryItem>(adminKey, `/api/gallery/${id}`, "PUT", formData);
}

export async function adminDeleteGalleryItem(adminKey: string, id: string): Promise<{ ok: true }> {
  return adminRequest<{ ok: true }>(adminKey, `/api/gallery/${id}`, "DELETE");
}

export async function getRecentUpdates(): Promise<RecentUpdate[]> {
  const response = await fetch(`${API_BASE_URL}/api/recent-updates`);
  return parseResponse<RecentUpdate[]>(response);
}

export async function getRecentUpdateById(id: string): Promise<RecentUpdate> {
  const response = await fetch(`${API_BASE_URL}/api/recent-updates/${id}`);
  return parseResponse<RecentUpdate>(response);
}

export type RecentUpdatePayload = {
  title: string;
  description: string;
  date: string;
  location: string;
  mainMediaIndex?: number;
  media: Array<{
    type: "photo" | "video";
    caption?: string;
    mediaUrl?: string;
    file?: File;
  }>;
};

export async function adminCreateRecentUpdate(
  adminKey: string,
  payload: RecentUpdatePayload
): Promise<RecentUpdate> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("date", payload.date);
  formData.append("location", payload.location);
  formData.append("mainMediaIndex", String(payload.mainMediaIndex ?? 0));

  const mediaDescriptors: Array<
    | { source: "url"; type: "photo" | "video"; mediaUrl: string; caption?: string }
    | { source: "file"; type: "photo" | "video"; fileIndex: number; caption?: string }
  > = [];

  let fileIndex = 0;
  payload.media.forEach((item) => {
    if (item.file) {
      formData.append("mediaFiles", item.file);
      mediaDescriptors.push({
        source: "file",
        type: item.type,
        fileIndex,
        caption: item.caption
      });
      fileIndex += 1;
      return;
    }

    if (item.mediaUrl) {
      mediaDescriptors.push({
        source: "url",
        type: item.type,
        mediaUrl: item.mediaUrl,
        caption: item.caption
      });
    }
  });

  formData.append("mediaDescriptorsJson", JSON.stringify(mediaDescriptors));
  return adminMultipartRequest<RecentUpdate>(adminKey, "/api/recent-updates", "POST", formData);
}

export async function adminUpdateRecentUpdate(
  adminKey: string,
  id: string,
  payload: RecentUpdatePayload
): Promise<RecentUpdate> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("date", payload.date);
  formData.append("location", payload.location);
  formData.append("mainMediaIndex", String(payload.mainMediaIndex ?? 0));

  const mediaDescriptors: Array<
    | { source: "url"; type: "photo" | "video"; mediaUrl: string; caption?: string }
    | { source: "file"; type: "photo" | "video"; fileIndex: number; caption?: string }
  > = [];

  let fileIndex = 0;
  payload.media.forEach((item) => {
    if (item.file) {
      formData.append("mediaFiles", item.file);
      mediaDescriptors.push({
        source: "file",
        type: item.type,
        fileIndex,
        caption: item.caption
      });
      fileIndex += 1;
      return;
    }

    if (item.mediaUrl) {
      mediaDescriptors.push({
        source: "url",
        type: item.type,
        mediaUrl: item.mediaUrl,
        caption: item.caption
      });
    }
  });

  formData.append("mediaDescriptorsJson", JSON.stringify(mediaDescriptors));
  return adminMultipartRequest<RecentUpdate>(adminKey, `/api/recent-updates/${id}`, "PUT", formData);
}

export async function adminDeleteRecentUpdate(adminKey: string, id: string): Promise<{ ok: true }> {
  return adminRequest<{ ok: true }>(adminKey, `/api/recent-updates/${id}`, "DELETE");
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/upcoming-events`);
  return parseResponse<UpcomingEvent[]>(response);
}

export async function getUpcomingEventById(id: string): Promise<UpcomingEvent> {
  const response = await fetch(`${API_BASE_URL}/api/upcoming-events/${id}`);
  return parseResponse<UpcomingEvent>(response);
}

export type UpcomingEventPayload = Omit<UpcomingEvent, "id">;
export type UpcomingEventUpsertPayload = Omit<UpcomingEvent, "id" | "imageUrl">;

export async function adminCreateUpcomingEvent(
  adminKey: string,
  payload: UpcomingEventUpsertPayload,
  imageFile?: File
): Promise<UpcomingEvent> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("dateIso", payload.dateIso);
  formData.append("location", payload.location);
  formData.append("priorityplacement", String(Boolean(payload.priorityplacement)));
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return adminMultipartRequest<UpcomingEvent>(adminKey, "/api/upcoming-events", "POST", formData);
}

export async function adminUpdateUpcomingEvent(
  adminKey: string,
  id: string,
  payload: UpcomingEventUpsertPayload,
  imageFile?: File
): Promise<UpcomingEvent> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("dateIso", payload.dateIso);
  formData.append("location", payload.location);
  formData.append("priorityplacement", String(Boolean(payload.priorityplacement)));
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return adminMultipartRequest<UpcomingEvent>(adminKey, `/api/upcoming-events/${id}`, "PUT", formData);
}

export async function adminDeleteUpcomingEvent(adminKey: string, id: string): Promise<{ ok: true }> {
  return adminRequest<{ ok: true }>(adminKey, `/api/upcoming-events/${id}`, "DELETE");
}

export async function getDonationTransactions(adminKey: string): Promise<DonationTransaction[]> {
  const response = await fetch(`${API_BASE_URL}/api/donations`, {
    headers: {
      "x-admin-key": adminKey
    }
  });
  return parseResponse<DonationTransaction[]>(response);
}

export async function adminUpdateDirectTransferStatus(
  adminKey: string,
  donationId: string,
  status: "pending-review" | "approved" | "rejected"
): Promise<DonationTransaction> {
  const response = await fetch(`${API_BASE_URL}/api/donations/${donationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey
    },
    body: JSON.stringify({ transactionStatus: status })
  });
  return parseResponse<DonationTransaction>(response);
}

export async function adminUploadMedia(
  adminKey: string,
  file: File,
  options?: { folder?: string; resourceType?: "auto" | "image" | "video" }
): Promise<AdminMediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  if (options?.resourceType) {
    formData.append("resourceType", options.resourceType);
  }

  const response = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    headers: {
      "x-admin-key": adminKey
    },
    body: formData
  });

  return parseResponse<AdminMediaUploadResult>(response);
}

export async function getNewsletterSubscribers(adminKey: string): Promise<NewsletterSubscriber[]> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribers`, {
    headers: {
      "x-admin-key": adminKey
    }
  });

  return parseResponse<NewsletterSubscriber[]>(response);
}

export async function getNewsletterCampaigns(adminKey: string): Promise<NewsletterCampaign[]> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter/campaigns`, {
    headers: {
      "x-admin-key": adminKey
    }
  });

  return parseResponse<NewsletterCampaign[]>(response);
}

export async function adminSendNewsletter(
  adminKey: string,
  payload: { subject: string; body: string }
): Promise<{ ok: true; recipientCount: number; campaign: NewsletterCampaign }> {
  return adminRequest<{ ok: true; recipientCount: number; campaign: NewsletterCampaign }>(
    adminKey,
    "/api/newsletter/send",
    "POST",
    payload
  );
}

export async function adminValidateKey(adminKey: string): Promise<{ ok: true }> {
  await getNewsletterSubscribers(adminKey);
  return { ok: true };
}
