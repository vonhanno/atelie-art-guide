import type { AIAnalysisData, AlgoliaArtwork } from "./schemas";

export interface RoomAnalysis {
  style: string;
  colors: { name: string; hex: string; pct: number }[];
  lighting: string;
  roomSize: "small" | "medium" | "large";
  mood: string;
  suitableArtStyles: string[];
  recommendedSizes: string[];
  paletteTemperature: "warm" | "cool" | "neutral";
}

export interface TextQueryCriteria {
  styles: string[];
  colors: string[];
  mood: string;
  size: string;
  medium: string;
  priceRange: { min: number; max: number };
  context: string;
}

export interface MatchResult {
  artworkId: string;
  score: number;
  reasons: string[];
  confidence: "low" | "medium" | "high";
  artwork: AlgoliaArtwork;
  analysis: AIAnalysisData | null;
}

export interface MatchCriteria {
  roomAnalysis?: RoomAnalysis;
  textCriteria?: TextQueryCriteria;
}

/**
 * Calculate compatibility score between artwork and search criteria
 * Returns score 0-100 with match reasons
 */
export function calculateMatchScore(
  artwork: AlgoliaArtwork,
  analysis: AIAnalysisData | null,
  criteria: MatchCriteria
): { score: number; reasons: string[] } {
  if (!analysis) {
    return { score: 0, reasons: ["No analysis data available"] };
  }

  let totalScore = 0;
  const reasons: string[] = [];

  // Style compatibility (25%)
  const styleScore = calculateStyleScore(analysis, criteria);
  totalScore += styleScore.score * 0.25;
  if (styleScore.reason) reasons.push(styleScore.reason);

  // Color harmony (30%)
  const colorScore = calculateColorScore(analysis, criteria);
  totalScore += colorScore.score * 0.3;
  if (colorScore.reason) reasons.push(colorScore.reason);

  // Mood alignment (20%)
  const moodScore = calculateMoodScore(analysis, criteria);
  totalScore += moodScore.score * 0.2;
  if (moodScore.reason) reasons.push(moodScore.reason);

  // Size appropriateness (15%)
  const sizeScore = calculateSizeScore(artwork, analysis, criteria);
  totalScore += sizeScore.score * 0.15;
  if (sizeScore.reason) reasons.push(sizeScore.reason);

  // Psychological impact (10%)
  const psychScore = calculatePsychologicalScore(analysis, criteria);
  totalScore += psychScore.score * 0.1;
  if (psychScore.reason) reasons.push(psychScore.reason);

  return {
    score: Math.round(totalScore * 100) / 100,
    reasons: reasons.slice(0, 3), // Top 3 reasons
  };
}

function calculateStyleScore(
  analysis: AIAnalysisData,
  criteria: MatchCriteria
): { score: number; reason?: string } {
  const artworkStyle = analysis.styleAndGenre.style.toLowerCase();
  const artworkGenre = analysis.styleAndGenre.genre.toLowerCase();

  if (criteria.roomAnalysis) {
    const roomStyles = criteria.roomAnalysis.suitableArtStyles.map((s) => s.toLowerCase());
    if (roomStyles.some((s) => artworkStyle.includes(s) || artworkGenre.includes(s))) {
      return {
        score: 1.0,
        reason: `${analysis.styleAndGenre.style} style matches your ${criteria.roomAnalysis.style} room`,
      };
    }
  }

  if (criteria.textCriteria?.styles.length) {
    const queryStyles = criteria.textCriteria.styles.map((s) => s.toLowerCase());
    if (queryStyles.some((s) => artworkStyle.includes(s) || artworkGenre.includes(s))) {
      return {
        score: 0.9,
        reason: `Matches your ${criteria.textCriteria.styles[0]} style preference`,
      };
    }
  }

  return { score: 0.3 };
}

function calculateColorScore(
  analysis: AIAnalysisData,
  criteria: MatchCriteria
): { score: number; reason?: string } {
  const artworkColors = analysis.basicVisualProperties.dominantColors.map((c) => c.toLowerCase());
  const artworkTemp = analysis.basicVisualProperties.colorTemperature;

  if (criteria.roomAnalysis) {
    const roomColors = criteria.roomAnalysis.colors.map((c) => c.name.toLowerCase());
    const roomTemp = criteria.roomAnalysis.paletteTemperature;

    // Temperature match
    if (artworkTemp === roomTemp) {
      const colorMatch = artworkColors.some((ac) =>
        roomColors.some((rc) => ac.includes(rc) || rc.includes(ac))
      );
      if (colorMatch) {
        return {
          score: 1.0,
          reason: `${artworkTemp} tones complement your room's color palette`,
        };
      }
      return {
        score: 0.8,
        reason: `${artworkTemp} color temperature matches your room`,
      };
    }
  }

  if (criteria.textCriteria?.colors.length) {
    const queryColors = criteria.textCriteria.colors.map((c) => c.toLowerCase());
    const hasMatch = artworkColors.some((ac) =>
      queryColors.some((qc) => ac.includes(qc) || qc.includes(ac))
    );
    if (hasMatch) {
      return {
        score: 0.9,
        reason: `Features ${criteria.textCriteria.colors[0]} tones you requested`,
      };
    }
  }

  return { score: 0.4 };
}

function calculateMoodScore(
  analysis: AIAnalysisData,
  criteria: MatchCriteria
): { score: number; reason?: string } {
  const artworkMoods = analysis.psychologicalImpact.mood.map((m) => m.toLowerCase());
  const artworkEnergy = analysis.psychologicalImpact.energyLevel;

  if (criteria.roomAnalysis) {
    const roomMood = criteria.roomAnalysis.mood.toLowerCase();
    if (artworkMoods.some((m) => m.includes(roomMood) || roomMood.includes(m))) {
      return {
        score: 1.0,
        reason: `Creates a ${roomMood} atmosphere matching your space`,
      };
    }
  }

  if (criteria.textCriteria?.mood) {
    const queryMood = criteria.textCriteria.mood.toLowerCase();
    if (artworkMoods.some((m) => m.includes(queryMood) || queryMood.includes(m))) {
      return {
        score: 0.9,
        reason: `Delivers the ${queryMood} mood you're looking for`,
      };
    }
  }

  return { score: 0.5 };
}

function calculateSizeScore(
  artwork: AlgoliaArtwork,
  analysis: AIAnalysisData,
  criteria: MatchCriteria
): { score: number; reason?: string } {
  const artworkSize = analysis.spaceAndDisplay.sizeRecommendations.toLowerCase();
  const dimensions = artwork.dimensions;
  const area = (dimensions.widthCm * dimensions.heightCm) / 10000; // m²

  if (criteria.roomAnalysis) {
    const roomSize = criteria.roomAnalysis.roomSize;
    const recommendedSizes = criteria.roomAnalysis.recommendedSizes.map((s) => s.toLowerCase());

    if (recommendedSizes.some((rs) => artworkSize.includes(rs) || rs.includes(artworkSize))) {
      return {
        score: 1.0,
        reason: `Perfect size for your ${roomSize} room`,
      };
    }

    // Size heuristics
    if (roomSize === "small" && area < 0.5) {
      return { score: 0.9, reason: "Compact size fits smaller spaces" };
    }
    if (roomSize === "medium" && area >= 0.5 && area < 1.5) {
      return { score: 0.9, reason: "Medium size balances your space" };
    }
    if (roomSize === "large" && area >= 1.5) {
      return { score: 0.9, reason: "Large format makes a statement" };
    }
  }

  if (criteria.textCriteria?.size) {
    const querySize = criteria.textCriteria.size.toLowerCase();
    if (artworkSize.includes(querySize) || querySize.includes(artworkSize)) {
      return {
        score: 0.9,
        reason: `Matches your ${querySize} size preference`,
      };
    }
  }

  return { score: 0.6 };
}

function calculatePsychologicalScore(
  analysis: AIAnalysisData,
  criteria: MatchCriteria
): { score: number; reason?: string } {
  const artworkEnergy = analysis.psychologicalImpact.energyLevel;
  const artworkMoods = analysis.psychologicalImpact.mood;

  if (criteria.roomAnalysis) {
    const roomMood = criteria.roomAnalysis.mood.toLowerCase();
    const isCalming = roomMood.includes("calm") || roomMood.includes("peaceful");
    const isEnergetic = roomMood.includes("energetic") || roomMood.includes("vibrant");

    if (isCalming && artworkEnergy === "low") {
      return { score: 1.0, reason: "Low energy creates a serene atmosphere" };
    }
    if (isEnergetic && artworkEnergy === "high") {
      return { score: 1.0, reason: "High energy adds vibrancy to your space" };
    }
  }

  return { score: 0.7 };
}

export function determineConfidence(score: number): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

