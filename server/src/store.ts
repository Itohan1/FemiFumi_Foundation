import { MongoClient, type Db } from "mongodb";
import { DataStore, RecentUpdate } from "./types.js";

const seed: DataStore = {
  donationCases: [
    {
      id: "case-1",
      title: "Support children in orphanage homes",
      beneficiary: "Orphanage Homes",
      description: "Provide food packages, school supplies, and medical support for children.",
      targetAmount: "$5,000",
      mediaType: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
      status: "open"
    }
  ],
  donationContent: {
    introText:
      "A description of the person in need is posted here with pictures or videos of the person or group of persons.",
    missionText:
      "Save a life today by donating towards this mission, and surely you will be richly blessed.",
    paymentHeading: "Make Payment Here",
    paymentDescription:
      "Online payment platform and affiliated banks for direct deposits and bank transfer can be made here.",
    onlinePlatformLabel: "Donate Securely Online",
    onlinePlatformUrl: "https://www.femifunmicharity.org",
    bankTransferDetails: [
      "FEMIFUNMI CHARITY ORGANISATION - Zenith Bank - 1234567890",
      "FEMIFUNMI CHARITY ORGANISATION - GTBank - 0123456789"
    ]
  },
  donationTransactions: [],
  galleryItems: [
    {
      id: "gallery-1",
      type: "photo",
      title: "Community Outreach Program",
      location: "Ikeja, Lagos",
      address: "Lagos, Nigeria",
      date: "January 2026",
      mediaUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
      priorityplacement: false
    }
  ],
  recentUpdates: [
    {
      id: "update-1",
      title: "School Support Outreach in Ikeja",
      description:
        "Our outreach team visited community schools in Ikeja and delivered education kits to pupils in need. Volunteers also held mentoring sessions with parents and teachers to understand each student's support needs and follow-up requirements.",
      date: "February 2026",
      location: "Ikeja, Lagos",
      mainMediaId: "update-1-media-1",
      media: [
        {
          id: "update-1-media-1",
          type: "photo",
          mediaUrl:
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
          caption: "Children receiving school support packs."
        },
        {
          id: "update-1-media-2",
          type: "photo",
          mediaUrl:
            "https://images.unsplash.com/photo-1542816417-0983670d98b9?auto=format&fit=crop&w=1200&q=80",
          caption: "Volunteer team coordinating the distribution."
        }
      ]
    }
  ],
  upcomingEvents: [
    {
      id: "event-1",
      title: "Back-to-School Community Drive",
      description:
        "The foundation will support school-age children with educational kits, mentorship sessions, and parent engagement support.",
      dateIso: "2026-03-28T10:00:00+01:00",
      location: "Ikeja, Lagos",
      imageUrl:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      priorityplacement: false
    }
  ],
  contactMessages: [],
  newsletterSubscribers: [],
  newsletterCampaigns: []
};

let dbPromise: Promise<Db> | null = null;
let mongoClient: MongoClient | null = null;

async function getDb(): Promise<Db> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is required.");
    }

    const dbName = process.env.MONGODB_DB_NAME || "femifunmi_foundation";
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    await ensureSeedData(db);
    return db;
  })();

  return dbPromise;
}

async function ensureSeedData(db: Db): Promise<void> {
  const [
    donationCasesCount,
    donationContentCount,
    donationTransactionsCount,
    galleryItemsCount,
    recentUpdatesCount,
    upcomingEventsCount,
    contactMessagesCount,
    newsletterSubscribersCount,
    newsletterCampaignsCount
  ] = await Promise.all([
    db.collection("donationCases").countDocuments(),
    db.collection("donationContent").countDocuments(),
    db.collection("donationTransactions").countDocuments(),
    db.collection("galleryItems").countDocuments(),
    db.collection("recentUpdates").countDocuments(),
    db.collection("upcomingEvents").countDocuments(),
    db.collection("contactMessages").countDocuments(),
    db.collection("newsletterSubscribers").countDocuments(),
    db.collection("newsletterCampaigns").countDocuments()
  ]);

  const operations: Promise<unknown>[] = [];

  if (donationCasesCount === 0 && seed.donationCases.length > 0) {
    operations.push(db.collection("donationCases").insertMany(seed.donationCases));
  }

  if (donationContentCount === 0) {
    operations.push(db.collection("donationContent").insertOne(seed.donationContent));
  }

  if (donationTransactionsCount === 0 && seed.donationTransactions.length > 0) {
    operations.push(db.collection("donationTransactions").insertMany(seed.donationTransactions));
  }

  if (galleryItemsCount === 0 && seed.galleryItems.length > 0) {
    operations.push(db.collection("galleryItems").insertMany(seed.galleryItems));
  }

  if (recentUpdatesCount === 0 && seed.recentUpdates.length > 0) {
    operations.push(db.collection("recentUpdates").insertMany(seed.recentUpdates));
  }

  if (upcomingEventsCount === 0 && seed.upcomingEvents.length > 0) {
    operations.push(db.collection("upcomingEvents").insertMany(seed.upcomingEvents));
  }

  if (contactMessagesCount === 0 && seed.contactMessages.length > 0) {
    operations.push(db.collection("contactMessages").insertMany(seed.contactMessages));
  }

  if (newsletterSubscribersCount === 0 && seed.newsletterSubscribers.length > 0) {
    operations.push(db.collection("newsletterSubscribers").insertMany(seed.newsletterSubscribers));
  }

  if (newsletterCampaignsCount === 0 && seed.newsletterCampaigns.length > 0) {
    operations.push(db.collection("newsletterCampaigns").insertMany(seed.newsletterCampaigns));
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }
}

function stripMongoId<T>(doc: Record<string, unknown> | null): T {
  if (!doc) {
    return {} as T;
  }

  const { _id, ...rest } = doc;
  return rest as T;
}

async function recentUpdatesCollection() {
  const db = await getDb();
  return db.collection<RecentUpdate>("recentUpdates");
}

export async function listRecentUpdates(): Promise<RecentUpdate[]> {
  const collection = await recentUpdatesCollection();
  const docs = await collection.find({}).sort({ _id: -1 }).toArray();
  return docs.map((doc) => stripMongoId<RecentUpdate>(doc as unknown as Record<string, unknown>));
}

export async function getRecentUpdateById(id: string): Promise<RecentUpdate | null> {
  const collection = await recentUpdatesCollection();
  const doc = await collection.findOne({ id });
  return doc ? stripMongoId<RecentUpdate>(doc as unknown as Record<string, unknown>) : null;
}

export async function createRecentUpdateRecord(payload: RecentUpdate): Promise<void> {
  const collection = await recentUpdatesCollection();
  await collection.insertOne(payload);
}

export async function updateRecentUpdateRecord(id: string, payload: RecentUpdate): Promise<boolean> {
  const collection = await recentUpdatesCollection();
  const result = await collection.replaceOne({ id }, payload);
  return result.matchedCount > 0;
}

export async function deleteRecentUpdateRecord(id: string): Promise<boolean> {
  const collection = await recentUpdatesCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function loadStore(): Promise<DataStore> {
  const db = await getDb();
  const [
    donationCasesDocs,
    donationContentDoc,
    donationTransactionsDocs,
    galleryItemsDocs,
    recentUpdatesDocs,
    upcomingEventsDocs,
    contactMessagesDocs,
    newsletterSubscribersDocs,
    newsletterCampaignsDocs
  ] =
    await Promise.all([
      db.collection("donationCases").find({}).sort({ _id: -1 }).toArray(),
      db.collection("donationContent").findOne({}),
      db.collection("donationTransactions").find({}).sort({ _id: -1 }).toArray(),
      db.collection("galleryItems").find({}).sort({ _id: -1 }).toArray(),
      db.collection("recentUpdates").find({}).sort({ _id: -1 }).toArray(),
      db.collection("upcomingEvents").find({}).sort({ _id: -1 }).toArray(),
      db.collection("contactMessages").find({}).sort({ _id: -1 }).toArray(),
      db.collection("newsletterSubscribers").find({}).sort({ _id: -1 }).toArray(),
      db.collection("newsletterCampaigns").find({}).sort({ _id: -1 }).toArray()
    ]);

  return {
    donationCases: donationCasesDocs.map((doc) => stripMongoId(doc)),
    donationContent: stripMongoId(donationContentDoc) || seed.donationContent,
    donationTransactions: donationTransactionsDocs.map((doc) => stripMongoId(doc)),
    galleryItems: galleryItemsDocs.map((doc) => stripMongoId(doc)),
    recentUpdates: recentUpdatesDocs.map((doc) => stripMongoId(doc)),
    upcomingEvents: upcomingEventsDocs.map((doc) => stripMongoId(doc)),
    contactMessages: contactMessagesDocs.map((doc) => stripMongoId(doc)),
    newsletterSubscribers: newsletterSubscribersDocs.map((doc) => stripMongoId(doc)),
    newsletterCampaigns: newsletterCampaignsDocs.map((doc) => stripMongoId(doc))
  } as DataStore;
}

export async function saveStore(data: DataStore): Promise<void> {
  const db = await getDb();

  const operations: Promise<unknown>[] = [
    db.collection("donationCases").deleteMany({}),
    db.collection("donationContent").deleteMany({}),
    db.collection("donationTransactions").deleteMany({}),
    db.collection("galleryItems").deleteMany({}),
    db.collection("recentUpdates").deleteMany({}),
    db.collection("upcomingEvents").deleteMany({}),
    db.collection("contactMessages").deleteMany({}),
    db.collection("newsletterSubscribers").deleteMany({}),
    db.collection("newsletterCampaigns").deleteMany({})
  ];

  await Promise.all(operations);

  const insertOps: Promise<unknown>[] = [];
  if (data.donationCases.length > 0) {
    insertOps.push(db.collection("donationCases").insertMany(data.donationCases));
  }

  insertOps.push(db.collection("donationContent").insertOne(data.donationContent));

  if (data.donationTransactions.length > 0) {
    insertOps.push(db.collection("donationTransactions").insertMany(data.donationTransactions));
  }

  if (data.galleryItems.length > 0) {
    insertOps.push(db.collection("galleryItems").insertMany(data.galleryItems));
  }

  if (data.recentUpdates.length > 0) {
    insertOps.push(db.collection("recentUpdates").insertMany(data.recentUpdates));
  }

  if (data.upcomingEvents.length > 0) {
    insertOps.push(db.collection("upcomingEvents").insertMany(data.upcomingEvents));
  }

  if (data.contactMessages.length > 0) {
    insertOps.push(db.collection("contactMessages").insertMany(data.contactMessages));
  }

  if (data.newsletterSubscribers.length > 0) {
    insertOps.push(db.collection("newsletterSubscribers").insertMany(data.newsletterSubscribers));
  }

  if (data.newsletterCampaigns.length > 0) {
    insertOps.push(db.collection("newsletterCampaigns").insertMany(data.newsletterCampaigns));
  }

  await Promise.all(insertOps);
}

export async function closeStoreConnection(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    dbPromise = null;
  }
}
