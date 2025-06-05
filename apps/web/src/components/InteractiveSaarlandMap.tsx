'use client'

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Info, Calendar, Euro, ExternalLink } from 'lucide-react';

// Fix für Leaflet Marker Icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface POI {
  id: string;
  name: string;
  kategorie: string;
  lat: number;
  lon: number;
  beschreibung: string;
  url?: string;
  oeffnungszeiten?: string;
  eintritt?: string;
  adresse?: string;
  ticket_url?: string;
}

interface InteractiveSaarlandMapProps {
  height?: string;
  showPOIs?: boolean;
  onLocationSelect?: (poi: POI) => void;
}

export default function InteractiveSaarlandMap({
  height = '500px',
  showPOIs = true,
  onLocationSelect
}: InteractiveSaarlandMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [pois, setPOIs] = useState<Record<string, POI[]>>({});
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialisiere Karte
    const map = L.map(mapRef.current).setView([49.3833, 6.9167], 10);
    mapInstanceRef.current = map;

    // OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Lade POIs
    if (showPOIs) {
      loadPOIs(map);
    }

    setLoading(false);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showPOIs]);

  const loadPOIs = async (map: L.Map) => {
    try {
      const response = await fetch('/api/realtime/maps/pois');
      const data = await response.json();
      
      if (data.status === 'success') {
        setPOIs(data.data);
        
        // Füge Marker für alle POIs hinzu
        Object.entries(data.data).forEach(([category, items]) => {
          (items as POI[]).forEach(poi => {
            const icon = getIconForCategory(category);
            
            const marker = L.marker([poi.lat, poi.lon], { icon })
              .addTo(map)
              .bindPopup(createPopupContent(poi));
            
            marker.on('click', () => {
              setSelectedPOI(poi);
              if (onLocationSelect) {
                onLocationSelect(poi);
              }
            });
          });
        });
      }
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  const getIconForCategory = (category: string) => {
    const iconConfig: Record<string, { color: string; symbol: string }> = {
      tourist_attractions: { color: '#3B82F6', symbol: '🏞️' },
      education: { color: '#10B981', symbol: '🎓' },
      culture: { color: '#8B5CF6', symbol: '🎭' },
      administration: { color: '#F59E0B', symbol: '🏛️' },
      business: { color: '#EF4444', symbol: '💼' },
      transport: { color: '#6B7280', symbol: '🚉' },
      healthcare: { color: '#EC4899', symbol: '🏥' },
      leisure: { color: '#14B8A6', symbol: '🛍️' },
      nature: { color: '#22C55E', symbol: '🌳' },
      cities: { color: '#0EA5E9', symbol: '🏘️' }
    };
    
    const config = iconConfig[category] || { color: '#9CA3AF', symbol: '📍' };
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${config.color}; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">${config.symbol}</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const createPopupContent = (poi: POI) => {
    return `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${poi.name}</h3>
        <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${poi.kategorie}</p>
        ${poi.beschreibung ? `<p style="margin: 8px 0; font-size: 14px;">${poi.beschreibung}</p>` : ''}
        ${poi.oeffnungszeiten ? `<p style="margin: 4px 0; font-size: 13px;">⏰ ${poi.oeffnungszeiten}</p>` : ''}
        ${poi.eintritt ? `<p style="margin: 4px 0; font-size: 13px;">💶 ${poi.eintritt}</p>` : ''}
        ${poi.adresse ? `<p style="margin: 4px 0; font-size: 13px;">📍 ${poi.adresse}</p>` : ''}
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          ${poi.url ? `<a href="${poi.url}" target="_blank" style="color: #3b82f6; font-size: 13px;">Website →</a>` : ''}
          ${poi.ticket_url ? `<a href="${poi.ticket_url}" target="_blank" style="color: #10b981; font-size: 13px;">Tickets →</a>` : ''}
        </div>
      </div>
    `;
  };

  const navigateToPOI = (poi: POI) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([poi.lat, poi.lon], 15, {
        animate: true,
        duration: 1
      });
    }
  };

  const openDirections = (poi: POI) => {
    const url = `https://www.openstreetmap.org/directions?to=${poi.lat},${poi.lon}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative">
      {/* Karte */}
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg shadow-lg" />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Karte wird geladen...</p>
          </div>
        </div>
      )}
      
      {/* POI Sidebar */}
      {selectedPOI && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm w-full z-[1000]">
          <button
            onClick={() => setSelectedPOI(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          
          <h3 className="font-bold text-lg mb-2">{selectedPOI.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedPOI.kategorie}</p>
          
          {selectedPOI.beschreibung && (
            <p className="text-sm mb-3">{selectedPOI.beschreibung}</p>
          )}
          
          <div className="space-y-2 text-sm">
            {selectedPOI.oeffnungszeiten && (
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span>{selectedPOI.oeffnungszeiten}</span>
              </div>
            )}
            
            {selectedPOI.eintritt && (
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-gray-500" />
                <span>{selectedPOI.eintritt}</span>
              </div>
            )}
            
            {selectedPOI.adresse && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{selectedPOI.adresse}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={() => navigateToPOI(selectedPOI)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4" />
              Auf Karte zeigen
            </button>
            
            <button
              onClick={() => openDirections(selectedPOI)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <MapPin className="w-4 h-4" />
              Route planen
            </button>
            
            {selectedPOI.url && (
              <a
                href={selectedPOI.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                Website besuchen
              </a>
            )}
            
            {selectedPOI.ticket_url && (
              <a
                href={selectedPOI.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                <Calendar className="w-4 h-4" />
                Tickets kaufen
              </a>
            )}
          </div>
        </div>
      )}
      
      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 text-xs z-[999] max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gradient-to-r from-[#003399] to-[#009FE3] rounded"></div>
          <span className="font-bold text-[#003399]">Saarland POIs</span>
        </div>
        
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-[8px]">🏞️</div>
            <span>Sehenswürdigkeiten</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#10B981] rounded-full flex items-center justify-center text-white text-[8px]">🎓</div>
            <span>Bildung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white text-[8px]">🎭</div>
            <span>Kultur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#F59E0B] rounded-full flex items-center justify-center text-white text-[8px]">🏛️</div>
            <span>Verwaltung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#EF4444] rounded-full flex items-center justify-center text-white text-[8px]">💼</div>
            <span>Wirtschaft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#6B7280] rounded-full flex items-center justify-center text-white text-[8px]">🚉</div>
            <span>Verkehr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#EC4899] rounded-full flex items-center justify-center text-white text-[8px]">🏥</div>
            <span>Gesundheit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-[8px]">🛍️</div>
            <span>Freizeit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full flex items-center justify-center text-white text-[8px]">🌳</div>
            <span>Natur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#0EA5E9] rounded-full flex items-center justify-center text-white text-[8px]">🏘️</div>
            <span>Städte</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200 text-gray-600">
          <div className="flex items-center justify-between">
            <span>Gesamt: {Object.values(pois).reduce((acc, category) => acc + category.length, 0)} Standorte</span>
            <div className="text-[#003399] font-medium">AGENTLAND.SAARLAND</div>
          </div>
        </div>
      </div>
    </div>
  );
}
