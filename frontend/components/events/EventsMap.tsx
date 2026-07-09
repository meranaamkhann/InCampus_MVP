"use client";

import { useEffect, useRef, useState } from "react";
import type { EventDto } from "@/types";

declare global {
  interface Window {
    google?: typeof google;
    __incampusMapsCallback?: () => void;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    window.__incampusMapsCallback = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__incampusMapsCallback`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

// Default center: Greater Noida / Delhi-NCR, since that's where most seeded
// colleges in this MVP are. Swap to the user's own college coordinates once
// colleges have a lat/lng of their own (currently only Events do).
const DEFAULT_CENTER = { lat: 28.4744, lng: 77.5040 };

export function EventsMap({ events }: { events: EventDto[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key not configured (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)");
      return;
    }
    if (!mapRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;

        const withCoords = events.filter((e) => e.latitude != null && e.longitude != null);
        const center = withCoords.length > 0
          ? { lat: withCoords[0].latitude as number, lng: withCoords[0].longitude as number }
          : DEFAULT_CENTER;

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: withCoords.length > 0 ? 13 : 11,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [{ elementType: "geometry", stylers: [{ color: "#1a1f2e" }] }], // dark-ish base; fine default otherwise
        });

        const infoWindow = new window.google.maps.InfoWindow();

        withCoords.forEach((event) => {
          const marker = new window.google!.maps.Marker({
            position: { lat: event.latitude as number, lng: event.longitude as number },
            map,
            title: event.title,
          });
          marker.addListener("click", () => {
            infoWindow.setContent(
              `<div style="color:#111;font-family:sans-serif;padding:2px 4px">
                 <strong>${event.title}</strong><br/>
                 <span style="font-size:12px">${event.location ?? ""}</span>
               </div>`
            );
            infoWindow.open(map, marker);
          });
        });
      })
      .catch(() => setError("Couldn't load Google Maps"));

    return () => {
      cancelled = true;
    };
  }, [apiKey, events]);

  if (error) {
    return (
      <div className="glass flex h-96 items-center justify-center rounded-2xl p-6 text-center text-sm text-ink-muted">
        {error}
      </div>
    );
  }

  return <div ref={mapRef} className="h-96 w-full overflow-hidden rounded-2xl border border-border" />;
}
