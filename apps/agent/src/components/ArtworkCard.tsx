"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchResult } from "@atelie/shared";
import { ExternalLink, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ArtworkCardProps {
  match: MatchResult;
  index: number;
}

export function ArtworkCard({ match, index }: ArtworkCardProps) {
  const { artwork, score, reasons, confidence } = match;
  const imageUrl = artwork.imageUrls?.[0] || "/placeholder.jpg";

  const getConfidenceColor = () => {
    switch (confidence) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge
              variant="secondary"
              className={`${getConfidenceColor()} text-white font-semibold`}
            >
              {Math.round(score)}% match
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{artwork.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{artwork.studioName}</p>
          <p className="text-lg font-bold mb-3">
            {artwork.currency} {artwork.price.toLocaleString()}
          </p>
          {reasons.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Why it matches:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {reasons.map((reason, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/visualizer/${artwork.objectID}`}>
              <Eye className="h-4 w-4 mr-2" />
              View in Room
            </Link>
          </Button>
          <Button variant="default" size="sm" className="flex-1" asChild>
            <a
              href={`https://atelie.art/artworks/${artwork.objectID}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Atelie
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

