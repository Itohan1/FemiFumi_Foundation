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

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
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

export type DataStore = {
  donationCases: DonationCase[];
  donationContent: DonationContent;
  donationTransactions: DonationTransaction[];
  galleryItems: GalleryItem[];
  recentUpdates: RecentUpdate[];
  upcomingEvents: UpcomingEvent[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  newsletterCampaigns: NewsletterCampaign[];
};
