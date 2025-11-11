"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MatchResult, RoomAnalysis, TextQueryCriteria } from "@atelie/shared";
import { Filter, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type SortOption = "best-match" | "price-low" | "price-high" | "newest" | "random";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MatchResult[]>([]);
  const [criteria, setCriteria] = useState<{
    roomAnalysis?: RoomAnalysis;
    textCriteria?: TextQueryCriteria;
  } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("best-match");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [artistSearch, setArtistSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("searchResults");
    if (!stored) {
      router.push("/");
      return;
    }

    const data = JSON.parse(stored);
    setResults(data.results || []);
    setFilteredResults(data.results || []);
    setCriteria(data.criteria || null);

    // Set initial price range from results
    if (data.results?.length > 0) {
      const prices = data.results.map((r: MatchResult) => r.artwork.price);
      const maxPrice = Math.max(...prices);
      setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
    }
  }, [router]);

  useEffect(() => {
    let filtered = [...results];

    // Price filter
    filtered = filtered.filter(
      (r) => r.artwork.price >= priceRange[0] && r.artwork.price <= priceRange[1]
    );

    // Style filter
    if (selectedStyles.length > 0) {
      filtered = filtered.filter((r) => {
        if (!r.analysis) return false;
        const artworkStyle = r.analysis.styleAndGenre.style.toLowerCase();
        return selectedStyles.some((s) => artworkStyle.includes(s.toLowerCase()));
      });
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((r) => {
        if (!r.analysis) return false;
        const artworkColors = r.analysis.basicVisualProperties.dominantColors.map((c) =>
          c.toLowerCase()
        );
        return selectedColors.some((c) =>
          artworkColors.some((ac) => ac.includes(c.toLowerCase()))
        );
      });
    }

    // Artist filter
    if (artistSearch.trim()) {
      filtered = filtered.filter((r) =>
        r.artwork.studioName.toLowerCase().includes(artistSearch.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "best-match":
        filtered.sort((a, b) => b.score - a.score);
        break;
      case "price-low":
        filtered.sort((a, b) => a.artwork.price - b.artwork.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.artwork.price - a.artwork.price);
        break;
      case "newest":
        filtered.sort((a, b) => {
          const yearA = a.artwork.year || 0;
          const yearB = b.artwork.year || 0;
          return yearB - yearA;
        });
        break;
      case "random":
        filtered = filtered.sort(() => Math.random() - 0.5);
        break;
    }

    setFilteredResults(filtered);
  }, [results, sortBy, priceRange, selectedStyles, selectedColors, artistSearch]);

  const availableStyles = Array.from(
    new Set(
      results
        .map((r) => r.analysis?.styleAndGenre.style)
        .filter((s): s is string => !!s)
    )
  );

  const availableColors = Array.from(
    new Set(
      results
        .flatMap((r) => r.analysis?.basicVisualProperties.dominantColors || [])
        .filter((c): c is string => !!c)
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Search
            </Button>
            <h1 className="text-3xl font-serif font-bold mt-2">
              {filteredResults.length} Artwork{filteredResults.length !== 1 ? "s" : ""} Found
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-match">Best Match</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-64 space-y-4`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: {priceRange[0]} - {priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    min={0}
                    max={priceRange[1] || 10000}
                    step={100}
                  />
                </div>

                {/* Styles */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Styles</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableStyles.slice(0, 10).map((style) => (
                      <div key={style} className="flex items-center space-x-2">
                        <Checkbox
                          id={`style-${style}`}
                          checked={selectedStyles.includes(style)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStyles([...selectedStyles, style]);
                            } else {
                              setSelectedStyles(selectedStyles.filter((s) => s !== style));
                            }
                          }}
                        />
                        <label
                          htmlFor={`style-${style}`}
                          className="text-sm cursor-pointer capitalize"
                        >
                          {style}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Colors</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableColors.slice(0, 10).map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedColors([...selectedColors, color]);
                            } else {
                              setSelectedColors(selectedColors.filter((c) => c !== color));
                            }
                          }}
                        />
                        <label
                          htmlFor={`color-${color}`}
                          className="text-sm cursor-pointer capitalize"
                        >
                          {color}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Artist Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Artist</label>
                  <Input
                    placeholder="Search artist..."
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                  />
                </div>

                {/* Clear Filters */}
                {(selectedStyles.length > 0 ||
                  selectedColors.length > 0 ||
                  artistSearch.trim() ||
                  priceRange[0] > 0 ||
                  priceRange[1] < (priceRange[1] || 10000)) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedStyles([]);
                      setSelectedColors([]);
                      setArtistSearch("");
                      const prices = results.map((r) => r.artwork.price);
                      const maxPrice = Math.max(...prices);
                      setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No artworks match your filters.</p>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Start New Search
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((match, index) => (
                  <ArtworkCard key={match.artworkId} match={match} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

