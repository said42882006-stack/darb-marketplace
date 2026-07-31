"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __darbMapsCallback?: () => void;
  }
}

export interface LocationValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export default function LocationPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markerObj = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!apiKey) return; // no key configured — fall back to plain text input below
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !mapRef.current) return;
        const google = window.google;

        const center = { lat: value.lat ?? 24.7136, lng: value.lng ?? 46.6753 }; // default: Riyadh
        mapObj.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: value.lat ? 14 : 6,
          disableDefaultUI: true,
          zoomControl: true,
        });
        markerObj.current = new google.maps.Marker({
          position: center,
          map: mapObj.current,
          draggable: true,
        });

        markerObj.current.addListener("dragend", () => {
          const pos = markerObj.current.getPosition();
          onChange({ ...value, lat: pos.lat(), lng: pos.lng() });
        });

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          mapObj.current.setCenter({ lat, lng });
          mapObj.current.setZoom(15);
          markerObj.current.setPosition({ lat, lng });
          onChange({ address: place.formatted_address || place.name || "", lat, lng });
        });

        setReady(true);
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  if (!apiKey || failed) {
    // Graceful fallback: plain address text field, no map dependency.
    return (
      <label className="text-sm font-medium text-ink block">
        {label}
        <input
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="المدينة والحي"
        />
        {!apiKey && (
          <span className="text-[11px] text-muted mt-1 block">
            لتفعيل البحث والتحديد على الخريطة، أضف NEXT_PUBLIC_GOOGLE_MAPS_API_KEY في ملف .env
          </span>
        )}
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink block">
        {label}
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2">
          <MapPin className="w-4 h-4 text-teal shrink-0" />
          <input
            ref={inputRef}
            defaultValue={value.address}
            className="w-full text-sm focus:outline-none"
            placeholder="ابحث عن العنوان..."
          />
        </div>
      </label>
      <div ref={mapRef} className="w-full h-48 rounded-lg border border-line" />
      {ready && <span className="text-[11px] text-muted">اسحب الدبوس لتحديد الموقع بدقة</span>}
    </div>
  );
}
