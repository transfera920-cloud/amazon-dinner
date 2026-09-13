import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useCallback } from 'react';

const containerStyle = { width: '100%', height: '100%', minHeight: '440px' };

export default function MapView({
  origin,
  results,
  selectedPlaceId,
  onSelectPlace,
}: {
  origin: { lat: number; lng: number; formattedAddress: string } | null;
  results: any[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string | null) => void;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: (import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string) || '',
  });

  const selected = results.find((r) => r.placeId === selectedPlaceId) || null;

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      // Fit bounds to origin + all results whenever the map first mounts.
      if (!origin || results.length === 0) return;
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: origin.lat, lng: origin.lng });
      results.forEach((r) => bounds.extend({ lat: r.lat, lng: r.lng }));
      map.fitBounds(bounds);
    },
    [origin, results]
  );

  if (loadError) {
    return (
      <div className="map-error bg-[#fdf4f4] border border-[#f5c6cb] text-[#842029] rounded-xl p-5 text-sm my-3 shadow-sm">
        地圖載入失敗，請確認 VITE_GOOGLE_MAPS_BROWSER_KEY 設定正確。
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="map-loading bg-white border border-[#d6ded9] text-[#52635c] rounded-xl p-12 text-center text-sm font-medium shadow-sm min-h-[440px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#1e3a2f]/20 border-t-[#1e3a2f] rounded-full animate-spin"></div>
          <div>地圖載入中...</div>
        </div>
      </div>
    );
  }
  if (!origin) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-[440px] lg:min-h-[560px] rounded-xl overflow-hidden border border-[#d6ded9] shadow-sm relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: origin.lat, lng: origin.lng }}
        zoom={13}
        onLoad={handleMapLoad}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* A. Trailhead as the search origin */}
        <Marker
          position={{ lat: origin.lat, lng: origin.lng }}
          label="起"
          title={origin.formattedAddress}
        />

        {/* B. Search results */}
        {results.map((r) => (
          <Marker
            key={r.placeId}
            position={{ lat: r.lat, lng: r.lng }}
            onClick={() => onSelectPlace(r.placeId)}
            animation={
              r.placeId === selectedPlaceId ? window.google.maps.Animation.BOUNCE : undefined
            }
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => onSelectPlace(null)}
          >
            <div className="info-window p-1 max-w-[260px] font-sans">
              <strong className="block text-sm font-bold text-[#192723] mb-1 leading-snug">
                {selected.name}
              </strong>
              <div className="text-xs text-[#52635c] mb-1.5 leading-relaxed">{selected.address}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                {selected.rating != null && (
                  <div className="inline-flex items-center text-[#92400e] font-medium">
                    評分：{selected.rating} ⭐
                  </div>
                )}
                {selected.openNow != null && (
                  <div
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      selected.openNow ? 'bg-[#e8f5e9] text-[#1e4620]' : 'bg-[#fbe9e7] text-[#9a2818]'
                    }`}
                  >
                    {selected.openNow ? '營業中' : '已打烊'}
                  </div>
                )}
              </div>
              <a
                href={selected.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold text-[#1e3a2f] hover:underline"
              >
                在 Google Maps 開啟
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
