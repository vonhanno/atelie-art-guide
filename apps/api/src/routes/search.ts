import { FastifyInstance } from "fastify";
import { z } from "zod";
import algoliasearch from "algoliasearch";
import { prisma } from "@atelie/db";
import {
  calculateMatchScore,
  determineConfidence,
  type MatchResult,
  type RoomAnalysis,
  type TextQueryCriteria,
} from "@atelie/shared";
import OpenAI from "openai";

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);
const index = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME || "artworks");

// Lazy initialization - only create OpenAI client when needed
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required for AI search features");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Schemas
const textSearchSchema = z.object({
  query: z.string().min(1),
});

const imageSearchSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
});

const combinedSearchSchema = z.object({
  query: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
});

/**
 * Analyze room photo using OpenAI Vision
 */
async function analyzeRoomImage(imageUrl?: string, imageBase64?: string): Promise<RoomAnalysis> {
  if (!imageUrl && !imageBase64) {
    throw new Error("Either imageUrl or imageBase64 must be provided");
  }

  const imageContent = imageBase64
    ? { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    : { type: "image_url" as const, image_url: { url: imageUrl! } };

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert interior designer and art consultant. Analyze room photos and extract structured data about the space. Return ONLY valid JSON matching this schema:
{
  "style": "modern|traditional|minimalist|industrial|etc",
  "colors": [{"name": "color name", "hex": "#hexcode", "pct": 0-100}],
  "lighting": "bright|dim|natural|artificial",
  "roomSize": "small|medium|large",
  "mood": "calming|energetic|cozy|sophisticated|etc",
  "suitableArtStyles": ["abstract", "contemporary", "etc"],
  "recommendedSizes": ["small", "medium", "large"],
  "paletteTemperature": "warm|cool|neutral"
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this room photo and extract the room characteristics in JSON format.",
          },
          imageContent,
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as RoomAnalysis;
}

/**
 * Analyze text query using OpenAI
 */
async function analyzeTextQuery(query: string): Promise<TextQueryCriteria> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an art recommendation assistant. Extract search criteria from user queries. Return ONLY valid JSON matching this schema:
{
  "styles": ["abstract", "contemporary", etc],
  "colors": ["blue", "red", etc],
  "mood": "calming|energetic|etc",
  "size": "small|medium|large",
  "medium": "painting|print|photography|etc",
  "priceRange": {"min": 0, "max": 10000},
  "context": "office|living room|bedroom|etc"
}`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as TextQueryCriteria;
}

/**
 * Get artworks with analysis data and calculate matches
 */
async function getMatchedArtworks(
  criteria: { roomAnalysis?: RoomAnalysis; textCriteria?: TextQueryCriteria },
  limit = 50
): Promise<MatchResult[]> {
  // Get all analyzed artworks
  const analyses = await prisma.artworkAnalysis.findMany({
    where: {
      status: "done",
    },
    take: limit * 2, // Get more to filter
  });

  // Filter out analyses without aiData
  const analysesWithData = analyses.filter((a) => a.aiData != null);

  // Get artwork details from Algolia
  const artworkIds = analysesWithData.map((a) => a.artworkId);
  let algoliaResults: any = { results: [] };
  
  try {
    algoliaResults = await index.getObjects(artworkIds);
  } catch (error) {
    console.error("Failed to fetch artworks from Algolia:", error);
  }

  const matches: MatchResult[] = [];

  for (const analysis of analysesWithData) {
    const algoliaArtwork = algoliaResults.results?.find(
      (r: any) => r.objectID === analysis.artworkId
    )?.object as any;

    if (!algoliaArtwork) continue;

    const { score, reasons } = calculateMatchScore(
      algoliaArtwork,
      analysis.aiData as any,
      criteria
    );

    matches.push({
      artworkId: analysis.artworkId,
      score,
      reasons,
      confidence: determineConfidence(score),
      artwork: algoliaArtwork,
      analysis: analysis.aiData as any,
    });
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function searchRoutes(fastify: FastifyInstance) {
  // Text search
  fastify.post<{ Body: z.infer<typeof textSearchSchema> }>(
    "/text",
    async (request, reply) => {
      try {
        const { query } = textSearchSchema.parse(request.body);
        const textCriteria = await analyzeTextQuery(query);

        const matches = await getMatchedArtworks({ textCriteria });

        return reply.send({
          success: true,
          criteria: textCriteria,
          results: matches,
          count: matches.length,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: error.message || "Failed to process text search",
        });
      }
    }
  );

  // Image search
  fastify.post<{ Body: z.infer<typeof imageSearchSchema> }>(
    "/image",
    async (request, reply) => {
      try {
        const { imageUrl, imageBase64 } = imageSearchSchema.parse(request.body);
        const roomAnalysis = await analyzeRoomImage(imageUrl, imageBase64);

        const matches = await getMatchedArtworks({ roomAnalysis });

        return reply.send({
          success: true,
          roomAnalysis,
          results: matches,
          count: matches.length,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: error.message || "Failed to process image search",
        });
      }
    }
  );

  // Combined search
  fastify.post<{ Body: z.infer<typeof combinedSearchSchema> }>(
    "/combined",
    async (request, reply) => {
      try {
        const { query, imageUrl, imageBase64 } = combinedSearchSchema.parse(request.body);

        const criteria: { roomAnalysis?: RoomAnalysis; textCriteria?: TextQueryCriteria } = {};

        if (imageUrl || imageBase64) {
          criteria.roomAnalysis = await analyzeRoomImage(imageUrl, imageBase64);
        }

        if (query) {
          criteria.textCriteria = await analyzeTextQuery(query);
        }

        if (!criteria.roomAnalysis && !criteria.textCriteria) {
          return reply.code(400).send({
            success: false,
            error: "Either query or image must be provided",
          });
        }

        const matches = await getMatchedArtworks(criteria);

        return reply.send({
          success: true,
          criteria,
          results: matches,
          count: matches.length,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: error.message || "Failed to process combined search",
        });
      }
    }
  );

  // Get recommendations by room analysis ID (for saved searches)
  fastify.get<{ Querystring: { roomId?: string } }>(
    "/recommendations",
    async (request, reply) => {
      // This could be extended to store room analyses and retrieve them
      // For now, return error
      return reply.code(501).send({
        success: false,
        error: "Room ID recommendations not yet implemented",
      });
    }
  );
}

