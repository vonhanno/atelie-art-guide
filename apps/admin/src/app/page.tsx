"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtworkSearch } from "@/components/ArtworkSearch";
import { BatchStatus } from "@/components/BatchStatus";
import { AnalysisPreview } from "@/components/AnalysisPreview";

export default function Home() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary/10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">Atelie Art Analysis Admin</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered artwork analysis platform for recommendation and visualization
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search & Select</TabsTrigger>
            <TabsTrigger value="status">Batch Processing</TabsTrigger>
            <TabsTrigger value="preview">Analysis Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <ArtworkSearch />
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <BatchStatus onSelectAnalysis={setSelectedAnalysisId} />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <AnalysisPreview analysisId={selectedAnalysisId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

