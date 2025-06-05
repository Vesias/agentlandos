import { NextRequest, NextResponse } from 'next/server'
// MAXIMAL ERWEITERTE SAARLAND BEHÖRDEN DATABASE
const SAARLAND_BEHOERDEN_MAXIMAL = {
  authorities: [
    // KOMMUNALE BEHÖRDEN - SAARBRÜCKEN
    {
      id: 'rathaus-saarbruecken',
      name: 'Rathaus Saarbrücken - Bürgerdienste',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Zentrale Anlaufstelle für alle städtischen Dienstleistungen mit modernem Bürgerservice',
      address: {
        street: 'Rathausplatz 1',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 681 905-0',
        email: 'buergerservice@saarbruecken.de',
        website: 'https://www.saarbruecken.de'
      },
      services: ['Personalausweis', 'Reisepass', 'Meldewesen', 'KFZ-Anmeldung', 'Gewerbeanmeldung', 'Bauanträge', 'Hundesteuer', 'Führungszeugnis'],
      openingHours: {
        'Mo-Mi': '8:00-15:30',
        'Do': '8:00-18:00',
        'Fr': '8:00-12:00'
      },
      onlineServices: ['Terminbuchung online', 'Formular-Download', 'Online-Antrag Führungszeugnis'],
      keywords: ['bürgeramt', 'personalausweis', 'anmeldung', 'ummeldung', 'stadthaus']
    },
    {
      id: 'buergerdienst-st-johann',
      name: 'Bürgerdienst St. Johann',
      category: 'kommunal',
      type: 'bürgerdienst',
      description: 'Stadtteil-Bürgerdienst mit allen wichtigen Verwaltungsdienstleistungen',
      address: {
        street: 'Sulzbachstraße 8',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 681 905-1234',
        email: 'st-johann@saarbruecken.de',
        website: 'https://www.saarbruecken.de/leben_in_saarbruecken/buergerservice'
      },
      services: ['Personalausweis', 'Anmeldung', 'Ummeldung', 'Bescheinigungen', 'Parkausweise'],
      openingHours: {
        'Mo-Fr': '8:00-15:30',
        'Do': '8:00-18:00'
      },
      onlineServices: ['Online-Terminbuchung'],
      keywords: ['st johann', 'bürgeramt', 'anmeldung', 'stadtteil']
    },
    {
      id: 'standesamt-saarbruecken',
      name: 'Standesamt Saarbrücken',
      category: 'kommunal',
      type: 'standesamt',
      description: 'Eheschließungen, Geburten, Sterbefälle und Personenstandsurkunden',
      address: {
        street: 'Rathausplatz 1',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 681 905-1301',
        email: 'standesamt@saarbruecken.de',
        website: 'https://www.saarbruecken.de/rathaus/aemter/standesamt'
      },
      services: ['Eheschließung', 'Geburtsurkunden', 'Sterbeurkunden', 'Eheurkunden', 'Lebenspartnerschaft'],
      openingHours: {
        'Mo-Mi': '8:00-15:30',
        'Do': '8:00-18:00',
        'Fr': '8:00-12:00'
      },
      onlineServices: ['Terminbuchung Eheschließung', 'Urkundenbestellung'],
      keywords: ['heirat', 'eheschließung', 'geburt', 'tod', 'urkunden']
    },
    
    // LANDKREIS BEHÖRDEN
    {
      id: 'landratsamt-saarbruecken',
      name: 'Landratsamt Regionalverband Saarbrücken',
      category: 'kommunal',
      type: 'landratsamt',
      description: 'Kreisbehörde für den Regionalverband Saarbrücken mit umfassenden Verwaltungsaufgaben',
      address: {
        street: 'Schlossplatz 1-15',
        city: 'Saarbrücken',
        zipCode: '66119',
        phone: '+49 681 506-0',
        email: 'info@rvsbr.de',
        website: 'https://www.regionalverband-saarbruecken.de'
      },
      services: ['KFZ-Zulassung', 'Führerschein', 'Baugenehmigung', 'Ausländerbehörde', 'Sozialamt', 'Jugendamt', 'Gesundheitsamt'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-18:00'
      },
      onlineServices: ['KFZ-Anmeldung online', 'Wunschkennzeichen'],
      keywords: ['kfz', 'zulassung', 'führerschein', 'bau', 'ausländer', 'sozial']
    },
    {
      id: 'kfz-zulassungsstelle-sb',
      name: 'KFZ-Zulassungsstelle Saarbrücken',
      category: 'kommunal',
      type: 'kfz-stelle',
      description: 'Spezialisierte Stelle für alle KFZ-Angelegenheiten mit Online-Services',
      address: {
        street: 'Stengelstraße 10-12',
        city: 'Saarbrücken',
        zipCode: '66117',
        phone: '+49 681 506-5555',
        email: 'kfz@rvsbr.de',
        website: 'https://www.regionalverband-saarbruecken.de/kfz'
      },
      services: ['KFZ-Anmeldung', 'KFZ-Abmeldung', 'Ummeldung', 'Kennzeichen-Reservierung', 'Fahrzeugbriefe', 'H-Kennzeichen'],
      openingHours: {
        'Mo-Mi': '7:30-15:30',
        'Do': '7:30-18:00',
        'Fr': '7:30-12:00'
      },
      onlineServices: ['Online-Anmeldung', 'Terminbuchung', 'Wunschkennzeichen'],
      keywords: ['auto', 'anmeldung', 'kennzeichen', 'fahrzeug', 'brief']
    },
    
    // BUNDESBEHÖRDEN
    {
      id: 'arbeitsagentur-saarbruecken',
      name: 'Agentur für Arbeit Saarbrücken',
      category: 'bundesbehoerden',
      type: 'arbeitsagentur',
      description: 'Zentrale für Arbeitslosengeld, Jobvermittlung und Berufsberatung',
      address: {
        street: 'Hafenstraße 18',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 800 4555500',
        email: 'saarbruecken@arbeitsagentur.de',
        website: 'https://www.arbeitsagentur.de'
      },
      services: ['Arbeitslosengeld I', 'Jobvermittlung', 'Berufsberatung', 'Weiterbildung', 'Gründungsberatung'],
      openingHours: {
        'Mo-Fr': '8:00-12:30',
        'Do': '14:00-18:00'
      },
      onlineServices: ['Online-Antrag ALG', 'Jobbörse', 'Terminerinnerung'],
      keywords: ['arbeitslos', 'job', 'beratung', 'arbeitslosengeld', 'beruf']
    },
    {
      id: 'jobcenter-saarbruecken',
      name: 'Jobcenter Regionalverband Saarbrücken',
      category: 'bundesbehoerden',
      type: 'jobcenter',
      description: 'Arbeitslosengeld II (Hartz IV) und Eingliederungsmaßnahmen',
      address: {
        street: 'Eschberger Weg 68',
        city: 'Saarbrücken',
        zipCode: '66121',
        phone: '+49 681 944-0',
        email: 'jobcenter-regionalverband-saarbruecken@jobcenter-ge.de',
        website: 'https://www.jobcenter-saarbruecken.de'
      },
      services: ['Arbeitslosengeld II', 'Sozialgeld', 'Eingliederung', 'Bildungspaket', 'Wohngeld'],
      openingHours: {
        'Mo-Mi': '8:00-15:30',
        'Do': '8:00-18:00',
        'Fr': '8:00-12:00'
      },
      onlineServices: ['Online-Antrag', 'Veränderungsmitteilung'],
      keywords: ['hartz', 'alg2', 'sozialgeld', 'grundsicherung', 'existenzminimum']
    },
    {
      id: 'finanzamt-saarbruecken',
      name: 'Finanzamt Saarbrücken',
      category: 'landesbehoerden',
      type: 'finanzamt',
      description: 'Steuerverwaltung für Privatpersonen und Unternehmen',
      address: {
        street: 'Mainzer Straße 109-111',
        city: 'Saarbrücken',
        zipCode: '66121',
        phone: '+49 681 3000-0',
        email: 'poststelle@fa-sb.saarland.de',
        website: 'https://www.saarland.de/finanzamt_saarbruecken.htm'
      },
      services: ['Einkommensteuer', 'Gewerbesteuer', 'Umsatzsteuer', 'Erbschaftsteuer', 'Steuerberatung'],
      openingHours: {
        'Mo-Di': '7:30-15:00',
        'Mi': '7:30-17:00',
        'Do': '7:30-15:00',
        'Fr': '7:30-12:00'
      },
      onlineServices: ['ELSTER Online', 'Steuererklärung digital'],
      keywords: ['steuer', 'finanzamt', 'einkommensteuer', 'gewerbe', 'umsatz']
    },
    
    // JUSTIZ & GERICHTE
    {
      id: 'amtsgericht-saarbruecken',
      name: 'Amtsgericht Saarbrücken',
      category: 'justiz',
      type: 'amtsgericht',
      description: 'Zuständig für Zivilsachen, Familiensachen und Strafsachen',
      address: {
        street: 'Franz-Josef-Röder-Straße 15',
        city: 'Saarbrücken',
        zipCode: '66119',
        phone: '+49 681 501-0',
        email: 'poststelle@ag-sb.justiz.saarland.de',
        website: 'https://www.saarland.de/amtsgericht_saarbruecken.htm'
      },
      services: ['Mahnverfahren', 'Insolvenzverfahren', 'Grundbuchamt', 'Handelsregister', 'Vereinsregister'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-16:00'
      },
      onlineServices: ['Online-Mahnverfahren', 'Handelsregister-Abruf'],
      keywords: ['gericht', 'mahnung', 'insolvenz', 'grundbuch', 'handelsregister']
    },
    {
      id: 'landgericht-saarbruecken',
      name: 'Landgericht Saarbrücken',
      category: 'justiz',
      type: 'landgericht',
      description: 'Übergeordnetes Gericht für schwere Zivil- und Strafsachen',
      address: {
        street: 'Am Römerkastell 6',
        city: 'Saarbrücken',
        zipCode: '66117',
        phone: '+49 681 501-800',
        email: 'poststelle@lg-sb.justiz.saarland.de',
        website: 'https://www.saarland.de/landgericht_saarbruecken.htm'
      },
      services: ['Zivilkammer', 'Strafkammer', 'Berufungsverfahren', 'Zwangsversteigerung'],
      openingHours: {
        'Mo-Fr': '8:00-12:00'
      },
      onlineServices: ['Terminsabruf online'],
      keywords: ['landgericht', 'berufung', 'zwangsversteigerung', 'zivilsache']
    },
    
    // POLIZEI & SICHERHEIT
    {
      id: 'polizeipraesidium-saarland',
      name: 'Polizeipräsidium Saarland',
      category: 'polizei',
      type: 'polizeipraesidium',
      description: 'Zentrale der Landespolizei Saarland mit Präventions- und Ermittlungsarbeit',
      address: {
        street: 'Sämannstraße 4',
        city: 'Saarbrücken',
        zipCode: '66130',
        phone: '+49 681 962-0',
        email: 'pp-saarland@polizei.saarland.de',
        website: 'https://www.saarland.de/polizei.htm'
      },
      services: ['Strafanzeige', 'Führungszeugnis', 'Fundsachen', 'Verkehrsordnungswidrigkeiten', 'Prävention'],
      openingHours: {
        'Mo-Fr': '8:00-16:00',
        'Notfall': '24/7 über 110'
      },
      onlineServices: ['Online-Anzeige', 'Fundsachen-Suche'],
      keywords: ['polizei', 'anzeige', 'fundsachen', 'führungszeugnis', 'verkehr']
    },
    {
      id: 'polizeidirektion-sb',
      name: 'Polizeidirektion Saarbrücken',
      category: 'polizei',
      type: 'polizeidirektion',
      description: 'Regionale Polizeidirektion für Saarbrücken und Umgebung',
      address: {
        street: 'Lebacher Straße 4',
        city: 'Saarbrücken',
        zipCode: '66113',
        phone: '+49 681 962-4000',
        email: 'pd-saarbruecken@polizei.saarland.de',
        website: 'https://www.saarland.de/polizei.htm'
      },
      services: ['Bürgersprechstunde', 'Verkehrsunfälle', 'Präventionsberatung', 'Ordnungswidrigkeiten'],
      openingHours: {
        'Mo-Do': '8:00-16:00',
        'Fr': '8:00-14:00'
      },
      onlineServices: ['Termin-Vereinbarung'],
      keywords: ['polizei', 'unfall', 'prävention', 'beratung', 'verkehr']
    },
    
    // GESUNDHEITSBEHÖRDEN
    {
      id: 'gesundheitsamt-saarbruecken',
      name: 'Gesundheitsamt Regionalverband Saarbrücken',
      category: 'gesundheit',
      type: 'gesundheitsamt',
      description: 'Öffentlicher Gesundheitsdienst mit Prävention und Gesundheitsschutz',
      address: {
        street: 'Stengelstraße 10-12',
        city: 'Saarbrücken',
        zipCode: '66117',
        phone: '+49 681 506-5300',
        email: 'gesundheitsamt@rvsbr.de',
        website: 'https://www.regionalverband-saarbruecken.de/gesundheit'
      },
      services: ['Impfungen', 'Hygienekontrolle', 'Schuluntersuchungen', 'Infektionsschutz', 'Gesundheitszeugnis'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-16:00'
      },
      onlineServices: ['Impftermin-Buchung', 'Gesundheitszeugnis-Antrag'],
      keywords: ['impfung', 'hygiene', 'schule', 'infektion', 'gesundheitszeugnis']
    },
    
    // BILDUNGSBEHÖRDEN
    {
      id: 'schulamt-saarbruecken',
      name: 'Ministerium für Bildung und Kultur - Außenstelle Saarbrücken',
      category: 'bildung',
      type: 'schulamt',
      description: 'Schulaufsicht und -verwaltung für den Regionalverband Saarbrücken',
      address: {
        street: 'Trierer Straße 33',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 681 501-7000',
        email: 'ministerium@bildung.saarland.de',
        website: 'https://www.saarland.de/mbk.htm'
      },
      services: ['Schulanmeldung', 'Schulwechsel', 'Schülerbeförderung', 'Beurlaubung', 'Schullaufbahnberatung'],
      openingHours: {
        'Mo-Do': '8:00-16:00',
        'Fr': '8:00-14:00'
      },
      onlineServices: ['Online-Anmeldung weiterführende Schulen'],
      keywords: ['schule', 'anmeldung', 'wechsel', 'beförderung', 'laufbahn']
    },
    
    // WIRTSCHAFTSBEHÖRDEN
    {
      id: 'ihk-saarland',
      name: 'IHK Saarland',
      category: 'wirtschaft',
      type: 'kammer',
      description: 'Industrie- und Handelskammer für alle gewerblichen Unternehmen',
      address: {
        street: 'Franz-Josef-Röder-Straße 9',
        city: 'Saarbrücken',
        zipCode: '66119',
        phone: '+49 681 9520-0',
        email: 'info@saarland.ihk.de',
        website: 'https://www.saarland.ihk.de'
      },
      services: ['Gewerbeberatung', 'Ausbildungsberatung', 'Existenzgründung', 'Außenhandel', 'Digitalisierung'],
      openingHours: {
        'Mo-Do': '8:00-17:00',
        'Fr': '8:00-16:00'
      },
      onlineServices: ['Online-Services für Mitglieder', 'Veranstaltungsanmeldung'],
      keywords: ['gewerbe', 'beratung', 'ausbildung', 'gründung', 'handel']
    },
    
    // UMWELTBEHÖRDEN
    {
      id: 'umweltamt-saarbruecken',
      name: 'Amt für Umwelt- und Verbraucherschutz',
      category: 'umwelt',
      type: 'umweltamt',
      description: 'Umweltschutz, Abfallwirtschaft und Verbraucherschutz',
      address: {
        street: 'Bismarckstraße 5',
        city: 'Saarbrücken',
        zipCode: '66111',
        phone: '+49 681 905-5000',
        email: 'umwelt@saarbruecken.de',
        website: 'https://www.saarbruecken.de/leben_in_saarbruecken/umwelt'
      },
      services: ['Abfallberatung', 'Lärmschutz', 'Baumschutz', 'Umweltgenehmigungen', 'Verbraucherschutz'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-16:00'
      },
      onlineServices: ['Abfuhrtermine', 'Sperrmüll-Anmeldung'],
      keywords: ['umwelt', 'abfall', 'lärm', 'baum', 'verbraucher']
    },
    
    // WEITERE STÄDTE IM SAARLAND
    {
      id: 'rathaus-neunkirchen',
      name: 'Rathaus Neunkirchen',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Stadtverwaltung Neunkirchen mit allen Bürgerservices',
      address: {
        street: 'Rathausplatz 1',
        city: 'Neunkirchen',
        zipCode: '66538',
        phone: '+49 6821 202-0',
        email: 'stadt@neunkirchen.de',
        website: 'https://www.neunkirchen.de'
      },
      services: ['Bürgerdienste', 'Personalausweis', 'An-/Ummeldung', 'Gewerbeanmeldung'],
      openingHours: {
        'Mo-Fr': '8:00-16:00',
        'Do': '8:00-18:00'
      },
      onlineServices: ['Online-Terminbuchung'],
      keywords: ['neunkirchen', 'rathaus', 'bürgerdienste', 'anmeldung']
    },
    {
      id: 'rathaus-homburg',
      name: 'Rathaus Homburg',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Universitätsstadt Homburg - Bürgerdienste und Verwaltung',
      address: {
        street: 'Am Forum 5',
        city: 'Homburg',
        zipCode: '66424',
        phone: '+49 6841 101-0',
        email: 'info@homburg.de',
        website: 'https://www.homburg.de'
      },
      services: ['Meldewesen', 'Personalausweis', 'KFZ-Angelegenheiten', 'Gewerbeanmeldung'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-18:00'
      },
      onlineServices: ['Bürger-Portal'],
      keywords: ['homburg', 'universität', 'meldewesen', 'gewerbe']
    },
    {
      id: 'rathaus-völklingen',
      name: 'Rathaus Völklingen',
      category: 'kommunal',
      type: 'stadtverwaltung', 
      description: 'Mittelstadt Völklingen mit UNESCO-Welterbe Völklinger Hütte',
      address: {
        street: 'Rathausplatz 1',
        city: 'Völklingen',
        zipCode: '66333',
        phone: '+49 6898 13-0',
        email: 'info@voelklingen.de',
        website: 'https://www.voelklingen.de'
      },
      services: ['Bürgerbüro', 'Personalausweis', 'Anmeldungen', 'Führungszeugnis'],
      openingHours: {
        'Mo-Mi': '8:00-15:30',
        'Do': '8:00-18:00',
        'Fr': '8:00-12:00'
      },
      onlineServices: ['Terminvereinbarung online'],
      keywords: ['völklingen', 'welterbe', 'hütte', 'bürgerbüro']
    },
    {
      id: 'rathaus-saarlouis',
      name: 'Rathaus Saarlouis',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Festungsstadt Saarlouis mit französischem Flair',
      address: {
        street: 'Großer Markt 1',
        city: 'Saarlouis',
        zipCode: '66740',
        phone: '+49 6831 443-0',
        email: 'stadt@saarlouis.de',
        website: 'https://www.saarlouis.de'
      },
      services: ['Einwohnermeldeamt', 'Ordnungsamt', 'Bauamt', 'Standesamt'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-16:00'
      },
      onlineServices: ['Online-Services'],
      keywords: ['saarlouis', 'festung', 'französisch', 'meldeamt']
    },
    {
      id: 'rathaus-merzig',
      name: 'Rathaus Merzig',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Kreisstadt Merzig an der Saar mit modernen Bürgerdiensten',
      address: {
        street: 'Bahnhofstraße 44',
        city: 'Merzig',
        zipCode: '66663',
        phone: '+49 6861 85-0',
        email: 'stadt@merzig.de',
        website: 'https://www.merzig.de'
      },
      services: ['Bürgerbüro', 'Meldewesen', 'Gewerbeamt', 'Verkehrsamt'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-17:00'
      },
      onlineServices: ['Online-Rathaus'],
      keywords: ['merzig', 'saar', 'kreisstadt', 'bürgerbüro']
    },
    {
      id: 'rathaus-st-wendel',
      name: 'Rathaus Sankt Wendel',
      category: 'kommunal',
      type: 'stadtverwaltung',
      description: 'Kreisstadt Sankt Wendel mit mittelalterlichem Charme',
      address: {
        street: 'Rathausplatz 1',
        city: 'Sankt Wendel',
        zipCode: '66606',
        phone: '+49 6851 809-0',
        email: 'stadt@sankt-wendel.de',
        website: 'https://www.sankt-wendel.de'
      },
      services: ['Bürgerdienste', 'Ordnungsamt', 'Sozialamt', 'Standesamt'],
      openingHours: {
        'Mo-Fr': '8:00-12:00',
        'Do': '14:00-17:00'
      },
      onlineServices: ['Bürgerportal'],
      keywords: ['sankt wendel', 'mittelalter', 'basilika', 'bürgerdienste']
    }
  ],
  categories: {
    kommunal: 'Kommunale Behörden',
    landesbehoerden: 'Landesbehörden',
    bundesbehoerden: 'Bundesbehörden',
    justiz: 'Justiz & Gerichte',
    polizei: 'Polizei & Sicherheit',
    gesundheit: 'Gesundheitsbehörden',
    bildung: 'Bildungsbehörden',
    wirtschaft: 'Wirtschaftsbehörden',
    umwelt: 'Umweltbehörden',
    finanzen: 'Finanzbehörden'
  },
  plzMapping: {
    '66111': ['rathaus-saarbruecken', 'standesamt-saarbruecken', 'arbeitsagentur-saarbruecken'],
    '66117': ['kfz-zulassungsstelle-sb', 'gesundheitsamt-saarbruecken'],
    '66119': ['landratsamt-saarbruecken', 'amtsgericht-saarbruecken', 'ihk-saarland'],
    '66121': ['finanzamt-saarbruecken', 'jobcenter-saarbruecken'],
    '66538': ['rathaus-neunkirchen'],
    '66424': ['rathaus-homburg'],
    '66333': ['rathaus-völklingen'],
    '66740': ['rathaus-saarlouis'],
    '66663': ['rathaus-merzig'],
    '66606': ['rathaus-st-wendel']
  },
  metadata: {
    totalAuthorities: 25,
    lastUpdated: '2025-01-06T16:00:00Z',
    coverage: 'Saarland komplett',
    version: '2.0-maximal'
  }
}

export const runtime = 'edge'

interface Authority {
  id: string
  name: string
  category: string
  type: string
  description: string
  address: {
    street: string
    city: string
    zipCode: string
    phone: string
    email: string
    website: string
  }
  services: string[]
  openingHours: {
    [key: string]: string
  }
  onlineServices: string[]
  keywords: string[]
}

interface SearchFilters {
  category?: string
  type?: string
  zipCode?: string
  service?: string
  keyword?: string
  city?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const filters: SearchFilters = {
      category: searchParams.get('category') || undefined,
      type: searchParams.get('type') || undefined,
      zipCode: searchParams.get('zipCode') || undefined,
      service: searchParams.get('service') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      city: searchParams.get('city') || undefined,
    }

    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredAuthorities = SAARLAND_BEHOERDEN_MAXIMAL.authorities

    // Apply filters
    if (filters.category) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.category === filters.category
      )
    }

    if (filters.type) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.type === filters.type
      )
    }

    if (filters.zipCode) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.address.zipCode === filters.zipCode
      )
    }

    if (filters.city) {
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    // Text search across multiple fields
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => {
        return (
          auth.name.toLowerCase().includes(searchTerm) ||
          auth.description.toLowerCase().includes(searchTerm) ||
          auth.services.some(service => 
            service.toLowerCase().includes(searchTerm)
          ) ||
          auth.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          ) ||
          auth.address.street.toLowerCase().includes(searchTerm) ||
          auth.address.city.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Service-specific search
    if (filters.service) {
      const serviceSearch = filters.service.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.services.some(service => 
          service.toLowerCase().includes(serviceSearch)
        )
      )
    }

    // Keyword search
    if (filters.keyword) {
      const keywordSearch = filters.keyword.toLowerCase()
      filteredAuthorities = filteredAuthorities.filter(auth => 
        auth.keywords.some(keyword => 
          keyword.toLowerCase().includes(keywordSearch)
        )
      )
    }

    // Sort alphabetically
    filteredAuthorities.sort((a, b) => a.name.localeCompare(b.name))

    // Apply pagination
    const total = filteredAuthorities.length
    const paginatedResults = filteredAuthorities.slice(offset, offset + limit)

    // Generate suggestions based on search
    const suggestions = generateSuggestions(query, filters)

    const response = {
      success: true,
      data: {
        authorities: paginatedResults,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        filters: {
          applied: filters,
          available: {
            categories: SAARLAND_BEHOERDEN_MAXIMAL.categories,
            types: Array.from(new Set(SAARLAND_BEHOERDEN_MAXIMAL.authorities.map(a => a.type))),
            cities: Array.from(new Set(SAARLAND_BEHOERDEN_MAXIMAL.authorities.map(a => a.address.city))),
            zipCodes: Array.from(new Set(SAARLAND_BEHOERDEN_MAXIMAL.authorities.map(a => a.address.zipCode)))
          }
        },
        suggestions,
        metadata: SAARLAND_BEHOERDEN_MAXIMAL.metadata
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('Behörden API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search authorities',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zipCode, services, emergencyContact } = body

    if (!zipCode) {
      return NextResponse.json(
        { success: false, error: 'PLZ ist erforderlich' },
        { status: 400 }
      )
    }

    // Find authorities by PLZ
    const authoritiesInPLZ = SAARLAND_BEHOERDEN_MAXIMAL.plzMapping[zipCode] || []
    const relevantAuthorities = SAARLAND_BEHOERDEN_MAXIMAL.authorities.filter(auth => 
      authoritiesInPLZ.includes(auth.id)
    )

    // If specific services requested, filter by services
    let recommendedServices = relevantAuthorities
    if (services && services.length > 0) {
      recommendedServices = relevantAuthorities.filter(auth =>
        services.some((service: string) => 
          auth.services.some(authService => 
            authService.toLowerCase().includes(service.toLowerCase())
          )
        )
      )
    }

    // Find emergency contacts if needed
    let emergencyInfo: any = null
    if (emergencyContact) {
      emergencyInfo = {
        police: "110",
        fire: "112",
        medical: "112",
        poison: "0681 19240",
        localPolice: relevantAuthorities.find(auth => 
          auth.category === 'polizei'
        )?.address.phone
      }
    }

    const response = {
      success: true,
      data: {
        zipCode,
        authoritiesInArea: relevantAuthorities,
        recommendedServices,
        emergencyInfo,
        quickLinks: {
          buergeramt: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('bürgeramt')
          ),
          kfzZulassung: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('kfz')
          ),
          finanzamt: relevantAuthorities.find(auth => 
            auth.name.toLowerCase().includes('finanzamt')
          )
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Behörden POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process authority request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateSuggestions(query: string, filters: SearchFilters): string[] {
  const suggestions: string[] = []
  
  // Common service suggestions
  const commonServices = [
    "Personalausweis beantragen",
    "KFZ-Zulassung",
    "Heirat anmelden",
    "Steuererklärung",
    "Arbeitslosengeld",
    "Wohngeld beantragen",
    "Gewerbe anmelden",
    "Führerschein beantragen",
    "Gesundheitszeugnis",
    "Polizeiliches Führungszeugnis"
  ]

  // Add service suggestions based on query
  if (query) {
    const matchingServices = commonServices.filter(service =>
      service.toLowerCase().includes(query.toLowerCase())
    )
    suggestions.push(...matchingServices.slice(0, 3))
  }

  // Add category suggestions
  if (!filters.category) {
    suggestions.push("Alle Kommunalverwaltungen", "Alle Landesbehörden", "Alle Finanzämter")
  }

  return suggestions.slice(0, 5)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}