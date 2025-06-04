import { NextRequest, NextResponse } from 'next/server';

// Real Saarland POIs (Points of Interest) for interactive map
const SAARLAND_POIS = {
  tourist_attractions: [
    {
      id: 'saarschleife',
      name: 'Saarschleife',
      kategorie: 'Natur',
      lat: 49.4988,
      lon: 6.6040,
      beschreibung: 'Das Wahrzeichen des Saarlandes mit spektakulärem Aussichtspunkt',
      url: 'https://www.urlaub.saarland/saarschleife',
      oeffnungszeiten: 'Täglich 24h geöffnet',
      eintritt: 'Kostenlos (Baumwipfelpfad: 9,50€)',
      adresse: 'Cloef-Atrium, 66693 Mettlach',
      ticket_url: 'https://www.urlaub.saarland/saarschleife'
    },
    {
      id: 'voelklinger-huette',
      name: 'Völklinger Hütte',
      kategorie: 'UNESCO Welterbe',
      lat: 49.2515,
      lon: 6.8446,
      beschreibung: 'Einzigartiges Industriedenkmal und UNESCO-Weltkulturerbe',
      url: 'https://www.voelklinger-huette.org',
      oeffnungszeiten: 'Di-So 10:00-19:00',
      eintritt: 'Erwachsene: 17€, Ermäßigt: 15€',
      adresse: 'Rathausstraße 75-79, 66333 Völklingen'
    },
    {
      id: 'bostalsee',
      name: 'Bostalsee',
      kategorie: 'Freizeit & Erholung',
      lat: 49.5698,
      lon: 7.1547,
      beschreibung: 'Größter Freizeitsee im Südwesten mit vielfältigen Aktivitäten',
      url: 'https://www.bostalsee.de',
      oeffnungszeiten: 'Immer zugänglich',
      eintritt: 'Eintritt frei (Strandbad kostenpflichtig)',
      adresse: 'Am Bostalsee, 66625 Nohfelden'
    }
  ],
  education: [
    {
      id: 'uni-saarland',
      name: 'Universität des Saarlandes',
      kategorie: 'Universität',
      lat: 49.2543,
      lon: 7.0469,
      beschreibung: 'Führende Universität mit Fokus auf Informatik und Materialwissenschaften',
      url: 'https://www.uni-saarland.de',
      oeffnungszeiten: 'Mo-Fr 8:00-18:00',
      adresse: 'Campus Saarbrücken, 66123 Saarbrücken'
    },
    {
      id: 'htw-saar',
      name: 'htw saar',
      kategorie: 'Hochschule',
      lat: 49.2387,
      lon: 7.0014,
      beschreibung: 'Hochschule für Technik und Wirtschaft des Saarlandes',
      url: 'https://www.htwsaar.de',
      oeffnungszeiten: 'Mo-Fr 7:00-20:00',
      adresse: 'Goebenstraße 40, 66117 Saarbrücken'
    }
  ],
  culture: [
    {
      id: 'staatstheater',
      name: 'Staatstheater Saarbrücken',
      kategorie: 'Theater & Oper',
      lat: 49.2312,
      lon: 6.9965,
      beschreibung: 'Renommiertes Staatstheater mit vielfältigem Programm',
      url: 'https://www.staatstheater.saarland',
      oeffnungszeiten: 'Spielzeiten variieren',
      adresse: 'Schillerplatz 1, 66111 Saarbrücken'
    },
    {
      id: 'moderne-galerie',
      name: 'Moderne Galerie',
      kategorie: 'Museum & Galerie',
      lat: 49.2357,
      lon: 6.9969,
      beschreibung: 'Museum für moderne und zeitgenössische Kunst',
      url: 'https://www.kulturbesitz.de/moderne-galerie',
      oeffnungszeiten: 'Di-So 10:00-18:00',
      adresse: 'Bismarckstraße 11-19, 66111 Saarbrücken'
    }
  ],
  administration: [
    {
      id: 'rathaus-saarbruecken',
      name: 'Rathaus Saarbrücken',
      kategorie: 'Verwaltung',
      lat: 49.2319,
      lon: 6.9989,
      beschreibung: 'Stadtverwaltung Saarbrücken mit Bürgerdiensten',
      url: 'https://www.saarbruecken.de',
      oeffnungszeiten: 'Mo-Fr 8:00-16:00',
      adresse: 'Rathausplatz 1, 66111 Saarbrücken'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'success',
      data: SAARLAND_POIS,
      timestamp: new Date().toISOString(),
      total_pois: Object.values(SAARLAND_POIS).reduce((acc, category) => acc + category.length, 0)
    });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch points of interest'
    }, { status: 500 });
  }
}