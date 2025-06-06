'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Building, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

interface Municipality {
  id: string;
  name: string;
  plz: string[];
  coordinates: { lat: number; lng: number };
  services: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  hours?: string;
}

const SAARLAND_MUNICIPALITIES: Municipality[] = [
  {
    id: 'saarbruecken',
    name: 'Saarbrücken',
    plz: ['66111', '66115', '66117', '66119', '66121', '66123', '66125'],
    coordinates: { lat: 49.2401, lng: 6.9969 },
    services: ['Bürgerbüro', 'Standesamt', 'Ordnungsamt', 'Sozialamt'],
    contact: {
      phone: '0681 905-0',
      email: 'stadt@saarbruecken.de',
      website: 'https://www.saarbruecken.de',
      address: 'Rathausplatz 1, 66111 Saarbrücken'
    },
    hours: 'Mo-Fr 8:00-16:00'
  },
  {
    id: 'homburg',
    name: 'Homburg',
    plz: ['66424', '66482'],
    coordinates: { lat: 49.3267, lng: 7.3403 },
    services: ['Bürgerbüro', 'Standesamt', 'Bauamt'],
    contact: {
      phone: '06841 101-0',
      email: 'info@homburg.de',
      website: 'https://www.homburg.de',
      address: 'Am Forum 5, 66424 Homburg'
    },
    hours: 'Mo-Fr 8:00-15:30'
  },
  {
    id: 'neunkirchen',
    name: 'Neunkirchen',
    plz: ['66538', '66540'],
    coordinates: { lat: 49.3467, lng: 7.1783 },
    services: ['Bürgerbüro', 'Standesamt', 'Jugendamt'],
    contact: {
      phone: '06821 202-0',
      email: 'stadt@neunkirchen.de',
      website: 'https://www.neunkirchen.de',
      address: 'Rathausplatz 1, 66538 Neunkirchen'
    },
    hours: 'Mo-Fr 8:00-16:00'
  }
];

export const InteractiveSaarlandMapFixed: React.FC = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredMunicipalities = SAARLAND_MUNICIPALITIES.filter(
    (municipality) =>
      municipality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      municipality.plz.some((plz) => plz.includes(searchTerm))
  );

  const handleMunicipalityClick = (municipality: Municipality) => {
    setSelectedMunicipality(municipality);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-saarland-blue mb-4">
          Interaktive Saarland Karte
        </h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Stadt oder PLZ suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saarland-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Area */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 min-h-[400px] relative">
          <h3 className="text-lg font-semibold mb-4">Karte</h3>
          
          {/* Interactive Municipality Points */}
          <div className="space-y-2">
            {filteredMunicipalities.map((municipality) => (
              <button
                key={municipality.id}
                onClick={() => handleMunicipalityClick(municipality)}
                className={`w-full p-3 text-left rounded-lg transition-all ${
                  selectedMunicipality?.id === municipality.id
                    ? 'bg-saarland-blue text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{municipality.name}</span>
                  <span className="text-sm opacity-75">
                    ({municipality.plz.join(', ')})
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-gray-50 rounded-lg p-6">
          {selectedMunicipality ? (
            <div>
              <h3 className="text-xl font-bold text-saarland-blue mb-4">
                {selectedMunicipality.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Verfügbare Services
                  </h4>
                  <ul className="space-y-1">
                    {selectedMunicipality.services.map((service, index) => (
                      <li key={index} className="text-sm bg-white px-3 py-1 rounded">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Kontaktinformationen</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMunicipality.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{selectedMunicipality.contact.phone}</span>
                      </div>
                    )}
                    {selectedMunicipality.contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{selectedMunicipality.contact.email}</span>
                      </div>
                    )}
                    {selectedMunicipality.contact.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <a
                          href={selectedMunicipality.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-saarland-blue hover:underline"
                        >
                          Website besuchen
                        </a>
                      </div>
                    )}
                    {selectedMunicipality.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedMunicipality.hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedMunicipality.contact.address && (
                  <div>
                    <h4 className="font-semibold mb-2">Adresse</h4>
                    <p className="text-sm bg-white p-3 rounded">
                      {selectedMunicipality.contact.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie eine Stadt aus der Karte aus, um Details zu sehen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSaarlandMapFixed;