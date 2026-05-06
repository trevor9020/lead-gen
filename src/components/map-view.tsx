"use client";

import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { DiscoverResult, MapCenter } from "@/lib/map-types";
import { scoreToColor } from "@/lib/map-types";

const LIBRARIES: ("places")[] = ["places"];

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a3e" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b6b7b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e1e32" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b6b7b" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e1e32" }] },
];

interface MapViewProps {
  results: DiscoverResult[];
  center: MapCenter;
  radius: number;
  onCenterChange: (center: MapCenter) => void;
  onSelectPin: (result: DiscoverResult) => void;
  selectedPin: DiscoverResult | null;
}

export function MapView({
  results,
  center,
  radius,
  onCenterChange,
  onSelectPin,
  selectedPin,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onCenterChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    },
    [onCenterChange]
  );

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card-bg rounded-xl">
        <p className="text-muted text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full rounded-xl"
      center={center}
      zoom={14}
      onLoad={onLoad}
      onClick={handleMapClick}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      <Circle
        center={center}
        radius={radius}
        options={{
          fillColor: "#f97316",
          fillOpacity: 0.08,
          strokeColor: "#f97316",
          strokeOpacity: 0.4,
          strokeWeight: 2,
        }}
      />

      <Marker
        position={center}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }}
        title="Search center"
      />

      {results.map((r) => {
        const color = scoreToColor(r.audit.score, r.audit.maxScore);
        return (
          <Marker
            key={r.placeId}
            position={{ lat: r.lat, lng: r.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 1.5,
            }}
            title={`${r.name} (${r.audit.score}/${r.audit.maxScore})`}
            onClick={() => {
              setInfoOpen(r.placeId);
              onSelectPin(r);
            }}
          >
            {infoOpen === r.placeId && (
              <InfoWindow onCloseClick={() => setInfoOpen(null)}>
                <div style={{ color: "#1a1a1a", minWidth: 180, padding: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {r.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    {r.vicinity}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: color,
                      }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {r.audit.score}/{r.audit.maxScore}
                    </span>
                    <span style={{ fontSize: 11, color: "#999" }}>
                      video score
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
}
