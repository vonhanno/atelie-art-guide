import type { AIAnalysisData, AlgoliaArtwork, AnalysisStatus } from "./schemas";

export interface ArtworkSearchResponse {
  hits: AlgoliaArtwork[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export interface AnalysisStats {
  total: number;
  pending: number;
  processing: number;
  done: number;
  failed: number;
  successRate: number;
}

export interface AnalysisJob {
  id: string;
  artworkId: string;
  status: AnalysisStatus;
  progress?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisResult {
  id: string;
  artworkId: string;
  status: AnalysisStatus;
  analysisDate: Date;
  imageUrl: string;
  title: string;
  studioName: string;
  aiData: AIAnalysisData | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { AIAnalysisData, AlgoliaArtwork, AnalysisStatus };

