"use client";

import { useEffect, useRef } from "react";

interface Marker {
  lat: number;
  lng: number;
  label: string;
}

interface NaverMapProps {
  markers: Marker[];
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (opts: Record<string, unknown>) => unknown;
        LatLngBounds: new () => { extend: (latlng: unknown) => void };
        Event: { addListener: (map: unknown, event: string, cb: () => void) => void };
      };
    };
  }
}

export default function NaverMap({ markers }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (!mapRef.current || !clientId) return;

    function initMap() {
      if (!mapRef.current || !window.naver) return;
      const center = markers[0] || { lat: 37.5665, lng: 126.978 };

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 12,
      });

      markers.forEach((m) => {
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(m.lat, m.lng),
          map,
          title: m.label,
        });
      });
    }

    if (window.naver?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [markers, clientId]);

  if (!clientId) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        네이버 지도: NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 .env.local에 설정하세요
      </div>
    );
  }

  return <div ref={mapRef} className="h-56 w-full rounded-lg" />;
}
