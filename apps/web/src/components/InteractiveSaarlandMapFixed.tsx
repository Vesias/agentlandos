'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Users, Phone, Globe, Navigation } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  type: 'authority' | 'football' | 'tourism' | 'business';
  coordinates: { lat: number; lng: number };
  municipality: string;
  services?: string[];
  status?: 'online' | 'offline' | 'busy';
  queueLength?: number;
  contact?: {
    phone?: string;
    website?: string;
  };
}

interface SaarlandMapProps {
  selectedPOIType?: string;
  onPOISelect?: (poi: POI) => void;
}

export const InteractiveSaarlandMapFixed: React.FC<SaarlandMapProps> = ({
  selectedPOIType = 'all',
  onPOISelect
}) => {
  const [pois, setPOIs] = useState<POI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ x: 300, y: 200 });
  const [zoom, setZoom] = useState(1);

  // Saarland municipalities with real coordinates (scaled for SVG)
  const municipalities = [
    { 
      name: 'Saarbrücken', 
      coordinates: { x: 300, y: 250 },
      realCoords: { lat: 49.2401, lng: 6.9969 },
      plz: ['66001', '66133'],
      color: '#003399'
    },
    { 
      name: 'Neunkirchen', 
      coordinates: { x: 350, y: 180 },
      realCoords: { lat: 49.3475, lng: 7.1761 },
      plz: ['66538', '66606'],
      color: '#009FE3'
    },
    { 
      name: 'Homburg', 
      coordinates: { x: 280, y: 320 },
      realCoords: { lat: 49.3265, lng: 7.3408 },
      plz: ['66424', '66450'],
      color: '#43B049'
    },
    {
      name: 'Sankt Wendel',
      coordinates: { x: 380, y: 120 },
      realCoords: { lat: 49.4666, lng: 7.1667 },
      plz: ['66606', '66687'],
      color: '#FDB913'
    },
    {
      name: 'Saarlouis',
      coordinates: { x: 250, y: 200 },
      realCoords: { lat: 49.3125, lng: 6.7481 },
      plz: ['66740', '66787'],
      color: '#E31E2D'
    },
    {
      name: 'Merzig-Wadern',
      coordinates: { x: 200, y: 150 },
      realCoords: { lat: 49.4439, lng: 6.6364 },
      plz: ['66649', '66706'],
      color: '#929497'
    }
  ];

  useEffect(() => {
    fetchPOIs();
  }, [selectedPOIType]);

  const fetchPOIs = async () => {
    setIsLoading(true);
    try {
      // Fetch authorities
      const authResponse = await fetch('/api/behoerden?limit=50');
      const authData = await authResponse.json();
      
      // Fetch football data
      const footballResponse = await fetch('/api/realtime/football');
      const footballData = await footballResponse.json();
      
      // Fetch tourism POIs
      const tourismResponse = await fetch('/api/realtime/tourism');
      const tourismData = await tourismResponse.json();

      const allPOIs: POI[] = [
        // Authorities
        ...(authData.authorities || []).map((auth: any) => ({
          id: auth.id,
          name: auth.name,
          type: 'authority' as const,
          coordinates: auth.address?.coordinates || getMunicipalityCoords(auth.municipality),
          municipality: auth.municipality,
          services: auth.services,
          status: auth.realTimeStatus?.isOnline ? 'online' : 'offline',
          queueLength: auth.realTimeStatus?.queueLength,
          contact: auth.contact
        })),
        
        // Football clubs/stadiums
        ...(footballData.matches || []).slice(0, 10).map((match: any, index: number) => ({
          id: `football-${index}`,
          name: match.home_team?.name || `Fußballplatz ${index + 1}`,
          type: 'football' as const,
          coordinates: getRandomCoordinatesInMunicipality('Saarbrücken'),
          municipality: 'Saarbrücken',
          services: ['Fußball', 'Training', 'Wettkämpfe']
        })),
        
        // Tourism POIs
        ...(tourismData.events || []).slice(0, 8).map((event: any, index: number) => ({
          id: `tourism-${index}`,
          name: event.name || `Sehenswürdigkeit ${index + 1}`,
          type: 'tourism' as const,
          coordinates: getRandomCoordinatesInMunicipality(municipalities[index % municipalities.length].name),
          municipality: municipalities[index % municipalities.length].name,
          services: ['Besichtigung', 'Events', 'Führungen']
        }))
      ];

      setPOIs(allPOIs);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      // Fallback POIs
      setPOIs(generateFallbackPOIs());
    } finally {
      setIsLoading(false);
    }
  };

  const getMunicipalityCoords = (municipalityName: string) => {
    const municipality = municipalities.find(m => m.name === municipalityName);
    return municipality ? municipality.coordinates : { x: 300, y: 200 };
  };

  const getRandomCoordinatesInMunicipality = (municipalityName: string) => {
    const base = getMunicipalityCoords(municipalityName);
    return {
      x: base.x + (Math.random() - 0.5) * 50,
      y: base.y + (Math.random() - 0.5) * 50
    };
  };

  const generateFallbackPOIs = (): POI[] => {
    return municipalities.flatMap(municipality => [
      {
        id: `auth-${municipality.name}`,
        name: `Bürgeramt ${municipality.name}`,
        type: 'authority' as const,
        coordinates: municipality.coordinates,
        municipality: municipality.name,
        services: ['Personalausweis', 'Meldebescheinigung'],
        status: 'online' as const,
        queueLength: Math.floor(Math.random() * 15)
      },
      {
        id: `football-${municipality.name}`,
        name: `SV ${municipality.name}`,
        type: 'football' as const,
        coordinates: {
          x: municipality.coordinates.x + 20,
          y: municipality.coordinates.y + 10
        },
        municipality: municipality.name,
        services: ['Fußball', 'Training']
      }
    ]);
  };

  const filteredPOIs = useMemo(() => {
    if (selectedPOIType === 'all') return pois;
    return pois.filter(poi => poi.type === selectedPOIType);
  }, [pois, selectedPOIType]);

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    onPOISelect?.(poi);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return '#43B049';
      case 'busy': return '#FDB913';
      case 'offline': return '#E31E2D';
      default: return '#929497';
    }
  };

  const getPOIIcon = (type: string) => {
    switch (type) {
      case 'authority': return '🏛️';
      case 'football': return '⚽';
      case 'tourism': return '🏰';
      case 'business': return '🏢';
      default: return '📍';
    }
  };

  return (
    <div className=\"w-full h-[600px] bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl overflow-hidden relative\">
      {/* Map Controls */}\n      <div className=\"absolute top-4 left-4 z-10 flex gap-2\">\n        <button\n          onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}\n          className=\"px-3 py-2 bg-white shadow-lg rounded-lg hover:bg-gray-50\"\n        >\n          +\n        </button>\n        <button\n          onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}\n          className=\"px-3 py-2 bg-white shadow-lg rounded-lg hover:bg-gray-50\"\n        >\n          -\n        </button>\n      </div>\n\n      {/* POI Type Filter */}\n      <div className=\"absolute top-4 right-4 z-10\">\n        <select\n          value={selectedPOIType}\n          onChange={(e) => onPOISelect?.({ target: { value: e.target.value } } as any)}\n          className=\"px-3 py-2 bg-white shadow-lg rounded-lg border-none outline-none\"\n        >\n          <option value=\"all\">Alle POIs</option>\n          <option value=\"authority\">Behörden</option>\n          <option value=\"football\">Fußball</option>\n          <option value=\"tourism\">Tourismus</option>\n          <option value=\"business\">Business</option>\n        </select>\n      </div>\n\n      {/* SVG Map */}\n      <svg\n        width=\"100%\"\n        height=\"100%\"\n        viewBox=\"0 0 600 400\"\n        className=\"w-full h-full\"\n        style={{ transform: `scale(${zoom})` }}\n      >\n        {/* Saarland Outline */}\n        <path\n          d=\"M 150 100 L 450 80 L 480 150 L 460 250 L 420 350 L 300 380 L 180 350 L 120 280 L 140 200 Z\"\n          fill=\"#E6E6EB\"\n          stroke=\"#003399\"\n          strokeWidth=\"2\"\n          opacity=\"0.8\"\n        />\n\n        {/* Municipalities */}\n        {municipalities.map((municipality) => (\n          <g key={municipality.name}>\n            <circle\n              cx={municipality.coordinates.x}\n              cy={municipality.coordinates.y}\n              r=\"25\"\n              fill={municipality.color}\n              opacity=\"0.3\"\n              stroke={municipality.color}\n              strokeWidth=\"2\"\n            />\n            <text\n              x={municipality.coordinates.x}\n              y={municipality.coordinates.y + 40}\n              textAnchor=\"middle\"\n              className=\"text-sm font-semibold fill-current text-gray-700\"\n            >\n              {municipality.name}\n            </text>\n          </g>\n        ))}\n\n        {/* POIs */}\n        {!isLoading && filteredPOIs.map((poi) => (\n          <g key={poi.id}>\n            <circle\n              cx={poi.coordinates.x}\n              cy={poi.coordinates.y}\n              r=\"8\"\n              fill={getStatusColor(poi.status)}\n              stroke=\"white\"\n              strokeWidth=\"2\"\n              className=\"cursor-pointer hover:r-10 transition-all\"\n              onClick={() => handlePOIClick(poi)}\n            />\n            <text\n              x={poi.coordinates.x}\n              y={poi.coordinates.y + 3}\n              textAnchor=\"middle\"\n              className=\"text-xs fill-white font-bold pointer-events-none\"\n            >\n              {getPOIIcon(poi.type)}\n            </text>\n          </g>\n        ))}\n      </svg>\n\n      {/* Loading Overlay */}\n      {isLoading && (\n        <div className=\"absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center\">\n          <div className=\"text-center\">\n            <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"></div>\n            <p className=\"text-gray-600\">Lade Kartendaten...</p>\n          </div>\n        </div>\n      )}\n\n      {/* POI Details Panel */}\n      {selectedPOI && (\n        <div className=\"absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-6 max-w-md\">\n          <div className=\"flex justify-between items-start mb-4\">\n            <h3 className=\"text-lg font-bold text-gray-900\">{selectedPOI.name}</h3>\n            <button\n              onClick={() => setSelectedPOI(null)}\n              className=\"text-gray-500 hover:text-gray-700\"\n            >\n              ×\n            </button>\n          </div>\n          \n          <div className=\"space-y-3\">\n            <div className=\"flex items-center gap-2 text-sm text-gray-600\">\n              <MapPin className=\"w-4 h-4\" />\n              {selectedPOI.municipality}\n            </div>\n            \n            {selectedPOI.status && (\n              <div className=\"flex items-center gap-2 text-sm\">\n                <div \n                  className=\"w-3 h-3 rounded-full\"\n                  style={{ backgroundColor: getStatusColor(selectedPOI.status) }}\n                />\n                <span className=\"capitalize\">{selectedPOI.status}</span>\n                {selectedPOI.queueLength !== undefined && (\n                  <span className=\"text-gray-500\">• {selectedPOI.queueLength} in Warteschlange</span>\n                )}\n              </div>\n            )}\n            \n            {selectedPOI.services && (\n              <div>\n                <p className=\"text-sm font-medium text-gray-700 mb-1\">Services:</p>\n                <div className=\"flex flex-wrap gap-1\">\n                  {selectedPOI.services.slice(0, 3).map((service, index) => (\n                    <span\n                      key={index}\n                      className=\"px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded\"\n                    >\n                      {service}\n                    </span>\n                  ))}\n                </div>\n              </div>\n            )}\n            \n            {selectedPOI.contact && (\n              <div className=\"flex gap-4 pt-2\">\n                {selectedPOI.contact.phone && (\n                  <a\n                    href={`tel:${selectedPOI.contact.phone}`}\n                    className=\"flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm\"\n                  >\n                    <Phone className=\"w-4 h-4\" />\n                    Anrufen\n                  </a>\n                )}\n                {selectedPOI.contact.website && (\n                  <a\n                    href={selectedPOI.contact.website}\n                    target=\"_blank\"\n                    rel=\"noopener noreferrer\"\n                    className=\"flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm\"\n                  >\n                    <Globe className=\"w-4 h-4\" />\n                    Website\n                  </a>\n                )}\n              </div>\n            )}\n          </div>\n        </div>\n      )}\n\n      {/* Stats Overlay */}\n      <div className=\"absolute top-20 left-4 bg-white rounded-lg shadow-lg p-4 text-sm\">\n        <div className=\"font-semibold text-gray-700 mb-2\">Live Statistiken</div>\n        <div className=\"space-y-1 text-gray-600\">\n          <div>POIs: {filteredPOIs.length}</div>\n          <div>Online: {filteredPOIs.filter(p => p.status === 'online').length}</div>\n          <div>Behörden: {filteredPOIs.filter(p => p.type === 'authority').length}</div>\n          <div>Sport: {filteredPOIs.filter(p => p.type === 'football').length}</div>\n        </div>\n      </div>\n    </div>\n  );\n};"