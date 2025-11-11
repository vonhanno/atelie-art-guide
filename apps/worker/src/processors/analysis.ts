import { prisma } from "@atelie/db";
import algoliasearch from "algoliasearch";
import OpenAI from "openai";
import { aiAnalysisDataSchema, type AIAnalysisData } from "@atelie/shared";

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);
const index = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME || "artworks");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 3;

export async function processAnalysisJob(artworkId: string): Promise<void> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Update status to processing
      await prisma.artworkAnalysis.update({
        where: { artworkId },
        data: { status: "processing" },
      });

      // Fetch artwork from Algolia
      const algoliaResult = await index.getObject(artworkId);
      const artwork = algoliaResult as any;

      if (!artwork) {
        throw new Error(`Artwork ${artworkId} not found in Algolia`);
      }

      const imageUrl = artwork.imageUrls?.[0];
      if (!imageUrl) {
        throw new Error(`No image URL found for artwork ${artworkId}`);
      }

      // Update artwork metadata
      await prisma.artworkAnalysis.update({
        where: { artworkId },
        data: {
          imageUrl,
          title: artwork.title || "",
          studioName: artwork.studioName || "",
        },
      });

      // Perform AI analysis
      const aiData = await analyzeArtwork(imageUrl, artwork);

      // Save result
      await prisma.artworkAnalysis.update({
        where: { artworkId },
        data: {
          status: "done",
          aiData: aiData as any,
          error: null,
          analysisDate: new Date(),
        },
      });

      console.log(`✅ Successfully analyzed artwork ${artworkId}`);
      return;
    } catch (error: any) {
      lastError = error;
      retryCount++;
      console.error(
        `❌ Error processing artwork ${artworkId} (attempt ${retryCount}/${MAX_RETRIES}):`,
        error.message
      );

      if (retryCount >= MAX_RETRIES) {
        // Mark as failed
        await prisma.artworkAnalysis.update({
          where: { artworkId },
          data: {
            status: "failed",
            error: error.message || "Unknown error",
          },
        });
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw lastError || new Error("Failed to process artwork");
}

async function analyzeArtwork(
  imageUrl: string,
  artwork: any
): Promise<AIAnalysisData> {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "openai") {
    return await analyzeWithOpenAI(imageUrl, artwork);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function analyzeWithOpenAI(imageUrl: string, artwork: any): Promise<AIAnalysisData> {
  const prompt = `Analyze this artwork image and provide a comprehensive analysis in JSON format. The artwork title is "${artwork.title || "Unknown"}" by "${artwork.studioName || "Unknown"}".

Return a JSON object with the following structure:
{
  "basicVisualProperties": {
    "dominantColors": ["color1", "color2", ...],
    "secondaryColors": ["color1", "color2", ...],
    "colorTemperature": "warm" | "cool" | "neutral",
    "colorPalette": ["color1", "color2", ...]
  },
  "textureAnalysis": {
    "textureType": "description",
    "textureDescription": "detailed description",
    "surfaceQuality": "description"
  },
  "styleAndGenre": {
    "style": "art style",
    "genre": "genre",
    "movement": "art movement (optional)",
    "period": "time period (optional)"
  },
  "subjectMatter": {
    "primarySubject": "main subject",
    "secondarySubjects": ["subject1", "subject2", ...],
    "themes": ["theme1", "theme2", ...],
    "narrative": "narrative description (optional)"
  },
  "mediumAndTechnique": {
    "medium": "medium type",
    "technique": "technique used",
    "materials": ["material1", "material2", ...]
  },
  "composition": {
    "layout": "layout description",
    "focalPoint": "focal point description",
    "balance": "balance description",
    "perspective": "perspective (optional)"
  },
  "spaceAndDisplay": {
    "recommendedRoomTypes": ["room1", "room2", ...],
    "recommendedWallColor": ["color1", "color2", ...],
    "lightingRecommendations": ["recommendation1", ...],
    "sizeRecommendations": "size recommendation"
  },
  "psychologicalImpact": {
    "mood": ["mood1", "mood2", ...],
    "energyLevel": "low" | "medium" | "high",
    "emotionalTone": "emotional tone description"
  },
  "marketAnalysis": {
    "targetAudience": ["audience1", "audience2", ...],
    "priceRange": "price range (optional)",
    "collectibility": "low" | "medium" | "high"
  },
  "tags": ["tag1", "tag2", "tag3", ...]
}

Be thorough and detailed in your analysis. Return ONLY valid JSON, no markdown formatting.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    return aiAnalysisDataSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error(`Failed to parse AI response: ${error}`);
  }
}

