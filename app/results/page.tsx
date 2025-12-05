"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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

interface VoiceResponse {
  audioUrl: string;
  script: string;
}

export default function Results() {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [audio, setAudio] = useState<VoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get property data from sessionStorage
    const data = sessionStorage.getItem("propertyData");
    if (data) {
      setProperty(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  const handleGenerateVoice = async () => {
    if (!property) return;

    setGeneratingVoice(true);
    setError("");

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate voiceover");
      }

      const voiceData: VoiceResponse = await response.json();
      setAudio(voiceData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setGeneratingVoice(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!property || !audio) {
      setError("Please generate voiceover first");
      return;
    }

    setRenderingVideo(true);
    setError("");

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: property.photos,
          audioUrl: audio.audioUrl,
          price: property.price,
          address: property.address,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to render video");
      }

      const { videoUrl: url } = await response.json();
      setVideoUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setRenderingVideo(false);
    }
  };

  if (!property) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {property.address}
          </h1>
          <p className="text-3xl font-bold text-blue-600">{property.price}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Info */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.photos.slice(0, 6).map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-200"
                  >
                    <Image
                      src={photo}
                      alt={`Property ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing {Math.min(6, property.photos.length)} of {property.photos.length} photos
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Details</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">
                    {property.beds}
                  </div>
                  <div className="text-gray-600 text-sm">Bedrooms</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.floor(property.baths)}
                  </div>
                  <div className="text-gray-600 text-sm">Bathrooms</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">
                    {(property.sqft / 1000).toFixed(1)}k
                  </div>
                  <div className="text-gray-600 text-sm">Sq Ft</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Create Video</h2>

              {/* Step 1: Generate Voiceover */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    1
                  </span>
                  Generate Voiceover
                </h3>
                <Button
                  onClick={handleGenerateVoice}
                  disabled={generatingVoice || audio !== null}
                  className="w-full"
                  variant={audio ? "outline" : "default"}
                >
                  {generatingVoice ? "Generating..." : audio ? "✓ Done" : "Generate"}
                </Button>
                {audio && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      Voiceover generated successfully
                    </p>
                    <audio
                      controls
                      src={audio.audioUrl}
                      className="w-full mt-2 h-8"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Render Video */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-full w-6 h-6 flex items-center justify-center text-sm ${
                      audio
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </span>
                  Render Video
                </h3>
                <Button
                  onClick={handleGenerateVideo}
                  disabled={renderingVideo || !audio || videoUrl !== ""}
                  className="w-full"
                  variant={videoUrl ? "outline" : "default"}
                >
                  {renderingVideo ? "Rendering..." : videoUrl ? "✓ Done" : "Render"}
                </Button>
              </div>

              {/* Result */}
              {videoUrl && (
                <div className="bg-green-50 rounded border border-green-200 p-4">
                  <p className="text-sm font-semibold text-green-900 mb-3">
                    Your video is ready!
                  </p>
                  <video
                    controls
                    src={videoUrl}
                    className="w-full rounded mb-3"
                  />
                  <a
                    href={videoUrl}
                    download
                    className="inline-block w-full text-center bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
                  >
                    Download Video
                  </a>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
