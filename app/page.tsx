"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface PropertyData {
  price: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  photos: string[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call scrape API
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json();
        throw new Error(
          errorData.error || "Failed to scrape property data"
        );
      }

      const propertyData: PropertyData = await scrapeResponse.json();

      // Store data in sessionStorage for the results page
      sessionStorage.setItem("propertyData", JSON.stringify(propertyData));

      // Redirect to results page
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Hero Image */}
          <div className="flex items-center justify-center">
            <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-xl font-semibold">Real Estate Hero</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Find Your Perfect Property
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Enter a property URL to get instant insights and analysis powered by AI.
              </p>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Paste property listing URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  required
                  disabled={loading}
                />
                <Button type="submit" className="px-6" disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Works with most real estate listing platforms
              </p>
            </form>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
