"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AlgoliaArtwork, ArtworkSearchResponse } from "@atelie/shared";
import { Search, Loader2 } from "lucide-react";

const API_URL = "/api";

export function ArtworkSearch() {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const [availability, setAvailability] = useState("");
  const [technique, setTechnique] = useState("");
  const [artworks, setArtworks] = useState<AlgoliaArtwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [enqueueing, setEnqueueing] = useState(false);

  const searchArtworks = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        hitsPerPage: "20",
      });
      if (query) params.append("q", query);
      if (artist) params.append("artist", artist);
      if (availability) params.append("availability", availability);
      if (technique) params.append("technique", technique);

      const response = await fetch(`${API_URL}/api/artworks/search?${params}`);
      const data: ArtworkSearchResponse = await response.json();

      if (pageNum === 1) {
        setArtworks(data.hits);
      } else {
        setArtworks((prev) => [...prev, ...data.hits]);
      }
      setPage(data.page);
      setTotalPages(data.nbPages);
    } catch (error) {
      console.error("Error searching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchArtworks(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, artist, availability, technique]);

  const toggleSelection = (artworkId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) {
        next.delete(artworkId);
      } else {
        next.add(artworkId);
      }
      return next;
    });
  };

  const handleEnqueue = async () => {
    if (selectedIds.size === 0) return;

    setEnqueueing(true);
    try {
      const response = await fetch(`${API_URL}/api/analysis/enqueue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkIds: Array.from(selectedIds) }),
      });

      if (response.ok) {
        setSelectedIds(new Set());
        setShowConfirmDialog(false);
        alert(`Successfully enqueued ${selectedIds.size} artwork(s) for analysis`);
      } else {
        alert("Failed to enqueue artworks");
      }
    } catch (error) {
      console.error("Error enqueueing:", error);
      alert("Error enqueueing artworks");
    } finally {
      setEnqueueing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search artworks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  placeholder="Filter by artist..."
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technique">Technique</Label>
                <Input
                  id="technique"
                  placeholder="Filter by technique..."
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size} artwork(s) selected
        </div>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={selectedIds.size === 0}
        >
          Add Selected to Analysis Queue
        </Button>
      </div>

      {loading && artworks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artworks.map((artwork) => (
            <Card
              key={artwork.objectID}
              className={`cursor-pointer transition-all ${
                selectedIds.has(artwork.objectID) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => toggleSelection(artwork.objectID)}
            >
              <CardContent className="p-4">
                <div className="relative aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                  {artwork.imageUrls?.[0] && (
                    <img
                      src={artwork.imageUrls[0]}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedIds.has(artwork.objectID)}
                      onCheckedChange={() => toggleSelection(artwork.objectID)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm truncate">{artwork.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{artwork.studioName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {artwork.price} {artwork.currency}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {page < totalPages && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => searchArtworks(page + 1)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enqueue</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {selectedIds.size} artwork(s) to the analysis queue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnqueue} disabled={enqueueing}>
              {enqueueing ? "Enqueueing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

