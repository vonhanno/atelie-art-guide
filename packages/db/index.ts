import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Try to initialize with service account from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "atelie-art-agent",
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Use Application Default Credentials (for Cloud Run, etc.)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // Fallback: try to initialize with default credentials
    try {
      admin.initializeApp({
        projectId: "atelie-art-agent",
      });
    } catch (error) {
      console.warn("Firebase Admin initialization warning:", error);
    }
  }
}

export const db = admin.firestore();
export const adminApp = admin.app();

// Collection names
export const COLLECTIONS = {
  ARTWORK_ANALYSES: "artworkAnalyses",
} as const;

// Type definitions
export interface ArtworkAnalysis {
  id: string;
  artworkId: string;
  source: string;
  analysisVersion: number;
  analysisDate: admin.firestore.Timestamp | Date;
  status: "pending" | "processing" | "done" | "failed";
  imageUrl: string;
  title: string;
  studioName: string;
  aiData?: any;
  error?: string | null;
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt: admin.firestore.Timestamp | Date;
}

// Helper to convert Firestore timestamps to dates
export function toDate(value: admin.firestore.Timestamp | Date): Date {
  if (value instanceof Date) return value;
  return value.toDate();
}

// Helper to convert dates to Firestore timestamps
export function toTimestamp(value: Date | admin.firestore.Timestamp): admin.firestore.Timestamp {
  if (value instanceof admin.firestore.Timestamp) return value;
  return admin.firestore.Timestamp.fromDate(value);
}

// Database operations
export const artworkAnalysisCollection = db.collection(COLLECTIONS.ARTWORK_ANALYSES);

// Helper functions for common operations
export async function findArtworkAnalysisById(id: string): Promise<ArtworkAnalysis | null> {
  const doc = await artworkAnalysisCollection.doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    analysisDate: toDate(data.analysisDate),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as ArtworkAnalysis;
}

export async function findArtworkAnalysisByArtworkId(
  artworkId: string
): Promise<ArtworkAnalysis | null> {
  const snapshot = await artworkAnalysisCollection
    .where("artworkId", "==", artworkId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    analysisDate: toDate(data.analysisDate),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as ArtworkAnalysis;
}

export async function createArtworkAnalysis(
  data: Partial<Omit<ArtworkAnalysis, "id" | "createdAt" | "updatedAt">> & {
    artworkId: string;
    status: "pending" | "processing" | "done" | "failed";
    imageUrl: string;
    title: string;
    studioName: string;
  }
): Promise<ArtworkAnalysis> {
  const now = admin.firestore.Timestamp.now();
  const docData = {
    source: data.source || "algolia",
    analysisVersion: data.analysisVersion || 1,
    analysisDate: data.analysisDate ? toTimestamp(data.analysisDate) : now,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await artworkAnalysisCollection.add(docData);
  const created = await findArtworkAnalysisById(docRef.id);
  return created!;
}

export async function updateArtworkAnalysis(
  id: string,
  data: Partial<Omit<ArtworkAnalysis, "id" | "createdAt">>
): Promise<void> {
  const updateData: any = {
    ...data,
    updatedAt: admin.firestore.Timestamp.now(),
  };
  // Convert Date fields to Timestamps
  if (updateData.analysisDate instanceof Date) {
    updateData.analysisDate = toTimestamp(updateData.analysisDate);
  }
  await artworkAnalysisCollection.doc(id).update(updateData);
}

export async function upsertArtworkAnalysis(
  artworkId: string,
  data: Partial<Omit<ArtworkAnalysis, "id" | "createdAt" | "updatedAt">>
): Promise<ArtworkAnalysis> {
  const existing = await findArtworkAnalysisByArtworkId(artworkId);
  const now = admin.firestore.Timestamp.now();

  if (existing) {
    await updateArtworkAnalysis(existing.id, data);
    const updated = await findArtworkAnalysisById(existing.id);
    if (!updated) throw new Error("Failed to update artwork analysis");
    return updated;
  } else {
    return await createArtworkAnalysis({
      artworkId,
      source: data.source || "algolia",
      analysisVersion: data.analysisVersion || 1,
      status: data.status || "pending",
      imageUrl: data.imageUrl || "",
      title: data.title || "",
      studioName: data.studioName || "",
      ...data,
    });
  }
}

export async function countArtworkAnalyses(
  where?: { status?: string }
): Promise<number> {
  let query: admin.firestore.Query = artworkAnalysisCollection;
  if (where?.status) {
    query = query.where("status", "==", where.status);
  }
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

export async function findManyArtworkAnalyses(options: {
  where?: { status?: string };
  take?: number;
  skip?: number;
  orderBy?: { field: string; direction: "asc" | "desc" };
}): Promise<ArtworkAnalysis[]> {
  let query: admin.firestore.Query = artworkAnalysisCollection;

  if (options.where?.status) {
    query = query.where("status", "==", options.where.status);
  }

  if (options.orderBy) {
    query = query.orderBy(options.orderBy.field, options.orderBy.direction);
  } else {
    query = query.orderBy("createdAt", "desc");
  }

  if (options.skip) {
    query = query.offset(options.skip);
  }

  if (options.take) {
    query = query.limit(options.take);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      analysisDate: toDate(data.analysisDate),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as ArtworkAnalysis;
  });
}

// Legacy Prisma-compatible interface for easier migration
export const prisma = {
  artworkAnalysis: {
    findUnique: async (args: { where: { id?: string; artworkId?: string } }) => {
      if (args.where.id) {
        return await findArtworkAnalysisById(args.where.id);
      }
      if (args.where.artworkId) {
        return await findArtworkAnalysisByArtworkId(args.where.artworkId);
      }
      return null;
    },
    findMany: async (args?: {
      where?: { status?: string; aiData?: any };
      take?: number;
      skip?: number;
      orderBy?: { createdAt: "asc" | "desc" };
    }) => {
      return await findManyArtworkAnalyses({
        where: args?.where,
        take: args?.take,
        skip: args?.skip,
        orderBy: args?.orderBy
          ? { field: "createdAt", direction: args.orderBy.createdAt }
          : undefined,
      });
    },
    count: async (args?: { where?: { status?: string } }) => {
      return await countArtworkAnalyses(args?.where);
    },
    create: async (args: { data: Omit<ArtworkAnalysis, "id" | "createdAt" | "updatedAt"> }) => {
      return await createArtworkAnalysis(args.data);
    },
    update: async (args: {
      where: { id?: string; artworkId?: string };
      data: Partial<Omit<ArtworkAnalysis, "id" | "createdAt">>;
    }) => {
      let id = args.where.id;
      if (!id && args.where.artworkId) {
        const existing = await findArtworkAnalysisByArtworkId(args.where.artworkId);
        if (!existing) {
          throw new Error(`ArtworkAnalysis not found: ${args.where.artworkId}`);
        }
        id = existing.id;
      }
      if (!id) {
        throw new Error("Either id or artworkId must be provided");
      }
      await updateArtworkAnalysis(id, args.data);
      return await findArtworkAnalysisById(id);
    },
    upsert: async (args: {
      where: { artworkId: string };
      create: Omit<ArtworkAnalysis, "id" | "createdAt" | "updatedAt">;
      update: any;
    }): Promise<ArtworkAnalysis> => {
      return await upsertArtworkAnalysis(args.where.artworkId, {
        ...args.create,
        ...args.update,
      });
    },
  },
  $disconnect: async () => {
    // Firebase doesn't need explicit disconnection
    return Promise.resolve();
  },
};
