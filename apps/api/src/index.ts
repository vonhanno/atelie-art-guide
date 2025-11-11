import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { artworkRoutes } from "./routes/artworks";
import { analysisRoutes } from "./routes/analysis";
import { searchRoutes } from "./routes/search";

const server = Fastify({
  logger: true,
});

async function start() {
  try {
    await server.register(helmet);
    await server.register(cors, {
      origin: [
        process.env.NEXTAUTH_URL || "http://localhost:3000",
        "http://localhost:3002", // Agent app
        process.env.AGENT_URL || "http://localhost:3002",
        // iOS app - allow all origins for mobile apps (iOS doesn't have CORS restrictions)
        // but we include common patterns for development
        true, // Allow all origins for mobile apps
      ],
    });

    await server.register(artworkRoutes, { prefix: "/api/artworks" });
    await server.register(analysisRoutes, { prefix: "/api/analysis" });
    await server.register(searchRoutes, { prefix: "/api/search" });

    const port = Number(process.env.API_PORT) || 3001;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 API server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

