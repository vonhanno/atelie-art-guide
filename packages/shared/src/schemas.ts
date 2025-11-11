import { z } from "zod";

// Algolia Artwork Schema
export const algoliaArtworkSchema = z.object({
  objectID: z.string(),
  title: z.string(),
  studioName: z.string(),
  imageUrls: z.array(z.string()),
  price: z.number(),
  currency: z.string(),
  dimensions: z.object({
    widthCm: z.number(),
    heightCm: z.number(),
  }),
  techniques: z.array(z.string()),
  year: z.number().optional(),
  infoText: z.string().optional(),
  status: z.string(),
});

export type AlgoliaArtwork = z.infer<typeof algoliaArtworkSchema>;

// AI Analysis Data Schema
export const aiAnalysisDataSchema = z.object({
  basicVisualProperties: z.object({
    dominantColors: z.array(z.string()),
    secondaryColors: z.array(z.string()),
    colorTemperature: z.enum(["warm", "cool", "neutral"]),
    colorPalette: z.array(z.string()),
  }),
  textureAnalysis: z.object({
    textureType: z.string(),
    textureDescription: z.string(),
    surfaceQuality: z.string(),
  }),
  styleAndGenre: z.object({
    style: z.string(),
    genre: z.string(),
    movement: z.string().optional(),
    period: z.string().optional(),
  }),
  subjectMatter: z.object({
    primarySubject: z.string(),
    secondarySubjects: z.array(z.string()),
    themes: z.array(z.string()),
    narrative: z.string().optional(),
  }),
  mediumAndTechnique: z.object({
    medium: z.string(),
    technique: z.string(),
    materials: z.array(z.string()).optional(),
  }),
  composition: z.object({
    layout: z.string(),
    focalPoint: z.string(),
    balance: z.string(),
    perspective: z.string().optional(),
  }),
  spaceAndDisplay: z.object({
    recommendedRoomTypes: z.array(z.string()),
    recommendedWallColor: z.array(z.string()),
    lightingRecommendations: z.array(z.string()),
    sizeRecommendations: z.string(),
  }),
  psychologicalImpact: z.object({
    mood: z.array(z.string()),
    energyLevel: z.enum(["low", "medium", "high"]),
    emotionalTone: z.string(),
  }),
  marketAnalysis: z.object({
    targetAudience: z.array(z.string()),
    priceRange: z.string().optional(),
    collectibility: z.enum(["low", "medium", "high"]),
  }),
  tags: z.array(z.string()),
});

export type AIAnalysisData = z.infer<typeof aiAnalysisDataSchema>;

// API Request/Response Schemas
export const enqueueAnalysisRequestSchema = z.object({
  artworkIds: z.array(z.string()).min(1),
});

export type EnqueueAnalysisRequest = z.infer<typeof enqueueAnalysisRequestSchema>;

export const artworkSearchQuerySchema = z.object({
  q: z.string().optional(),
  artist: z.string().optional(),
  availability: z.string().optional(),
  technique: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  hitsPerPage: z.coerce.number().int().positive().max(100).default(20),
});

export type ArtworkSearchQuery = z.infer<typeof artworkSearchQuerySchema>;

// Analysis Status
export const analysisStatusSchema = z.enum(["pending", "processing", "done", "failed"]);

export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;

