"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalysisStats, AIAnalysisResult } from "@atelie/shared";
import { RefreshCw, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

const API_URL = "/api";

interface BatchStatusProps {
  onSelectAnalysis?: (_id: string) => void;
}

export function BatchStatus({ onSelectAnalysis }: BatchStatusProps) {
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/analysis/status`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data: AnalysisStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats to prevent crash
      setStats({
        total: 0,
        pending: 0,
        processing: 0,
        done: 0,
        failed: 0,
        successRate: 0,
      });
    }
  };

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`${API_URL}/analysis?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      setAnalyses(data.results || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      // Set empty array to prevent crash
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAnalyses();
    const interval = setInterval(() => {
      fetchStats();
      fetchAnalyses();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleRetry = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/analysis/retry/${id}`, {
        method: "POST",
      });
      if (response.ok) {
        fetchStats();
        fetchAnalyses();
      }
    } catch (error) {
      console.error("Error retrying:", error);
    }
  };

  const progress = stats
    ? stats.total > 0
      ? ((stats.done + stats.failed) / stats.total) * 100
      : 0
    : 0;

  return (
    <div className="space-y-6">
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.done}</div>
                <div className="text-sm text-muted-foreground">Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm">
                <span className="font-semibold">Success Rate: </span>
                <span>{stats.successRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => { fetchStats(); fetchAnalyses(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card
              key={analysis.id}
              className={`cursor-pointer hover:bg-accent/50 ${
                analysis.status === "done" ? "border-green-500" : ""
              } ${analysis.status === "failed" ? "border-red-500" : ""}`}
              onClick={() => onSelectAnalysis?.(analysis.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {analysis.status === "done" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {analysis.status === "processing" && (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                      {analysis.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {analysis.status === "failed" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">{analysis.title}</h3>
                      <span className="text-xs text-muted-foreground">({analysis.studioName})</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Artwork ID: {analysis.artworkId}
                    </p>
                    {analysis.error && (
                      <p className="text-sm text-red-600 mt-2">{analysis.error}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(analysis.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {analysis.status === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(analysis.id);
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {analyses.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No analyses found
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

