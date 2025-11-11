import { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import { prisma } from "@atelie/db";
import {
  enqueueAnalysisRequestSchema,
  type AnalysisStats,
  type AIAnalysisResult,
} from "@atelie/shared";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const analysisQueue = new Queue("artwork-analysis", {
  connection: {
    url: redisUrl,
  },
});

export async function analysisRoutes(fastify: FastifyInstance) {
  // Enqueue artworks for analysis
  fastify.post<{ Body: any }>("/enqueue", async (request, reply) => {
    const body = enqueueAnalysisRequestSchema.parse(request.body);
    const { artworkIds } = body;

    const jobs = [];

    for (const artworkId of artworkIds) {
      // Check if already exists and is done
      const existing = await prisma.artworkAnalysis.findUnique({
        where: { artworkId },
      });

      if (existing?.status === "done") {
        continue; // Skip already analyzed
      }

      // Create or update record
      await prisma.artworkAnalysis.upsert({
        where: { artworkId },
        create: {
          artworkId,
          status: "pending",
          imageUrl: "", // Will be fetched by worker
          title: "",
          studioName: "",
          source: "algolia",
          analysisVersion: 1,
          analysisDate: new Date(),
        },
        update: {
          status: "pending",
          error: null,
        },
      });

      // Add to queue
      const job = await analysisQueue.add("analyze-artwork", {
        artworkId,
      });
      jobs.push(job.id);
    }

    return reply.send({
      success: true,
      enqueued: jobs.length,
      jobIds: jobs,
    });
  });

  // Get analysis status/stats
  fastify.get("/status", async (request, reply) => {
    const [pending, processing, done, failed] = await Promise.all([
      prisma.artworkAnalysis.count({ where: { status: "pending" } }),
      prisma.artworkAnalysis.count({ where: { status: "processing" } }),
      prisma.artworkAnalysis.count({ where: { status: "done" } }),
      prisma.artworkAnalysis.count({ where: { status: "failed" } }),
    ]);

    const total = pending + processing + done + failed;
    const successRate = total > 0 ? (done / total) * 100 : 0;

    const stats: AnalysisStats = {
      total,
      pending,
      processing,
      done,
      failed,
      successRate: Math.round(successRate * 100) / 100,
    };

    return reply.send(stats);
  });

  // Get single analysis result
  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { id } = request.params;

    const analysis = await prisma.artworkAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return reply.code(404).send({ error: "Analysis not found" });
    }

    const result: AIAnalysisResult = {
      id: analysis.id,
      artworkId: analysis.artworkId,
      status: analysis.status as any,
      analysisDate: analysis.analysisDate instanceof Date ? analysis.analysisDate : analysis.analysisDate.toDate(),
      imageUrl: analysis.imageUrl,
      title: analysis.title,
      studioName: analysis.studioName,
      aiData: analysis.aiData as any,
      error: analysis.error ?? null,
      createdAt: analysis.createdAt instanceof Date ? analysis.createdAt : analysis.createdAt.toDate(),
      updatedAt: analysis.updatedAt instanceof Date ? analysis.updatedAt : analysis.updatedAt.toDate(),
    };

    return reply.send(result);
  });

  // Get analysis by artworkId
  fastify.get<{ Params: { artworkId: string } }>(
    "/artwork/:artworkId",
    async (request, reply) => {
      const { artworkId } = request.params;

      const analysis = await prisma.artworkAnalysis.findUnique({
        where: { artworkId },
      });

      if (!analysis) {
        return reply.code(404).send({ error: "Analysis not found" });
      }

      const result: AIAnalysisResult = {
        id: analysis.id,
        artworkId: analysis.artworkId,
        status: analysis.status as any,
        analysisDate: analysis.analysisDate instanceof Date ? analysis.analysisDate : (analysis.analysisDate as any).toDate(),
        imageUrl: analysis.imageUrl,
        title: analysis.title,
        studioName: analysis.studioName,
        aiData: analysis.aiData as any,
        error: analysis.error ?? null,
        createdAt: analysis.createdAt instanceof Date ? analysis.createdAt : (analysis.createdAt as any).toDate(),
        updatedAt: analysis.updatedAt instanceof Date ? analysis.updatedAt : (analysis.updatedAt as any).toDate(),
      };

      return reply.send(result);
    }
  );

  // Retry failed analysis
  fastify.post<{ Params: { id: string } }>("/retry/:id", async (request, reply) => {
    const { id } = request.params;

    const analysis = await prisma.artworkAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return reply.code(404).send({ error: "Analysis not found" });
    }

    await prisma.artworkAnalysis.update({
      where: { id },
      data: {
        status: "pending",
        error: null,
      },
    });

    await analysisQueue.add("analyze-artwork", {
      artworkId: analysis.artworkId,
    });

    return reply.send({ success: true });
  });

  // List all analyses with filters
  fastify.get<{ Querystring: { status?: string; limit?: number; offset?: number } }>(
    "/",
    async (request, reply) => {
      const { status, limit = 50, offset = 0 } = request.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [analyses, total] = await Promise.all([
        prisma.artworkAnalysis.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: "desc" },
        }),
        prisma.artworkAnalysis.count({ where }),
      ]);

      const results: AIAnalysisResult[] = analyses.map((analysis) => ({
        id: analysis.id,
        artworkId: analysis.artworkId,
        status: analysis.status as any,
        analysisDate: analysis.analysisDate instanceof Date ? analysis.analysisDate : (analysis.analysisDate as any).toDate(),
        imageUrl: analysis.imageUrl,
        title: analysis.title,
        studioName: analysis.studioName,
        aiData: analysis.aiData as any,
        error: analysis.error ?? null,
        createdAt: analysis.createdAt instanceof Date ? analysis.createdAt : (analysis.createdAt as any).toDate(),
        updatedAt: analysis.updatedAt instanceof Date ? analysis.updatedAt : (analysis.updatedAt as any).toDate(),
      }));

      return reply.send({
        results,
        total,
        limit,
        offset,
      });
    }
  );

  // Export all analyses as JSON
  fastify.get("/export", async (request, reply) => {
    const analyses = await prisma.artworkAnalysis.findMany({
      where: { status: "done" },
      orderBy: { createdAt: "desc" },
    });

    const exportData = analyses.map((analysis) => ({
      id: analysis.id,
      artworkId: analysis.artworkId,
      analysisDate: analysis.analysisDate instanceof Date ? analysis.analysisDate : (analysis.analysisDate as any).toDate(),
      imageUrl: analysis.imageUrl,
      title: analysis.title,
      studioName: analysis.studioName,
      aiData: analysis.aiData,
    }));

    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", "attachment; filename=artwork-analyses.json");
    return reply.send(exportData);
  });
}

