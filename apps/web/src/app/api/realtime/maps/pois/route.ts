import { NextRequest, NextResponse } from 'next/server';

// Comprehensive Saarland POIs (Points of Interest) for interactive map
const SAARLAND_POIS = {
  tourist_attractions: [
    {
      id: 'saarschleife',
      name: 'Saarschleife',
      kategorie: 'Natur & Wahrzeichen',
      lat: 49.4988,
      lon: 6.6040,
      beschreibung: 'Das Wahrzeichen des Saarlandes mit spektakulärem Aussichtspunkt und Baumwipfelpfad',
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
      beschreibung: 'Einzigartiges Industriedenkmal und UNESCO-Weltkulturerbe der Eisenverhüttung',
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
      beschreibung: 'Größter Freizeitsee im Südwesten mit Wassersport, Strand und Center Parcs',
      url: 'https://www.bostalsee.de',
      oeffnungszeiten: 'Immer zugänglich',
      eintritt: 'Eintritt frei (Strandbad kostenpflichtig)',
      adresse: 'Am Bostalsee, 66625 Nohfelden'
    },
    {
      id: 'deutsch-franzoesischer-garten',
      name: 'Deutsch-Französischer Garten',
      kategorie: 'Garten & Park',
      lat: 49.2292,
      lon: 6.9633,
      beschreibung: 'Grenzüberschreitender Garten mit Seilbahn und vielfältigen Attraktionen',
      url: 'https://www.jardin-bilingue.de',
      oeffnungszeiten: 'Täglich 9:00-19:00',
      eintritt: 'Erwachsene: 7€, Kinder: 3,50€',
      adresse: 'Am Deutschmühlental, 66117 Saarbrücken'
    },
    {
      id: 'homburger-schlossberg',
      name: 'Homburger Schlossberg',
      kategorie: 'Historische Anlage',
      lat: 49.3203,
      lon: 7.3392,
      beschreibung: 'Ruinen der größten Festungsanlage Europas mit Römermuseum',
      url: 'https://www.saarpfalz-kreis.de',
      oeffnungszeiten: 'Di-So 10:00-17:00',
      eintritt: 'Erwachsene: 6€, Ermäßigt: 4€',
      adresse: 'Am Schlossberg, 66424 Homburg'
    },
    {
      id: 'losheimer-stausee',
      name: 'Losheimer Stausee',
      kategorie: 'Natur & Erholung',
      lat: 49.5167,
      lon: 6.7333,
      beschreibung: 'Idyllischer Stausee mit Rundwanderweg und Wassersportmöglichkeiten',
      url: 'https://www.losheim.de',
      oeffnungszeiten: 'Täglich zugänglich',
      eintritt: 'Kostenlos',
      adresse: 'Zum Stausee, 66679 Losheim am See'
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
    },
    {
      id: 'dfki',
      name: 'DFKI - Deutsches Forschungszentrum für KI',
      kategorie: 'Forschung',
      lat: 49.2574,
      lon: 7.0435,
      beschreibung: 'Weltführendes Forschungszentrum für Künstliche Intelligenz',
      url: 'https://www.dfki.de',
      oeffnungszeiten: 'Mo-Fr 8:00-17:00',
      adresse: 'Stuhlsatzenhausweg 3, 66123 Saarbrücken'
    }
  ],
  culture: [
    {
      id: 'staatstheater',
      name: 'Staatstheater Saarbrücken',
      kategorie: 'Theater & Oper',
      lat: 49.2312,
      lon: 6.9965,
      beschreibung: 'Renommiertes Staatstheater mit Oper, Schauspiel und Ballett',
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
      beschreibung: 'Museum für moderne und zeitgenössische Kunst im Saarland',
      url: 'https://www.kulturbesitz.de/moderne-galerie',
      oeffnungszeiten: 'Di-So 10:00-18:00',
      eintritt: 'Erwachsene: 7€, Ermäßigt: 5€',
      adresse: 'Bismarckstraße 11-19, 66111 Saarbrücken'
    },
    {
      id: 'saarlaendisches-staatsmuseum',
      name: 'Saarländisches Staatsmuseum',
      kategorie: 'Museum',
      lat: 49.2361,
      lon: 6.9975,
      beschreibung: 'Kunstsammlung von der Antike bis zur Gegenwart',
      url: 'https://www.kulturbesitz.de',
      oeffnungszeiten: 'Di-So 10:00-18:00',
      eintritt: 'Erwachsene: 7€, Ermäßigt: 5€',
      adresse: 'Bismarckstraße 11-19, 66111 Saarbrücken'
    },
    {
      id: 'ludwigskirche',
      name: 'Ludwigskirche',
      kategorie: 'Historisches Bauwerk',
      lat: 49.2328,
      lon: 6.9944,
      beschreibung: 'Barocker Kirchenbau und Wahrzeichen von Saarbrücken',
      url: 'https://www.saarbruecken.de',
      oeffnungszeiten: 'Täglich 9:00-18:00',
      eintritt: 'Kostenlos',
      adresse: 'Ludwigsplatz, 66117 Saarbrücken'
    }
  ],
  administration: [
    {
      id: 'rathaus-saarbruecken',
      name: 'Rathaus Saarbrücken',
      kategorie: 'Verwaltung',
      lat: 49.2319,
      lon: 6.9989,
      beschreibung: 'Stadtverwaltung Saarbrücken mit umfassenden Bürgerdiensten',
      url: 'https://www.saarbruecken.de',
      oeffnungszeiten: 'Mo-Fr 8:00-16:00',
      adresse: 'Rathausplatz 1, 66111 Saarbrücken'
    },
    {
      id: 'landesregierung-saarland',
      name: 'Staatskanzlei des Saarlandes',
      kategorie: 'Landesregierung',
      lat: 49.2281,
      lon: 6.9969,
      beschreibung: 'Sitz der Saarländischen Landesregierung',
      url: 'https://www.saarland.de',
      oeffnungszeiten: 'Mo-Fr 8:00-16:00',
      adresse: 'Am Ludwigsplatz 14, 66117 Saarbrücken'
    },
    {
      id: 'finanzamt-saarbruecken',
      name: 'Finanzamt Saarbrücken',
      kategorie: 'Finanzverwaltung',
      lat: 49.2344,
      lon: 6.9856,
      beschreibung: 'Zentrale Steuerverwaltung für Saarbrücken und Umgebung',
      url: 'https://www.saarland.de/finanzamt',
      oeffnungszeiten: 'Mo, Di, Do 7:30-15:00, Mi 7:30-17:00, Fr 7:30-12:00',
      adresse: 'Mainzer Straße 109-111, 66121 Saarbrücken'
    },
    {
      id: 'arbeitsagentur-saarbruecken',
      name: 'Agentur für Arbeit Saarbrücken',
      kategorie: 'Bundesbehörde',
      lat: 49.2278,
      lon: 6.9744,
      beschreibung: 'Arbeitslosengeld, Jobvermittlung und Berufsberatung',
      url: 'https://www.arbeitsagentur.de',
      oeffnungszeiten: 'Mo-Fr 8:00-12:30, Do zusätzlich 14:00-18:00',
      adresse: 'Hafenstraße 18, 66111 Saarbrücken'
    }
  ],
  business: [
    {
      id: 'ihk-saarland',
      name: 'IHK Saarland',
      kategorie: 'Wirtschaftsförderung',
      lat: 49.2403,
      lon: 7.0044,
      beschreibung: 'Industrie- und Handelskammer des Saarlandes für Unternehmen',
      url: 'https://www.saarland.ihk.de',
      oeffnungszeiten: 'Mo-Do 8:00-17:00, Fr 8:00-16:00',
      adresse: 'Franz-Josef-Röder-Straße 9, 66119 Saarbrücken'
    },
    {
      id: 'hwk-saarland',
      name: 'Handwerkskammer des Saarlandes',
      kategorie: 'Handwerk',
      lat: 49.2436,
      lon: 7.0081,
      beschreibung: 'Vertretung des Handwerks im Saarland mit Beratung und Bildung',
      url: 'https://www.hwk-saarland.de',
      oeffnungszeiten: 'Mo-Do 7:00-16:30, Fr 7:00-15:00',
      adresse: 'Hohenzollernstraße 47-49, 66117 Saarbrücken'
    },
    {
      id: 'zentrale-wirtschaftsfoerderung',
      name: 'Zentrale für Produktivität und Technologie Saar',
      kategorie: 'Innovation & Technologie',
      lat: 49.2569,
      lon: 7.0356,
      beschreibung: 'Förderung von Innovation und Technologietransfer',
      url: 'https://www.zpts.de',
      oeffnungszeiten: 'Mo-Fr 8:00-17:00',
      adresse: 'Heinrich-Konen-Straße 1, 66115 Saarbrücken'
    }
  ],
  transport: [
    {
      id: 'hauptbahnhof-saarbruecken',
      name: 'Hauptbahnhof Saarbrücken',
      kategorie: 'Verkehrsknotenpunkt',
      lat: 49.2414,
      lon: 6.9908,
      beschreibung: 'Zentraler Bahnhof mit Verbindungen nach Paris, Frankfurt und regional',
      url: 'https://www.bahn.de',
      oeffnungszeiten: 'Täglich 24h geöffnet',
      adresse: 'Am Hauptbahnhof 6-12, 66111 Saarbrücken'
    },
    {
      id: 'eurobahnhof-forbach',
      name: 'Eurobahnhof Forbach',
      kategorie: 'Grenzbahnhof',
      lat: 49.1897,
      lon: 6.8978,
      beschreibung: 'Wichtiger Grenzbahnhof zwischen Deutschland und Frankreich',
      url: 'https://www.sncf-connect.com',
      oeffnungszeiten: 'Täglich 5:00-23:00',
      adresse: 'Place de la Gare, 57600 Forbach, Frankreich'
    },
    {
      id: 'flughafen-saarbruecken',
      name: 'Flughafen Saarbrücken',
      kategorie: 'Flughafen',
      lat: 49.2144,
      lon: 7.1097,
      beschreibung: 'Regionaler Flughafen mit Geschäftsflügen und Flugschule',
      url: 'https://www.flughafen-saarbruecken.de',
      oeffnungszeiten: 'Mo-Fr 6:00-22:00',
      adresse: 'Flugplatz, 66740 Saarlouis'
    }
  ],
  healthcare: [
    {
      id: 'uks',
      name: 'Universitätsklinikum des Saarlandes',
      kategorie: 'Krankenhaus',
      lat: 49.2394,
      lon: 7.0378,
      beschreibung: 'Universitätsklinikum mit Maximalversorgung und Notaufnahme',
      url: 'https://www.uks.eu',
      oeffnungszeiten: 'Notaufnahme 24h, Ambulanzen Mo-Fr',
      adresse: 'Kirrberger Straße 100, 66421 Homburg'
    },
    {
      id: 'marienkrankenhaus',
      name: 'Marienkrankenhaus Saarbrücken',
      kategorie: 'Krankenhaus',
      lat: 49.2456,
      lon: 6.9767,
      beschreibung: 'Katholisches Krankenhaus mit breitem medizinischen Spektrum',
      url: 'https://www.marienkrankenhaus-saarbruecken.de',
      oeffnungszeiten: 'Notaufnahme 24h',
      adresse: 'Grühlingstraße 38, 66121 Saarbrücken'
    }
  ],
  leisure: [
    {
      id: 'saarpark-center',
      name: 'Saarpark-Center',
      kategorie: 'Shopping & Freizeit',
      lat: 49.3194,
      lon: 6.8367,
      beschreibung: 'Großes Einkaufszentrum mit über 120 Geschäften',
      url: 'https://www.saarpark-center.de',
      oeffnungszeiten: 'Mo-Sa 10:00-20:00',
      adresse: 'Trierer Straße 46, 66111 Saarbrücken'
    },
    {
      id: 'saarbruecker-zoo',
      name: 'Saarbrücker Zoo',
      kategorie: 'Zoo & Tiergarten',
      lat: 49.2211,
      lon: 6.9633,
      beschreibung: 'Moderner Zoo mit über 1.700 Tieren aus aller Welt',
      url: 'https://www.zoo-saarbruecken.de',
      oeffnungszeiten: 'Täglich 9:00-18:00 (Sommer), 9:00-17:00 (Winter)',
      eintritt: 'Erwachsene: 12€, Kinder: 6€',
      adresse: 'Graf-Stauffenberg-Straße, 66121 Saarbrücken'
    },
    {
      id: 'congresshalle-saarbruecken',
      name: 'Congresshalle Saarbrücken',
      kategorie: 'Veranstaltungshalle',
      lat: 49.2386,
      lon: 6.9953,
      beschreibung: 'Moderne Veranstaltungshalle für Konzerte, Messen und Events',
      url: 'https://www.congresshalle.de',
      oeffnungszeiten: 'Veranstaltungsabhängig',
      adresse: 'Hafenstraße 12, 66111 Saarbrücken'
    },
    {
      id: 'saarbruecken-castle',
      name: 'Saarbrücker Schloss',
      kategorie: 'Historisches Bauwerk',
      lat: 49.2297,
      lon: 6.9956,
      beschreibung: 'Barockes Schloss mit modernem Anbau von Gottfried Böhm',
      url: 'https://www.historisches-museum.de',
      oeffnungszeiten: 'Di-So 10:00-18:00',
      eintritt: 'Erwachsene: 6€, Ermäßigt: 4€',
      adresse: 'Schlossplatz 16, 66119 Saarbrücken'
    }
  ],
  nature: [
    {
      id: 'naturpark-saar-hunsrueck',
      name: 'Naturpark Saar-Hunsrück',
      kategorie: 'Naturpark',
      lat: 49.4500,
      lon: 6.8500,
      beschreibung: 'Größter Naturpark des Saarlandes mit Wanderwegen und Naturerlebnissen',
      url: 'https://www.naturpark.org',
      oeffnungszeiten: 'Täglich zugänglich',
      eintritt: 'Kostenlos',
      adresse: 'Trierer Straße 51, 66869 Kusel'
    },
    {
      id: 'bliesgau-biosphaerenreservat',
      name: 'Biosphärenreservat Bliesgau',
      kategorie: 'UNESCO Biosphäre',
      lat: 49.1667,
      lon: 7.2000,
      beschreibung: 'UNESCO-Biosphärenreservat mit einzigartiger Natur und Kultur',
      url: 'https://www.biosphaere-bliesgau.eu',
      oeffnungszeiten: 'Täglich zugänglich',
      eintritt: 'Kostenlos',
      adresse: 'Parkstraße 2, 66424 Homburg'
    },
    {
      id: 'warndtwald',
      name: 'Warndtwald',
      kategorie: 'Wald & Naherholung',
      lat: 49.2000,
      lon: 6.8000,
      beschreibung: 'Großes Waldgebiet zwischen Deutschland und Frankreich',
      url: 'https://www.saarforst.de',
      oeffnungszeiten: 'Täglich zugänglich',
      eintritt: 'Kostenlos',
      adresse: 'Warndtwald, 66333 Völklingen'
    }
  ],
  cities: [
    {
      id: 'merzig',
      name: 'Merzig',
      kategorie: 'Stadt',
      lat: 49.4458,
      lon: 6.6369,
      beschreibung: 'Kreisstadt an der Saar mit historischer Altstadt',
      url: 'https://www.merzig.de',
      oeffnungszeiten: 'Stadtverwaltung: Mo-Fr 8:00-16:00',
      adresse: 'Bahnhofstraße 44, 66663 Merzig'
    },
    {
      id: 'neunkirchen',
      name: 'Neunkirchen',
      kategorie: 'Stadt',
      lat: 49.3458,
      lon: 7.1758,
      beschreibung: 'Kreisstadt mit Industriegeschichte und modernem Zentrum',
      url: 'https://www.neunkirchen.de',
      oeffnungszeiten: 'Stadtverwaltung: Mo-Fr 8:00-16:00',
      adresse: 'Rathausplatz 1, 66538 Neunkirchen'
    },
    {
      id: 'st-wendel',
      name: 'Sankt Wendel',
      kategorie: 'Stadt',
      lat: 49.4686,
      lon: 7.1661,
      beschreibung: 'Kreisstadt mit mittelalterlichem Charme und Basilika',
      url: 'https://www.sankt-wendel.de',
      oeffnungszeiten: 'Stadtverwaltung: Mo-Fr 8:00-16:00',
      adresse: 'Rathausplatz 1, 66606 Sankt Wendel'
    },
    {
      id: 'homburg',
      name: 'Homburg',
      kategorie: 'Stadt',
      lat: 49.3203,
      lon: 7.3392,
      beschreibung: 'Universitätsstadt mit historischen Festungsanlagen',
      url: 'https://www.homburg.de',
      oeffnungszeiten: 'Stadtverwaltung: Mo-Fr 8:00-16:00',
      adresse: 'Am Forum 5, 66424 Homburg'
    },
    {
      id: 'saarlouis',
      name: 'Saarlouis',
      kategorie: 'Stadt',
      lat: 49.3156,
      lon: 6.7503,
      beschreibung: 'Festungsstadt von Vauban mit französischem Flair',
      url: 'https://www.saarlouis.de',
      oeffnungszeiten: 'Stadtverwaltung: Mo-Fr 8:00-16:00',
      adresse: 'Großer Markt 1, 66740 Saarlouis'
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