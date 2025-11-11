import { SearchInterface } from "@/components/SearchInterface";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <SearchInterface />
      </div>
    </main>
  );
}

