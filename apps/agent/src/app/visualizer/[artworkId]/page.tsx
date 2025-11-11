"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoomVisualizer } from "@/components/RoomVisualizer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VisualizerPage() {
  const params = useParams();
  const router = useRouter();
  const artworkId = params.artworkId as string;
  const [artwork, setArtwork] = useState<any>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get artwork from API
        const artworkResponse = await fetch(`${API_URL}/api/artworks/${artworkId}`);
        if (!artworkResponse.ok) {
          throw new Error("Artwork not found");
        }
        const artworkData = await artworkResponse.json();
        setArtwork(artworkData);

        // Get room image from sessionStorage (from search results)
        const stored = sessionStorage.getItem("searchResults");
        if (stored) {
          const data = JSON.parse(stored);
          // Try to get room image from criteria
          if (data.criteria?.roomAnalysis) {
            // Room image should be stored separately, for now we'll use a placeholder
            // In production, you'd store the uploaded image in sessionStorage
            const roomImageData = sessionStorage.getItem("roomImage");
            if (roomImageData) {
              setRoomImage(roomImageData);
            }
          }
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load artwork");
        setIsLoading(false);
      }
    };

    if (artworkId) {
      loadData();
    }
  }, [artworkId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error || "Artwork not found"}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Artwork Info */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="relative aspect-square mb-4">
                <Image
                  src={artwork.imageUrls?.[0] || "/placeholder.jpg"}
                  alt={artwork.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h2 className="text-xl font-semibold mb-1">{artwork.title}</h2>
              <p className="text-muted-foreground mb-2">{artwork.studioName}</p>
              <p className="text-2xl font-bold mb-4">
                {artwork.currency} {artwork.price.toLocaleString()}
              </p>
              <Button className="w-full" asChild>
                <a
                  href={`https://atelie.art/artworks/${artwork.objectID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Atelie.art
                </a>
              </Button>
            </Card>
          </div>

          {/* Visualizer */}
          <div className="md:col-span-2">
            <RoomVisualizer artwork={artwork} roomImage={roomImage} />
          </div>
        </div>
      </div>
    </div>
  );
}

