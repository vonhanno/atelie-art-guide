import { Worker } from "bullmq";
import { processAnalysisJob } from "./processors/analysis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const concurrency = Number(process.env.WORKER_CONCURRENCY) || 3;

console.log(`🚀 Starting worker with concurrency: ${concurrency}`);

const worker = new Worker(
  "artwork-analysis",
  async (job) => {
    console.log(`Processing job ${job.id} for artwork ${job.data.artworkId}`);
    return await processAnalysisJob(job.data.artworkId);
  },
  {
    connection: {
      url: redisUrl,
    },
    concurrency,
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 1000,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...");
  await worker.close();
  process.exit(0);
});

