'use client'

import { useState } from 'react';
import { saarlandCompletePLZ } from '@/lib/saarland-plz-complete';

export default function TestPLZPage() {
  const [testPLZ, setTestPLZ] = useState('66540');
  const [result, setResult] = useState<any>(null);

  const testPLZLookup = () => {
    const plzInfo = saarlandCompletePLZ[testPLZ];
    setResult({
      plz: testPLZ,
      found: !!plzInfo,
      data: plzInfo
    });
  };

  const totalPLZ = Object.keys(saarlandCompletePLZ).length;
  const plzWithBehoerden = Object.values(saarlandCompletePLZ).filter(
    plz => Object.keys(plz.behoerden).length > 0
  ).length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🧪 PLZ Test Dashboard</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">System Statistiken</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Gesamt PLZ im System:</p>
            <p className="text-2xl font-bold">{totalPLZ}</p>
          </div>
          <div>
            <p className="text-gray-600">PLZ mit Behördendaten:</p>
            <p className="text-2xl font-bold">{plzWithBehoerden}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">PLZ Tester</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testPLZ}
            onChange={(e) => setTestPLZ(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="PLZ eingeben (z.B. 66540)"
          />
          <button
            onClick={testPLZLookup}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Testen
          </button>
        </div>
        
        {result && (
          <div className={`p-4 rounded-lg ${result.found ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="font-semibold mb-2">
              PLZ {result.plz}: {result.found ? '✅ Gefunden' : '❌ Nicht gefunden'}
            </p>
            {result.found && result.data && (
              <div className="text-sm">
                <p><strong>Ort:</strong> {result.data.ort}</p>
                <p><strong>Kreis:</strong> {result.data.kreis}</p>
                <p><strong>Behörden:</strong> {Object.keys(result.data.behoerden).length > 0 
                  ? Object.keys(result.data.behoerden).join(', ')
                  : 'Keine Behördendaten'
                }</p>
                {result.data.behoerden.buergeramt && (
                  <div className="mt-2 p-2 bg-white rounded">
                    <p className="font-semibold">Bürgeramt:</p>
                    <p>{result.data.behoerden.buergeramt.name}</p>
                    <p>{result.data.behoerden.buergeramt.strasse}</p>
                    <p>{result.data.behoerden.buergeramt.telefon}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Kritische PLZ Tests</h2>
        <div className="space-y-2">
          {['66540', '66539', '66538', '66111', '66424', '66740', '66606', '66663'].map(plz => {
            const info = saarlandCompletePLZ[plz];
            return (
              <div key={plz} className="flex items-center justify-between p-2 border-b">
                <span className="font-mono">{plz}</span>
                <span className={info ? 'text-green-600' : 'text-red-600'}>
                  {info ? `✅ ${info.ort}` : '❌ Nicht gefunden'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}