"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AIAnalysisResult } from "@atelie/shared";
import { Download, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = "/api";

interface AnalysisPreviewProps {
  analysisId: string | null;
}

export function AnalysisPreview({ analysisId }: AnalysisPreviewProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [artworkIdInput, setArtworkIdInput] = useState("");

  const fetchAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analysis/${id}`);
      if (response.ok) {
        const data: AIAnalysisResult = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchByArtworkId = async () => {
    if (!artworkIdInput) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analysis/artwork/${artworkIdInput}`);
      if (response.ok) {
        const data: AIAnalysisResult = await response.json();
        setAnalysis(data);
        setArtworkIdInput("");
      } else {
        alert("Analysis not found");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      alert("Error fetching analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchAnalysis(analysisId);
    }
  }, [analysisId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleExport = () => {
    if (!analysis || !analysis.aiData) return;

    const dataStr = JSON.stringify(analysis.aiData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-${analysis.artworkId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReanalyze = async () => {
    if (!analysis) return;
    try {
      const response = await fetch(`${API_URL}/analysis/retry/${analysis.id}`, {
        method: "POST",
      });
      if (response.ok) {
        alert("Re-analysis queued successfully");
        setTimeout(() => fetchAnalysis(analysis.id), 2000);
      }
    } catch (error) {
      console.error("Error re-analyzing:", error);
    }
  };

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Select an analysis from the Batch Processing tab, or search by Artwork ID
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Enter Artwork ID"
                value={artworkIdInput}
                onChange={(e) => setArtworkIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchByArtworkId()}
              />
              <Button onClick={fetchByArtworkId}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{analysis.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                by {analysis.studioName} • ID: {analysis.artworkId}
              </p>
            </div>
            <div className="flex gap-2">
              {analysis.status === "done" && (
                <>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" onClick={handleReanalyze}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-analyze
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analysis.imageUrl && (
            <div className="mb-6">
              <img
                src={analysis.imageUrl}
                alt={analysis.title}
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}

          {analysis.status !== "done" && (
            <div className="text-center py-8 text-muted-foreground">
              {analysis.status === "processing" && "Analysis in progress..."}
              {analysis.status === "pending" && "Analysis pending..."}
              {analysis.status === "failed" && `Analysis failed: ${analysis.error || "Unknown error"}`}
            </div>
          )}

          {analysis.status === "done" && analysis.aiData && (
            <div className="space-y-4">
              {Object.entries(analysis.aiData).map(([key, value]) => {
                const isExpanded = expandedSections.has(key);
                return (
                  <Card key={key}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection(key)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

