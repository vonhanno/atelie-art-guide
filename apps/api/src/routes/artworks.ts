import { FastifyInstance } from "fastify";
import algoliasearch from "algoliasearch";
import { artworkSearchQuerySchema, type ArtworkSearchResponse } from "@atelie/shared";

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);
const index = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME || "artworks");

export async function artworkRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: any }>("/search", async (request, reply) => {
    const query = artworkSearchQuerySchema.parse(request.query);

    const searchParams: any = {
      page: query.page - 1,
      hitsPerPage: query.hitsPerPage,
    };

    let searchQuery = query.q || "";

    // Build filters
    const filters: string[] = [];
    if (query.artist) {
      filters.push(`studioName:"${query.artist}"`);
    }
    if (query.availability) {
      filters.push(`status:"${query.availability}"`);
    }
    if (query.technique) {
      filters.push(`techniques:"${query.technique}"`);
    }

    if (filters.length > 0) {
      searchParams.filters = filters.join(" AND ");
    }

    const result = await index.search(searchQuery, searchParams);

    const response: ArtworkSearchResponse = {
      hits: result.hits as any[],
      nbHits: result.nbHits,
      page: result.page + 1,
      nbPages: result.nbPages,
      hitsPerPage: result.hitsPerPage,
    };

    return reply.send(response);
  });

  // Get single artwork by ID
  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { id } = request.params;

    try {
      const artwork = await index.getObject(id);
      return reply.send(artwork);
    } catch (error: any) {
      if (error.status === 404) {
        return reply.code(404).send({ error: "Artwork not found" });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch artwork" });
    }
  });
}

