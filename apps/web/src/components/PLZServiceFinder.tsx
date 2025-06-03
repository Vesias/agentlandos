'use client'

import React, { useState } from 'react';
import { Search, MapPin, Building2, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { realTimeService } from '@/lib/realTimeDataService';

interface BehoerdeInfo {
  name: string;
  adresse: string;
  telefon: string;
  email?: string;
  online_services: string;
  oeffnungszeiten: Record<string, string>;
  services?: string[];
  plz: string;
  stadt: string;
  kreis: string;
  koordinaten: {
    lat: number;
    lon: number;
  };
  map_url?: string;
  directions?: {
    openstreetmap: string;
    google_maps: string;
  };
}

export default function PLZServiceFinder() {
  const [plz, setPLZ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<string>('buergeramt');

  const searchPLZ = async () => {
    if (!plz || plz.length !== 5) {
      setError('Bitte geben Sie eine gültige 5-stellige PLZ ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/realtime/plz/${plz}`);
      if (!response.ok) {
        throw new Error('PLZ nicht gefunden');
      }
      const data = await response.json();
      setServices(data.data);
    } catch (err) {
      setError('Die eingegebene PLZ wurde nicht gefunden');
      setServices(null);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (behoerde: BehoerdeInfo) => {
    // Nutze aktuelle Position oder Saarbrücken als Startpunkt
    const startLat = 49.2354;
    const startLon = 6.9969;
    return `https://www.openstreetmap.org/directions?from=${startLat},${startLon}&to=${behoerde.koordinaten.lat},${behoerde.koordinaten.lon}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🏛️ Behördenfinder nach Postleitzahl
      </h2>

      {/* PLZ Eingabe */}
      <div className="mb-6">
        <label htmlFor="plz" className="block text-sm font-medium text-gray-700 mb-2">
          Ihre Postleitzahl im Saarland
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="plz"
            value={plz}
            onChange={(e) => setPLZ(e.target.value)}
            placeholder="z.B. 66111"
            maxLength={5}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={searchPLZ}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Suche...' : 'Suchen'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {services && (
        <div className="space-y-6">
          {/* Location Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                {services.stadt} ({services.plz})
              </h3>
            </div>
            <p className="text-sm text-gray-600">Landkreis: {services.kreis}</p>
          </div>

          {/* Service Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service auswählen
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="buergeramt">Bürgeramt</option>
              <option value="kfz_zulassung">KFZ-Zulassungsstelle</option>
              <option value="finanzamt">Finanzamt</option>
            </select>
          </div>

          {/* Behörde Details */}
          {services.behoerden && services.behoerden[selectedService] && (
            <div className="border border-gray-200 rounded-lg p-5 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {services.behoerden[selectedService].name}
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adresse</p>
                  <p className="font-medium">{services.behoerden[selectedService].adresse}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Telefon</p>
                  <a
                    href={`tel:${services.behoerden[selectedService].telefon}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-4 h-4" />
                    {services.behoerden[selectedService].telefon}
                  </a>
                </div>

                {services.behoerden[selectedService].email && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">E-Mail</p>
                    <a
                      href={`mailto:${services.behoerden[selectedService].email}`}
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {services.behoerden[selectedService].email}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Öffnungszeiten</p>
                  <div className="space-y-1">
                    {Object.entries(services.behoerden[selectedService].oeffnungszeiten).map(([tag, zeit]) => (
                      <div key={tag} className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{tag}:</span> {String(zeit)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                <a
                  href={services.behoerden[selectedService].online_services}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Online-Services
                </a>
                
                <a
                  href={getDirectionsUrl(services.behoerden[selectedService])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <MapPin className="w-4 h-4" />
                  Route planen
                </a>
              </div>

              {/* Available Services */}
              {services.behoerden[selectedService].services && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Verfügbare Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {services.behoerden[selectedService].services.map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Online Services */}
          {services.online_services && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                💻 Online-Services (landesweit verfügbar)
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(services.online_services).map(([key, service]: [string, any]) => (
                  <a
                    key={key}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h5 className="font-medium text-gray-900 mb-1">{service.name}</h5>
                    <p className="text-sm text-gray-600">{service.beschreibung}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600">
                      Jetzt nutzen <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
