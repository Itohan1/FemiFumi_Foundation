import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import multer from "multer";
import { z } from "zod";
import { uploadMediaBuffer } from "./cloudinary.js";
import {
  createRecentUpdateRecord,
  deleteRecentUpdateRecord,
  getRecentUpdateById as getRecentUpdateRecordById,
  listRecentUpdates,
  loadStore,
  saveStore,
  updateRecentUpdateRecord
} from "./store.js";
import {
  ContactMessage,
  DonationCase,
  DonationTransaction,
  DonationTransactionPaymentMethod,
  DonationTransactionStatus,
  DonationContent,
  GalleryItem,
  NewsletterCampaign,
  NewsletterSubscriber,
  RecentUpdate,
  UpcomingEvent
} from "./types.js";

const app = express();

const port = Number(process.env.PORT || 4000);
const adminKey = process.env.ADMIN_KEY || "change-this-admin-key";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:5174";
const allowedOrigins = new Set([clientOrigin, adminOrigin]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      try {
        const parsed = new URL(origin);
        const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        if (isLocalHost) {
          callback(null, true);
          return;
        }
      } catch {
        // Fall through to CORS rejection below.
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

const galleryUpload = upload.fields([
  { name: "media", maxCount: 1 },
  { name: "extraMediaFiles", maxCount: 24 }
]);

const recentUpdateUpload = upload.array("mediaFiles", 24);
const donationUpload = upload.single("proofImage");

function unauthorized(res: express.Response) {
  return res.status(401).send("Unauthorized");
}

function assertAdmin(req: express.Request, res: express.Response): boolean {
  const key = req.header("x-admin-key");

  if (!key || key !== adminKey) {
    unauthorized(res);
    return false;
  }

  return true;
}

function parseDateInput(value: string): Date | null {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const localDate = new Date(year, month - 1, day);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDateTodayOrFuture(value: string): boolean {
  const selectedDate = parseDateInput(value);
  if (!selectedDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  return selectedDate.getTime() >= today.getTime();
}

const donationCaseSchema = z.object({
  title: z.string().min(3),
  beneficiary: z.string().min(2),
  description: z.string().min(10),
  targetAmount: z.string().optional(),
  mediaType: z.enum(["photo", "video"]).optional(),
  mediaUrl: z.string().url().optional(),
  status: z.enum(["open", "closed"])
});

const donationContentSchema = z.object({
  introText: z.string().min(10),
  missionText: z.string().min(10),
  paymentHeading: z.string().min(3),
  paymentDescription: z.string().min(10),
  onlinePlatformLabel: z.string().min(2),
  onlinePlatformUrl: z.string().url(),
  bankTransferDetails: z.array(z.string().min(3)).min(1)
});

const multipartBooleanSchema = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "on") return true;
    if (normalized === "false" || normalized === "0" || normalized === "off" || normalized === "") return false;
  }
  return false;
}, z.boolean());

const gallerySchema = z.object({
  type: z.enum(["photo", "video"]),
  donateeName: z.string().min(2).optional(),
  title: z.string().min(2),
  description: z.string().min(10).optional(),
  location: z.string().min(2),
  address: z.string().min(2),
  date: z.string().min(2).refine(isDateTodayOrFuture, "Gallery date cannot be in the past."),
  mediaUrl: z.string().url().optional(),
  priorityplacement: multipartBooleanSchema,
  extraMediaJson: z.string().optional()
});

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(6),
  message: z.string().min(10)
});

const newsletterSubscribeSchema = z.object({
  firstName: z.string().min(2),
  email: z.string().email(),
  consentGiven: z.literal(true),
  source: z.string().min(2).optional()
});

const newsletterUnsubscribeSchema = z.object({
  email: z.string().email()
});

const newsletterSendSchema = z.object({
  subject: z.string().min(3),
  body: z.string().min(10)
});

const recentUpdateMultipartBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string().min(2).refine(isDateTodayOrFuture, "Recent update date cannot be in the past."),
  location: z.string().min(2),
  mainMediaIndex: z.coerce.number().int().nonnegative().optional(),
  mediaDescriptorsJson: z.string().min(2)
});

const recentUpdateMediaDescriptorSchema = z.object({
  source: z.enum(["file", "url"]),
  type: z.enum(["photo", "video"]),
  fileIndex: z.number().int().nonnegative().optional(),
  mediaUrl: z.string().url().optional(),
  caption: z.string().min(2).optional()
});

const upcomingEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  dateIso: z
    .string()
    .datetime({ offset: true })
    .refine((value) => new Date(value).getTime() >= Date.now(), "Upcoming event date cannot be in the past."),
  location: z.string().min(2),
  priorityplacement: multipartBooleanSchema
});

const donationCreateSchema = z.object({
  donationGalleryItemId: z.string().min(2),
  donationTitle: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  phoneCountryCode: z.string().min(1),
  mobile: z.string().min(6),
  paymentMethod: z.enum(["paystack", "direct-transfer"]),
  paystackReference: z.string().min(2).optional(),
  amountNaira: z.coerce.number().int().positive().optional()
});

const donationStatusUpdateSchema = z.object({
  transactionStatus: z.enum(["pending-review", "approved", "rejected"])
});

const uploadBodySchema = z.object({
  folder: z.string().min(1).optional(),
  resourceType: z.enum(["auto", "image", "video"]).optional()
});

type AsyncHandler = (req: express.Request, res: express.Response) => Promise<unknown>;

function asyncRoute(handler: AsyncHandler): express.RequestHandler {
  return (req, res, next) => {
    void handler(req, res).catch(next);
  };
}

function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function deliverNewsletterBatch(payload: {
  subject: string;
  body: string;
  recipients: NewsletterSubscriber[];
}): Promise<void> {
  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log(
      `[NEWSLETTER][SERVER] NEWSLETTER_WEBHOOK_URL not set. Skipping external delivery for ${payload.recipients.length} recipient(s).`
    );
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Newsletter delivery provider returned an error.");
  }
}

async function buildRecentUpdateMediaFromMultipart(payload: {
  descriptorsJson: string;
  files: Express.Multer.File[];
}): Promise<
  Array<{
    type: "photo" | "video";
    mediaUrl: string;
    caption?: string;
  }>
> {
  let parsedDescriptors: unknown;
  try {
    parsedDescriptors = JSON.parse(payload.descriptorsJson);
  } catch {
    throw new Error("Invalid recent update media payload.");
  }

  const descriptors = z.array(recentUpdateMediaDescriptorSchema).min(1).parse(parsedDescriptors);
  const uploadedByIndex: Array<{ secureUrl: string } | undefined> = new Array(payload.files.length).fill(undefined);
  const uploadConcurrency = Math.max(
    1,
    Math.floor(Number(process.env.RECENT_UPDATE_UPLOAD_CONCURRENCY || 4)) || 4
  );

  async function uploadSingleFile(file: Express.Multer.File, fileIndex: number) {
    try {
      const matched = descriptors.find((item) => item.source === "file" && item.fileIndex === fileIndex);
      const resourceType = matched?.type === "video" || file.mimetype.startsWith("video/") ? "video" : "image";
      const uploaded = await uploadMediaBuffer(file.buffer, {
        folder: "femifunmi-foundation/recent-updates",
        resourceType
      });
      uploadedByIndex[fileIndex] = { secureUrl: uploaded.secureUrl };
    } catch (error) {
      const details = error instanceof Error ? error.message : "Cloudinary upload failed.";
      const fileName = file.originalname || `file-${fileIndex + 1}`;
      throw new Error(`Recent update media upload failed for "${fileName}": ${details}`);
    }
  }

  for (let index = 0; index < payload.files.length; index += uploadConcurrency) {
    const batch = payload.files.slice(index, index + uploadConcurrency);
    await Promise.all(
      batch.map(async (file, batchIndex) => {
        const fileIndex = index + batchIndex;
        await uploadSingleFile(file, fileIndex);
      })
    );
  }

  return descriptors.map((item) => {
    if (item.source === "url") {
      if (!item.mediaUrl) {
        throw new Error("Recent update media URL is required.");
      }
      return {
        type: item.type,
        mediaUrl: item.mediaUrl,
        caption: item.caption
      };
    }

    if (item.fileIndex === undefined) {
      throw new Error("Recent update media file index is required.");
    }

    const uploaded = uploadedByIndex[item.fileIndex];
    if (!uploaded) {
      throw new Error("Recent update media upload failed.");
    }

    return {
      type: item.type,
      mediaUrl: uploaded.secureUrl,
      caption: item.caption
    };
  });
}

function normalizeRecentUpdate(record: Record<string, unknown>): RecentUpdate {
  const media = (record.media as RecentUpdate["media"]) || [];
  const fallbackDescription =
    typeof record.description === "string"
      ? record.description
      : typeof record.fullDescription === "string"
        ? record.fullDescription
        : typeof record.shortDescription === "string"
          ? record.shortDescription
          : "";

  return {
    id: String(record.id || ""),
    title: String(record.title || ""),
    description: fallbackDescription,
    date: String(record.date || ""),
    location: String(record.location || ""),
    mainMediaId: String(record.mainMediaId || media[0]?.id || ""),
    media
  };
}

function normalizeUpcomingEvent(record: Record<string, unknown>): UpcomingEvent {
  const fallbackDescription =
    typeof record.description === "string"
      ? record.description
      : typeof record.fullDescription === "string"
        ? record.fullDescription
        : typeof record.shortDescription === "string"
          ? record.shortDescription
          : "";

  return {
    id: String(record.id || ""),
    title: String(record.title || ""),
    description: fallbackDescription,
    dateIso: String(record.dateIso || ""),
    location: String(record.location || ""),
    imageUrl: String(record.imageUrl || ""),
    priorityplacement: Boolean(record.priorityplacement)
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/uploads", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  upload.single("file")(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const parsed = uploadBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const folder = parsed.data.folder || "femifunmi-foundation";
    const resourceType = parsed.data.resourceType || "auto";

    try {
      const result = await uploadMediaBuffer(req.file.buffer, { folder, resourceType });
      return res.status(201).json(result);
    } catch (uploadError) {
      return next(uploadError);
    }
  });
});

app.get(
  "/api/cases",
  asyncRoute(async (_req, res) => {
    const store = await loadStore();
    res.json(store.donationCases);
  })
);

app.post(
  "/api/cases",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const parsed = donationCaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const newCase: DonationCase = {
      id: createId("case"),
      ...parsed.data
    };

    store.donationCases.unshift(newCase);
    await saveStore(store);

    return res.status(201).json(newCase);
  })
);

app.get(
  "/api/donation-content",
  asyncRoute(async (_req, res) => {
    const store = await loadStore();
    res.json(store.donationContent);
  })
);

app.put(
  "/api/donation-content",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const parsed = donationContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const updatedContent: DonationContent = parsed.data;
    store.donationContent = updatedContent;
    await saveStore(store);

    return res.json(updatedContent);
  })
);

app.post("/api/donations", (req, res, next) => {
  donationUpload(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = donationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      let proofImageUrl: string | undefined;
      if (parsed.data.paymentMethod === "direct-transfer") {
        if (!req.file) {
          return res.status(400).json({ message: "Payment confirmation screenshot is required." });
        }
        const uploaded = await uploadMediaBuffer(req.file.buffer, {
          folder: "femifunmi-foundation/donation-proofs",
          resourceType: "image"
        });
        proofImageUrl = uploaded.secureUrl;
      }

      const store = await loadStore();
      const now = new Date().toISOString();
      const donation: DonationTransaction = {
        id: createId("donation"),
        donationGalleryItemId: parsed.data.donationGalleryItemId,
        donationTitle: parsed.data.donationTitle,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: normalizeEmail(parsed.data.email),
        country: parsed.data.country,
        phoneCountryCode: parsed.data.phoneCountryCode,
        mobile: parsed.data.mobile,
        paymentMethod: parsed.data.paymentMethod as DonationTransactionPaymentMethod,
        transactionStatus:
          parsed.data.paymentMethod === "direct-transfer"
            ? ("pending-review" as DonationTransactionStatus)
            : ("pending" as DonationTransactionStatus),
        proofImageUrl,
        paystackReference: parsed.data.paystackReference,
        amountNaira: parsed.data.amountNaira,
        createdAt: now,
        updatedAt: now
      };

      store.donationTransactions.unshift(donation);
      await saveStore(store);
      return res.status(201).json(donation);
    } catch (error) {
      return next(error);
    }
  });
});

app.get(
  "/api/donations",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;
    const store = await loadStore();
    return res.json(store.donationTransactions);
  })
);

app.patch(
  "/api/donations/:id/status",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const parsed = donationStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const index = store.donationTransactions.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).send("Donation transaction not found");
    }

    const record = store.donationTransactions[index];
    if (record.paymentMethod !== "direct-transfer") {
      return res
        .status(400)
        .json({ message: "Only direct transfer transactions can be updated manually." });
    }

    const updated: DonationTransaction = {
      ...record,
      transactionStatus: parsed.data.transactionStatus,
      updatedAt: new Date().toISOString()
    };
    store.donationTransactions[index] = updated;
    await saveStore(store);
    return res.json(updated);
  })
);

app.get(
  "/api/gallery",
  asyncRoute(async (_req, res) => {
    const store = await loadStore();
    res.json(store.galleryItems);
  })
);

app.post("/api/gallery", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  galleryUpload(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = gallerySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.media?.[0];
      const extraMediaFiles = files?.extraMediaFiles || [];

      let mediaUrl = parsed.data.mediaUrl;
      let extraMedia: GalleryItem["extraMedia"] = [];
      if (coverFile) {
        const uploaded = await uploadMediaBuffer(coverFile.buffer, {
          folder: "femifunmi-foundation/gallery",
          resourceType: parsed.data.type === "video" ? "video" : "image"
        });
        mediaUrl = uploaded.secureUrl;
      }

      if (parsed.data.extraMediaJson?.trim()) {
        try {
          const parsedExtra = JSON.parse(parsed.data.extraMediaJson) as Array<{
            id?: string;
            type: "photo" | "video";
            mediaUrl: string;
          }>;
          extraMedia = parsedExtra
            .filter((item) => item && item.mediaUrl && (item.type === "photo" || item.type === "video"))
            .map((item, index) => ({
              id: item.id || createId(`gallery-media-${index}`),
              type: item.type,
              mediaUrl: item.mediaUrl
            }));
        } catch {
          return res.status(400).json({ message: "Invalid extra gallery media payload." });
        }
      }

      if (extraMediaFiles.length > 0) {
        const rawTypes = req.body.extraMediaFileTypes;
        const requestedTypes = Array.isArray(rawTypes) ? rawTypes : rawTypes ? [rawTypes] : [];

        const uploadedExtra = await Promise.all(
          extraMediaFiles.map(async (file, index) => {
            const requestedType = requestedTypes[index];
            const type: "photo" | "video" =
              requestedType === "video" || requestedType === "photo"
                ? requestedType
                : file.mimetype.startsWith("video/")
                  ? "video"
                  : "photo";

            const uploaded = await uploadMediaBuffer(file.buffer, {
              folder: "femifunmi-foundation/gallery",
              resourceType: type === "video" ? "video" : "image"
            });

            return {
              id: createId("gallery-media"),
              type,
              mediaUrl: uploaded.secureUrl
            };
          })
        );

        extraMedia = [...extraMedia, ...uploadedExtra];
      }

      if (!mediaUrl) {
        return res.status(400).json({ message: "Gallery media file is required." });
      }

      const store = await loadStore();
      const item: GalleryItem = {
        id: createId("gallery"),
        type: parsed.data.type,
        donateeName: parsed.data.donateeName,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        address: parsed.data.address,
        date: parsed.data.date,
        mediaUrl,
        priorityplacement: parsed.data.priorityplacement,
        extraMedia
      };

      if (item.priorityplacement) {
        store.galleryItems = store.galleryItems.map((existingItem) => ({
          ...existingItem,
          priorityplacement: false
        }));
      }

      store.galleryItems.unshift(item);
      await saveStore(store);
      return res.status(201).json(item);
    } catch (error) {
      return next(error);
    }
  });
});

app.get(
  "/api/gallery/:id",
  asyncRoute(async (req, res) => {
    const store = await loadStore();
    const item = store.galleryItems.find((entry) => entry.id === req.params.id);

    if (!item) {
      return res.status(404).send("Gallery item not found");
    }

    return res.json(item);
  })
);

app.put("/api/gallery/:id", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  galleryUpload(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = gallerySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      const store = await loadStore();
      const index = store.galleryItems.findIndex((entry) => entry.id === req.params.id);

      if (index === -1) {
        return res.status(404).send("Gallery item not found");
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.media?.[0];
      const extraMediaFiles = files?.extraMediaFiles || [];

      let mediaUrl = parsed.data.mediaUrl || store.galleryItems[index].mediaUrl;
      let extraMedia: GalleryItem["extraMedia"] = store.galleryItems[index].extraMedia || [];
      if (coverFile) {
        const uploaded = await uploadMediaBuffer(coverFile.buffer, {
          folder: "femifunmi-foundation/gallery",
          resourceType: parsed.data.type === "video" ? "video" : "image"
        });
        mediaUrl = uploaded.secureUrl;
      }

      if (parsed.data.extraMediaJson !== undefined) {
        if (parsed.data.extraMediaJson.trim() === "") {
          extraMedia = [];
        } else {
          try {
            const parsedExtra = JSON.parse(parsed.data.extraMediaJson) as Array<{
              id?: string;
              type: "photo" | "video";
              mediaUrl: string;
            }>;
            extraMedia = parsedExtra
              .filter((item) => item && item.mediaUrl && (item.type === "photo" || item.type === "video"))
              .map((item, mediaIndex) => ({
                id: item.id || createId(`gallery-media-${mediaIndex}`),
                type: item.type,
                mediaUrl: item.mediaUrl
              }));
          } catch {
            return res.status(400).json({ message: "Invalid extra gallery media payload." });
          }
        }
      }

      if (extraMediaFiles.length > 0) {
        const rawTypes = req.body.extraMediaFileTypes;
        const requestedTypes = Array.isArray(rawTypes) ? rawTypes : rawTypes ? [rawTypes] : [];

        const uploadedExtra = await Promise.all(
          extraMediaFiles.map(async (file, mediaIndex) => {
            const requestedType = requestedTypes[mediaIndex];
            const type: "photo" | "video" =
              requestedType === "video" || requestedType === "photo"
                ? requestedType
                : file.mimetype.startsWith("video/")
                  ? "video"
                  : "photo";
            const uploaded = await uploadMediaBuffer(file.buffer, {
              folder: "femifunmi-foundation/gallery",
              resourceType: type === "video" ? "video" : "image"
            });
            return {
              id: createId("gallery-media"),
              type,
              mediaUrl: uploaded.secureUrl
            };
          })
        );

        extraMedia = [...extraMedia, ...uploadedExtra];
      }

      const updated: GalleryItem = {
        id: req.params.id,
        type: parsed.data.type,
        donateeName: parsed.data.donateeName,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        address: parsed.data.address,
        date: parsed.data.date,
        mediaUrl,
        priorityplacement: parsed.data.priorityplacement,
        extraMedia
      };

      if (updated.priorityplacement) {
        store.galleryItems = store.galleryItems.map((existingItem) =>
          existingItem.id === req.params.id
            ? existingItem
            : {
                ...existingItem,
                priorityplacement: false
              }
        );
      }

      store.galleryItems[index] = updated;
      await saveStore(store);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  });
});

app.delete(
  "/api/gallery/:id",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const store = await loadStore();
    const before = store.galleryItems.length;
    store.galleryItems = store.galleryItems.filter((entry) => entry.id !== req.params.id);

    if (store.galleryItems.length === before) {
      return res.status(404).send("Gallery item not found");
    }

    await saveStore(store);
    return res.json({ ok: true });
  })
);

app.get(
  "/api/recent-updates",
  asyncRoute(async (_req, res) => {
    const updates = await listRecentUpdates();
    res.json(updates.map((item) => normalizeRecentUpdate(item as unknown as Record<string, unknown>)));
  })
);

app.get(
  "/api/recent-updates/:id",
  asyncRoute(async (req, res) => {
    const update = await getRecentUpdateRecordById(req.params.id);

    if (!update) {
      return res.status(404).send("Recent update not found");
    }

    return res.json(normalizeRecentUpdate(update as unknown as Record<string, unknown>));
  })
);

app.post("/api/recent-updates", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  recentUpdateUpload(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = recentUpdateMultipartBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      const uploadedMedia = await buildRecentUpdateMediaFromMultipart({
        descriptorsJson: parsed.data.mediaDescriptorsJson,
        files
      });

      if (uploadedMedia.length === 0) {
        return res.status(400).json({ message: "At least one media item is required." });
      }

      const media = uploadedMedia.map((item, index) => ({
        id: createId(`update-media-${index}`),
        ...item
      }));
      const requestedIndex = parsed.data.mainMediaIndex ?? 0;
      const mainMedia = media[Math.min(requestedIndex, media.length - 1)];

      const update: RecentUpdate = {
        id: createId("update"),
        title: parsed.data.title,
        description: parsed.data.description,
        date: parsed.data.date,
        location: parsed.data.location,
        mainMediaId: mainMedia.id,
        media
      };

      await createRecentUpdateRecord(update);

      return res.status(201).json(update);
    } catch (error) {
      return next(error);
    }
  });
});

app.put("/api/recent-updates/:id", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  recentUpdateUpload(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = recentUpdateMultipartBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      const existing = await getRecentUpdateRecordById(req.params.id);
      if (!existing) {
        return res.status(404).send("Recent update not found");
      }

      const files = (req.files as Express.Multer.File[] | undefined) || [];
      const uploadedMedia = await buildRecentUpdateMediaFromMultipart({
        descriptorsJson: parsed.data.mediaDescriptorsJson,
        files
      });

      if (uploadedMedia.length === 0) {
        return res.status(400).json({ message: "At least one media item is required." });
      }

      const media = uploadedMedia.map((item, mediaIndex) => ({
        id: createId(`update-media-${mediaIndex}`),
        ...item
      }));
      const requestedIndex = parsed.data.mainMediaIndex ?? 0;
      const mainMedia = media[Math.min(requestedIndex, media.length - 1)];

      const updated: RecentUpdate = {
        id: req.params.id,
        title: parsed.data.title,
        description: parsed.data.description,
        date: parsed.data.date,
        location: parsed.data.location,
        mainMediaId: mainMedia.id,
        media
      };

      await updateRecentUpdateRecord(req.params.id, updated);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  });
});

app.delete(
  "/api/recent-updates/:id",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const deleted = await deleteRecentUpdateRecord(req.params.id);
    if (!deleted) {
      return res.status(404).send("Recent update not found");
    }

    return res.json({ ok: true });
  })
);

app.get(
  "/api/upcoming-events",
  asyncRoute(async (_req, res) => {
    const store = await loadStore();
    res.json(store.upcomingEvents.map((item) => normalizeUpcomingEvent(item as unknown as Record<string, unknown>)));
  })
);

app.get(
  "/api/upcoming-events/:id",
  asyncRoute(async (req, res) => {
    const store = await loadStore();
    const event = store.upcomingEvents.find((item) => item.id === req.params.id);

    if (!event) {
      return res.status(404).send("Upcoming event not found");
    }

    return res.json(normalizeUpcomingEvent(event as unknown as Record<string, unknown>));
  })
);

app.post("/api/upcoming-events", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  upload.single("image")(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = upcomingEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Event image file is required." });
      }

      const uploaded = await uploadMediaBuffer(req.file.buffer, {
        folder: "femifunmi-foundation/upcoming-events",
        resourceType: "image"
      });
      const imageUrl = uploaded.secureUrl;

      const store = await loadStore();
      const event: UpcomingEvent = {
        id: createId("event"),
        title: parsed.data.title,
        description: parsed.data.description,
        dateIso: parsed.data.dateIso,
        location: parsed.data.location,
        imageUrl,
        priorityplacement: parsed.data.priorityplacement
      };

      if (event.priorityplacement) {
        store.upcomingEvents = store.upcomingEvents.map((existingEvent) => ({
          ...existingEvent,
          priorityplacement: false
        }));
      }

      store.upcomingEvents.unshift(event);
      await saveStore(store);
      return res.status(201).json(event);
    } catch (error) {
      return next(error);
    }
  });
});

app.put("/api/upcoming-events/:id", (req, res, next) => {
  if (!assertAdmin(req, res)) return;

  upload.single("image")(req, res, async (err: unknown) => {
    if (err) {
      return res.status(400).json({ message: "Invalid upload request." });
    }

    const parsed = upcomingEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    try {
      const store = await loadStore();
      const index = store.upcomingEvents.findIndex((item) => item.id === req.params.id);

      if (index === -1) {
        return res.status(404).send("Upcoming event not found");
      }

      let imageUrl = store.upcomingEvents[index].imageUrl;
      if (req.file) {
        const uploaded = await uploadMediaBuffer(req.file.buffer, {
          folder: "femifunmi-foundation/upcoming-events",
          resourceType: "image"
        });
        imageUrl = uploaded.secureUrl;
      }

      const updated: UpcomingEvent = {
        id: req.params.id,
        title: parsed.data.title,
        description: parsed.data.description,
        dateIso: parsed.data.dateIso,
        location: parsed.data.location,
        imageUrl,
        priorityplacement: parsed.data.priorityplacement
      };

      if (updated.priorityplacement) {
        store.upcomingEvents = store.upcomingEvents.map((existingEvent) =>
          existingEvent.id === req.params.id
            ? existingEvent
            : {
                ...existingEvent,
                priorityplacement: false
              }
        );
      }

      store.upcomingEvents[index] = updated;
      await saveStore(store);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  });
});

app.delete(
  "/api/upcoming-events/:id",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const store = await loadStore();
    const before = store.upcomingEvents.length;
    store.upcomingEvents = store.upcomingEvents.filter((item) => item.id !== req.params.id);

    if (before === store.upcomingEvents.length) {
      return res.status(404).send("Upcoming event not found");
    }

    await saveStore(store);
    return res.json({ ok: true });
  })
);

app.post(
  "/api/contact",
  asyncRoute(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const message: ContactMessage = {
      id: createId("message"),
      createdAt: new Date().toISOString(),
      ...parsed.data
    };

    store.contactMessages.unshift(message);
    await saveStore(store);

    return res.status(201).json({ ok: true });
  })
);

app.post(
  "/api/newsletter/subscribe",
  asyncRoute(async (req, res) => {
    const parsed = newsletterSubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const normalizedEmail = normalizeEmail(parsed.data.email);
    const existing = store.newsletterSubscribers.find(
      (item) => normalizeEmail(item.email) === normalizedEmail
    );

    if (existing) {
      existing.firstName = parsed.data.firstName;
      existing.email = normalizedEmail;
      existing.consentGiven = true;
      existing.isActive = true;
      existing.source = parsed.data.source;
      existing.unsubscribedAt = undefined;
      await saveStore(store);
      console.log(`[NEWSLETTER][SERVER] Re-activated existing subscriber: ${normalizedEmail}`);
      return res.status(200).json({ ok: true, alreadySubscribed: true });
    }

    const subscriber: NewsletterSubscriber = {
      id: createId("newsletter-subscriber"),
      firstName: parsed.data.firstName,
      email: normalizedEmail,
      consentGiven: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      source: parsed.data.source
    };

    store.newsletterSubscribers.unshift(subscriber);
    await saveStore(store);
    console.log(`[NEWSLETTER][SERVER] Added new subscriber: ${normalizedEmail}`);
    return res.status(201).json({ ok: true, alreadySubscribed: false });
  })
);

app.post(
  "/api/newsletter/unsubscribe",
  asyncRoute(async (req, res) => {
    const parsed = newsletterUnsubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const normalizedEmail = normalizeEmail(parsed.data.email);
    const subscriber = store.newsletterSubscribers.find(
      (item) => normalizeEmail(item.email) === normalizedEmail
    );

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date().toISOString();
    await saveStore(store);
    console.log(`[NEWSLETTER][SERVER] Unsubscribed: ${normalizedEmail}`);
    return res.json({ ok: true });
  })
);

app.get(
  "/api/newsletter/subscribers",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const store = await loadStore();
    return res.json(store.newsletterSubscribers);
  })
);

app.get(
  "/api/newsletter/campaigns",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const store = await loadStore();
    return res.json(store.newsletterCampaigns);
  })
);

app.post(
  "/api/newsletter/send",
  asyncRoute(async (req, res) => {
    if (!assertAdmin(req, res)) return;

    const parsed = newsletterSendSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const store = await loadStore();
    const recipients = store.newsletterSubscribers.filter((item) => item.isActive && item.consentGiven);

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No active newsletter subscribers found." });
    }

    await deliverNewsletterBatch({
      subject: parsed.data.subject,
      body: parsed.data.body,
      recipients
    });

    const campaign: NewsletterCampaign = {
      id: createId("newsletter-campaign"),
      subject: parsed.data.subject,
      body: parsed.data.body,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString()
    };

    store.newsletterCampaigns.unshift(campaign);
    await saveStore(store);
    console.log(
      `[NEWSLETTER][SERVER] Campaign sent: ${campaign.id}, recipients=${campaign.recipientCount}, subject="${campaign.subject}"`
    );

    return res.status(201).json({
      ok: true,
      campaign,
      recipientCount: recipients.length
    });
  })
);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    !isProduction && error instanceof Error && error.message
      ? error.message
      : "Internal server error";
  res.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`FemiFunmi Charity API listening on http://localhost:${port}`);
});
