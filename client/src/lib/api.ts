export type DonationCase = {
  id: string;
  title: string;
  beneficiary: string;
  description: string;
  targetAmount?: string;
  mediaType?: "photo" | "video";
  mediaUrl?: string;
  status: "open" | "closed";
};

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

export type RecentUpdateMedia = {
  id: string;
  type: "photo" | "video";
  mediaUrl: string;
  caption?: string;
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

export type NewsletterSubscribeResponse = {
  ok: true;
  alreadySubscribed: boolean;
};

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
  paymentMethod: "paystack" | "direct-transfer";
  transactionStatus: "pending" | "pending-review" | "approved" | "rejected" | "success" | "failed";
  proofImageUrl?: string;
  paystackReference?: string;
  amountNaira?: number;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
}

export async function getDonationCases(): Promise<DonationCase[]> {
  const response = await fetch(`${API_BASE_URL}/api/cases`);
  return parseResponse<DonationCase[]>(response);
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/gallery`);
  return parseResponse<GalleryItem[]>(response);
}

export async function getGalleryItemById(id: string): Promise<GalleryItem> {
  const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`);
  return parseResponse<GalleryItem>(response);
}

export async function getDonationContent(): Promise<DonationContent> {
  const response = await fetch(`${API_BASE_URL}/api/donation-content`);
  return parseResponse<DonationContent>(response);
}

export async function getRecentUpdates(): Promise<RecentUpdate[]> {
  const response = await fetch(`${API_BASE_URL}/api/recent-updates`);
  return parseResponse<RecentUpdate[]>(response);
}

export async function getRecentUpdateById(id: string): Promise<RecentUpdate> {
  const response = await fetch(`${API_BASE_URL}/api/recent-updates/${id}`);
  return parseResponse<RecentUpdate>(response);
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/upcoming-events`);
  return parseResponse<UpcomingEvent[]>(response);
}

export async function sendContactMessage(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
}): Promise<{ ok: true }> {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse<{ ok: true }>(response);
}

export async function subscribeToNewsletter(payload: {
  firstName: string;
  email: string;
  consentGiven: true;
  source?: string;
}): Promise<NewsletterSubscribeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse<NewsletterSubscribeResponse>(response);
}

export async function createDonationTransaction(payload: {
  donationGalleryItemId: string;
  donationTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCountryCode: string;
  mobile: string;
  paymentMethod: "paystack" | "direct-transfer";
  paystackReference?: string;
  amountNaira?: number;
  proofImageFile?: File;
}): Promise<DonationTransaction> {
  const formData = new FormData();
  formData.append("donationGalleryItemId", payload.donationGalleryItemId);
  formData.append("donationTitle", payload.donationTitle);
  formData.append("firstName", payload.firstName);
  formData.append("lastName", payload.lastName);
  formData.append("email", payload.email);
  formData.append("country", payload.country);
  formData.append("phoneCountryCode", payload.phoneCountryCode);
  formData.append("mobile", payload.mobile);
  formData.append("paymentMethod", payload.paymentMethod);
  if (payload.paystackReference) {
    formData.append("paystackReference", payload.paystackReference);
  }
  if (typeof payload.amountNaira === "number") {
    formData.append("amountNaira", String(payload.amountNaira));
  }
  if (payload.proofImageFile) {
    formData.append("proofImage", payload.proofImageFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/donations`, {
    method: "POST",
    body: formData
  });
  return parseResponse<DonationTransaction>(response);
}

export async function adminCreateCase(
  adminKey: string,
  payload: Omit<DonationCase, "id">
): Promise<DonationCase> {
  const response = await fetch(`${API_BASE_URL}/api/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<DonationCase>(response);
}

export async function adminCreateGalleryItem(
  adminKey: string,
  payload: Omit<GalleryItem, "id">
): Promise<GalleryItem> {
  const response = await fetch(`${API_BASE_URL}/api/gallery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<GalleryItem>(response);
}

export async function adminCreateRecentUpdate(
  adminKey: string,
  payload: {
    title: string;
    description: string;
    date: string;
    location: string;
    mainMediaIndex?: number;
    media: Array<{
      type: "photo" | "video";
      mediaUrl: string;
      caption?: string;
    }>;
  }
): Promise<RecentUpdate> {
  const response = await fetch(`${API_BASE_URL}/api/recent-updates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<RecentUpdate>(response);
}
