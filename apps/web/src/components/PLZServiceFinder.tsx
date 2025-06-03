'use client'

import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Globe, Clock, Navigation, CheckCircle, Building2, ExternalLink } from 'lucide-react';
import { BehoerdeInfo, PLZInfo } from '@/lib/saarland-plz-data';
import { saarlandCompletePLZ } from '@/lib/saarland-plz-complete';

// Hilfsfunktionen für die komplette PLZ-Datenbank
function isValidSaarlandPLZ(plz: string): boolean {
  return plz in saarlandCompletePLZ;
}

function getPLZInfo(plz: string): PLZInfo | null {
  return saarlandCompletePLZ[plz] || null;
}

function findNearestBehoerde(plz: string, behoerdeType: string): BehoerdeInfo | null {
  // Wenn PLZ direkt gefunden mit Behörde
  if (saarlandCompletePLZ[plz] && saarlandCompletePLZ[plz].behoerden[behoerdeType]) {
    return saarlandCompletePLZ[plz].behoerden[behoerdeType];
  }
  
  // Suche in nahegelegenen PLZ (gleicher Kreis)
  const currentKreis = saarlandCompletePLZ[plz]?.kreis;
  if (currentKreis) {
    // Finde alle PLZ im gleichen Kreis
    const kreisPlzList = Object.entries(saarlandCompletePLZ)
      .filter(([_, info]) => info.kreis === currentKreis)
      .map(([plz, _]) => plz);
      
    for (const nearbyPlz of kreisPlzList) {
      if (saarlandCompletePLZ[nearbyPlz].behoerden[behoerdeType]) {
        return saarlandCompletePLZ[nearbyPlz].behoerden[behoerdeType];
      }
    }
  }
  
  return null;
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

    // Kleine Verzögerung für bessere UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (!isValidSaarlandPLZ(plz)) {
        setError('Diese PLZ gehört nicht zum Saarland');
        setServices(null);
      } else {
        const plzInfo = getPLZInfo(plz);
        if (plzInfo) {
          setServices(plzInfo);
          // Wenn die gewählte Behörde nicht verfügbar ist, finde die nächstgelegene
          if (!plzInfo.behoerden[selectedService]) {
            const nearestBehoerde = findNearestBehoerde(plz, selectedService);
            if (nearestBehoerde) {
              setServices({
                ...plzInfo,
                behoerden: {
                  ...plzInfo.behoerden,
                  [selectedService]: nearestBehoerde
                }
              });
            }
          }
        }
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
      setServices(null);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (behoerde: BehoerdeInfo) => {
    // Nutze OpenStreetMap für Routenplanung
    return `https://www.openstreetmap.org/directions?to=${behoerde.koordinaten.lat},${behoerde.koordinaten.lon}`;
  };

  const getGoogleMapsUrl = (behoerde: BehoerdeInfo) => {
    return `https://www.google.com/maps/search/?api=1&query=${behoerde.koordinaten.lat},${behoerde.koordinaten.lon}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🏛️ Behördenfinder nach Postleitzahl
      </h2>
      
      {/* PLZ Suche */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ihre Postleitzahl
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={plz}
            onChange={(e) => setPLZ(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={(e) => e.key === 'Enter' && searchPLZ()}
            placeholder="z.B. 66111"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={5}
          />
          <button
            onClick={searchPLZ}
            disabled={loading || plz.length !== 5}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Suche...' : 'Suchen'}
          </button>
        </div>
        
        {/* Beispiel PLZ */}
        <p className="text-xs text-gray-500 mt-2">
          Beispiele: 66111 (Saarbrücken), 66424 (Homburg), 66740 (Saarlouis), 66606 (St. Wendel)
        </p>
      </div>

      {/* Service Auswahl */}
      {services && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gewünschter Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="buergeramt">Bürgeramt / Bürgerbüro</option>
            <option value="kfz">KFZ-Zulassungsstelle</option>
            <option value="finanzamt">Finanzamt</option>
            <option value="standesamt">Standesamt</option>
            <option value="jugendamt">Jugendamt</option>
            <option value="sozialamt">Sozialamt</option>
          </select>
        </div>
      )}

      {/* Fehler */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Ergebnisse */}
      {services && services.behoerden[selectedService] && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {services.behoerden[selectedService].name}
            </h3>

            {/* Kontakt Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adresse</p>
                    <p className="text-sm text-gray-600">
                      {services.behoerden[selectedService].strasse}<br />
                      {services.behoerden[selectedService].ort}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telefon</p>
                    <a 
                      href={`tel:${services.behoerden[selectedService].telefon}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {services.behoerden[selectedService].telefon}
                    </a>
                  </div>
                </div>

                {services.behoerden[selectedService].email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">E-Mail</p>
                      <a 
                        href={`mailto:${services.behoerden[selectedService].email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {services.behoerden[selectedService].email}
                      </a>
                    </div>
                  </div>
                )}

                {services.behoerden[selectedService].webseite && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Webseite</p>
                      <a 
                        href={services.behoerden[selectedService].webseite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Online-Portal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Öffnungszeiten</p>
                  <div className="space-y-1">
                    {Object.entries(services.behoerden[selectedService].oeffnungszeiten).map(([tag, zeit]) => (
                      <div key={tag} className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{tag}:</span> {String(zeit)}
                      </div>
                    ))}
                  </div>
                </div>

                {services.behoerden[selectedService].wartezeit !== undefined && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      ⏱️ Durchschnittliche Wartezeit
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {services.behoerden[selectedService].wartezeit} Minuten
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route planen */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={getDirectionsUrl(services.behoerden[selectedService])}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Route planen (OpenStreetMap)
              </a>
              
              <a
                href={getGoogleMapsUrl(services.behoerden[selectedService])}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Google Maps
              </a>
            </div>

            {/* Online Services */}
            {services.behoerden[selectedService].online_services && 
             services.behoerden[selectedService].online_services.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-semibold text-green-900 mb-2">
                  ✅ Online verfügbare Services
                </h4>
                <ul className="space-y-1">
                  {services.behoerden[selectedService].online_services.map((service: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PLZ Info */}
            <div className="mt-4 text-sm text-gray-500">
              PLZ {services.plz} • {services.ort} • {services.kreis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}