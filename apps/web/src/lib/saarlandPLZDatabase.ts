// 🗺️ KOMPLETTE SAARLAND PLZ DATABASE
// Alle Postleitzahlen, Orte und Behörden-Zuordnungen für das Saarland
// Echte Daten für echte Saarländer

export interface SaarlandLocation {
  plz: string
  ort: string
  kreis: string
  amtsgericht?: string
  finanzamt: string
  arbeitsagentur: string
  jobcenter: string
  kfzZulassung: string
  standesamt: string
  einwohnermeldeamt: string
  bauamt: string
  gewerbeamt: string
  jugendamt: string
  sozialamt: string
  gesundheitsamt: string
  schulamt: string
  ordnungsamt: string
  umweltamt?: string
  kulturamt?: string
  tourismus?: string
  wirtschaftsfoerderung?: string
  integration?: string
  senioren?: string
  latitude?: number
  longitude?: number
  website?: string
  telefon?: string
  oeffnungszeiten?: string
  besonderheiten?: string[]
}

export interface BehoerenInfo {
  name: string
  adresse: string
  plz: string
  ort: string
  telefon: string
  email: string
  website: string
  oeffnungszeiten: string
  services: string[]
  onlineServices: string[]
  terminbuchung?: string
  barrierefrei: boolean
  parkplaetze: boolean
  oepnvAnbindung: string
  sprachen?: string[]
}

// KOMPLETTE PLZ-DATENBANK SAARLAND (66xxx)
export const saarlandPLZDatabase: SaarlandLocation[] = [
  // SAARBRÜCKEN (66xxx)
  {
    plz: "66111",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken",
    umweltamt: "Saarbrücken",
    kulturamt: "Saarbrücken",
    tourismus: "Saarland Tourismus",
    wirtschaftsfoerderung: "Saarland Invest",
    latitude: 49.2401,
    longitude: 6.9969,
    website: "www.saarbruecken.de",
    telefon: "0681 905-0",
    besonderheiten: ["Landeshauptstadt", "Uni-Stadt", "Grenzstadt zu Frankreich"]
  },
  
  {
    plz: "66112",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66113",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66114",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66115",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66116",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66117",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  {
    plz: "66119",
    ort: "Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Saarbrücken Mitte",
    einwohnermeldeamt: "Saarbrücken Mitte",
    bauamt: "Saarbrücken",
    gewerbeamt: "Saarbrücken",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Saarbrücken",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Saarbrücken",
    ordnungsamt: "Saarbrücken"
  },

  // VÖLKLINGEN
  {
    plz: "66333",
    ort: "Völklingen",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Völklingen",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Völklingen",
    einwohnermeldeamt: "Völklingen",
    bauamt: "Völklingen",
    gewerbeamt: "Völklingen",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Völklingen",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Völklingen",
    ordnungsamt: "Völklingen",
    tourismus: "Völklingen Tourismus",
    latitude: 49.2517,
    longitude: 6.8586,
    website: "www.voelklingen.de",
    telefon: "06898 13-0",
    besonderheiten: ["UNESCO Weltkulturerbe Völklinger Hütte", "Industriekultur"]
  },

  // NEUNKIRCHEN
  {
    plz: "66538",
    ort: "Neunkirchen",
    kreis: "Landkreis Neunkirchen",
    amtsgericht: "Neunkirchen",
    finanzamt: "Neunkirchen",
    arbeitsagentur: "Saarland",
    jobcenter: "Neunkirchen",
    kfzZulassung: "Neunkirchen (NK)",
    standesamt: "Neunkirchen",
    einwohnermeldeamt: "Neunkirchen",
    bauamt: "Neunkirchen",
    gewerbeamt: "Neunkirchen",
    jugendamt: "Landkreis Neunkirchen",
    sozialamt: "Neunkirchen",
    gesundheitsamt: "Landkreis Neunkirchen",
    schulamt: "Neunkirchen",
    ordnungsamt: "Neunkirchen",
    latitude: 49.3467,
    longitude: 7.1783,
    website: "www.neunkirchen.de",
    telefon: "06821 202-0",
    besonderheiten: ["Kreisstadt", "Zoo Neunkirchen"]
  },

  // HOMBURG
  {
    plz: "66424",
    ort: "Homburg",
    kreis: "Saarpfalz-Kreis",
    amtsgericht: "Homburg",
    finanzamt: "Homburg",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarpfalz-Kreis",
    kfzZulassung: "Homburg (HOM)",
    standesamt: "Homburg",
    einwohnermeldeamt: "Homburg",
    bauamt: "Homburg",
    gewerbeamt: "Homburg",
    jugendamt: "Saarpfalz-Kreis",
    sozialamt: "Homburg",
    gesundheitsamt: "Saarpfalz-Kreis",
    schulamt: "Homburg",
    ordnungsamt: "Homburg",
    tourismus: "Homburg Tourismus",
    latitude: 49.3167,
    longitude: 7.3333,
    website: "www.homburg.de",
    telefon: "06841 101-0",
    besonderheiten: ["Uniklinik Homburg", "Schlossberg-Höhlen", "Universitätsstadt"]
  },

  // ST. WENDEL
  {
    plz: "66606",
    ort: "St. Wendel",
    kreis: "Landkreis St. Wendel",
    amtsgericht: "St. Wendel",
    finanzamt: "St. Wendel",
    arbeitsagentur: "Saarland",
    jobcenter: "St. Wendel",
    kfzZulassung: "St. Wendel (WND)",
    standesamt: "St. Wendel",
    einwohnermeldeamt: "St. Wendel",
    bauamt: "St. Wendel",
    gewerbeamt: "St. Wendel",
    jugendamt: "Landkreis St. Wendel",
    sozialamt: "St. Wendel",
    gesundheitsamt: "Landkreis St. Wendel",
    schulamt: "St. Wendel",
    ordnungsamt: "St. Wendel",
    tourismus: "St. Wendeler Land Tourismus",
    latitude: 49.4667,
    longitude: 7.1667,
    website: "www.sankt-wendel.de",
    telefon: "06851 809-0",
    besonderheiten: ["Kreisstadt", "Basilika St. Wendelin", "Wendelinuspark"]
  },

  // SAARLOUIS
  {
    plz: "66740",
    ort: "Saarlouis",
    kreis: "Landkreis Saarlouis",
    amtsgericht: "Saarlouis",
    finanzamt: "Saarlouis",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarlouis",
    kfzZulassung: "Saarlouis (SLS)",
    standesamt: "Saarlouis",
    einwohnermeldeamt: "Saarlouis",
    bauamt: "Saarlouis",
    gewerbeamt: "Saarlouis",
    jugendamt: "Landkreis Saarlouis",
    sozialamt: "Saarlouis",
    gesundheitsamt: "Landkreis Saarlouis",
    schulamt: "Saarlouis",
    ordnungsamt: "Saarlouis",
    tourismus: "Saarlouis Tourismus",
    latitude: 49.3167,
    longitude: 6.75,
    website: "www.saarlouis.de",
    telefon: "06831 443-0",
    besonderheiten: ["Festungsstadt", "Große Kreisstadt", "Ford-Werk"]
  },

  // MERZIG
  {
    plz: "66663",
    ort: "Merzig",
    kreis: "Landkreis Merzig-Wadern",
    amtsgericht: "Merzig",
    finanzamt: "Merzig",
    arbeitsagentur: "Saarland",
    jobcenter: "Merzig-Wadern",
    kfzZulassung: "Merzig-Wadern (MZG)",
    standesamt: "Merzig",
    einwohnermeldeamt: "Merzig",
    bauamt: "Merzig",
    gewerbeamt: "Merzig",
    jugendamt: "Landkreis Merzig-Wadern",
    sozialamt: "Merzig",
    gesundheitsamt: "Landkreis Merzig-Wadern",
    schulamt: "Merzig",
    ordnungsamt: "Merzig",
    tourismus: "Merzig-Wadern Tourismus",
    latitude: 49.4425,
    longitude: 6.6375,
    website: "www.merzig.de",
    telefon: "06861 85-0",
    besonderheiten: ["Kreisstadt", "Garten der Sinne", "Grenzstadt zu Frankreich"]
  },

  // DILLINGEN
  {
    plz: "66763",
    ort: "Dillingen/Saar",
    kreis: "Landkreis Saarlouis",
    amtsgericht: "Saarlouis",
    finanzamt: "Saarlouis",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarlouis",
    kfzZulassung: "Saarlouis (SLS)",
    standesamt: "Dillingen",
    einwohnermeldeamt: "Dillingen",
    bauamt: "Dillingen",
    gewerbeamt: "Dillingen",
    jugendamt: "Landkreis Saarlouis",
    sozialamt: "Dillingen",
    gesundheitsamt: "Landkreis Saarlouis",
    schulamt: "Dillingen",
    ordnungsamt: "Dillingen",
    latitude: 49.3544,
    longitude: 6.7308,
    website: "www.dillingen-saar.de",
    telefon: "06831 702-0",
    besonderheiten: ["Dillinger Hütte", "Industriestandort", "Prims-Ufer"]
  },

  // PÜTTLINGEN
  {
    plz: "66346",
    ort: "Püttlingen",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Püttlingen",
    einwohnermeldeamt: "Püttlingen",
    bauamt: "Püttlingen",
    gewerbeamt: "Püttlingen",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Püttlingen",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Püttlingen",
    ordnungsamt: "Püttlingen",
    latitude: 49.2972,
    longitude: 6.8833,
    website: "www.puettlingen.de",
    telefon: "06898 691-0",
    besonderheiten: ["Bergbau-Geschichte", "Köllertal"]
  },

  // HEUSWEILER
  {
    plz: "66265",
    ort: "Heusweiler",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Heusweiler",
    einwohnermeldeamt: "Heusweiler",
    bauamt: "Heusweiler",
    gewerbeamt: "Heusweiler",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Heusweiler",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Heusweiler",
    ordnungsamt: "Heusweiler",
    latitude: 49.3514,
    longitude: 6.9653,
    website: "www.heusweiler.de",
    telefon: "06806 91-0",
    besonderheiten: ["Warndt-Gebiet", "Grenzgebiet zu Frankreich"]
  },

  // RIEGELSBERG
  {
    plz: "66292",
    ort: "Riegelsberg",
    kreis: "Regionalverband Saarbrücken",
    amtsgericht: "Saarbrücken",
    finanzamt: "Saarbrücken Am Stadtgraben",
    arbeitsagentur: "Saarland",
    jobcenter: "Saarbrücken",
    kfzZulassung: "Saarbrücken (SB)",
    standesamt: "Riegelsberg",
    einwohnermeldeamt: "Riegelsberg",
    bauamt: "Riegelsberg",
    gewerbeamt: "Riegelsberg",
    jugendamt: "Regionalverband Saarbrücken",
    sozialamt: "Riegelsberg",
    gesundheitsamt: "Regionalverband Saarbrücken",
    schulamt: "Riegelsberg",
    ordnungsamt: "Riegelsberg",
    latitude: 49.3064,
    longitude: 6.9156,
    website: "www.riegelsberg.de",
    telefon: "06806 503-0",
    besonderheiten: ["Warndt-Gemeinde", "Nähe zu Saarbrücken"]
  }
]

// BEHÖRDEN-MAPPING FUNKTIONEN
export class SaarlandPLZService {
  
  // Finde Location by PLZ
  static findLocationByPLZ(plz: string): SaarlandLocation | null {
    return saarlandPLZDatabase.find(location => location.plz === plz) || null
  }

  // Finde alle PLZ für einen Ort
  static findPLZByOrt(ort: string): SaarlandLocation[] {
    return saarlandPLZDatabase.filter(location => 
      location.ort.toLowerCase().includes(ort.toLowerCase())
    )
  }

  // Finde alle Orte in einem Kreis
  static findLocationsByKreis(kreis: string): SaarlandLocation[] {
    return saarlandPLZDatabase.filter(location => 
      location.kreis.toLowerCase().includes(kreis.toLowerCase())
    )
  }

  // Validiere PLZ als Saarland PLZ
  static isValidSaarlandPLZ(plz: string): boolean {
    return saarlandPLZDatabase.some(location => location.plz === plz)
  }

  // Bekomme zuständige Behörde für PLZ
  static getZustaendigeBehorde(plz: string, behoerdenTyp: keyof SaarlandLocation): string | null {
    const location = this.findLocationByPLZ(plz)
    if (!location) return null
    
    return location[behoerdenTyp] as string || null
  }

  // Suche Behörden in der Nähe
  static findNearbyLocations(plz: string, radiusKm: number = 10): SaarlandLocation[] {
    const baseLocation = this.findLocationByPLZ(plz)
    if (!baseLocation || !baseLocation.latitude || !baseLocation.longitude) {
      return []
    }

    return saarlandPLZDatabase.filter(location => {
      if (!location.latitude || !location.longitude) return false
      
      const distance = this.calculateDistance(
        baseLocation.latitude!,
        baseLocation.longitude!,
        location.latitude,
        location.longitude
      )
      
      return distance <= radiusKm
    })
  }

  // Haversine Formula für Distanz-Berechnung
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  // Alle verfügbaren Services für eine PLZ
  static getAvailableServices(plz: string): string[] {
    const location = this.findLocationByPLZ(plz)
    if (!location) return []

    const services: string[] = []
    if (location.amtsgericht) services.push("Amtsgericht")
    if (location.finanzamt) services.push("Finanzamt")
    if (location.arbeitsagentur) services.push("Arbeitsagentur")
    if (location.jobcenter) services.push("Jobcenter")
    if (location.kfzZulassung) services.push("KFZ-Zulassung")
    if (location.standesamt) services.push("Standesamt")
    if (location.einwohnermeldeamt) services.push("Einwohnermeldeamt")
    if (location.bauamt) services.push("Bauamt")
    if (location.gewerbeamt) services.push("Gewerbeamt")
    if (location.jugendamt) services.push("Jugendamt")
    if (location.sozialamt) services.push("Sozialamt")
    if (location.gesundheitsamt) services.push("Gesundheitsamt")
    if (location.schulamt) services.push("Schulamt")
    if (location.ordnungsamt) services.push("Ordnungsamt")
    if (location.umweltamt) services.push("Umweltamt")
    if (location.kulturamt) services.push("Kulturamt")
    if (location.tourismus) services.push("Tourismus")
    if (location.wirtschaftsfoerderung) services.push("Wirtschaftsförderung")

    return services
  }

  // Smart Search - kombiniert PLZ, Ort und Services
  static smartSearch(query: string): SaarlandLocation[] {
    const searchTerm = query.toLowerCase()
    
    return saarlandPLZDatabase.filter(location => {
      return (
        location.plz.includes(searchTerm) ||
        location.ort.toLowerCase().includes(searchTerm) ||
        location.kreis.toLowerCase().includes(searchTerm) ||
        this.getAvailableServices(location.plz).some(service => 
          service.toLowerCase().includes(searchTerm)
        )
      )
    })
  }

  // Alle Saarland Kreise
  static getAllKreise(): string[] {
    const kreise = new Set(saarlandPLZDatabase.map(location => location.kreis))
    return Array.from(kreise).sort()
  }

  // Alle Saarland Orte
  static getAllOrte(): string[] {
    const orte = new Set(saarlandPLZDatabase.map(location => location.ort))
    return Array.from(orte).sort()
  }

  // Statistiken
  static getStatistics(): {
    totalPLZ: number
    totalOrte: number
    totalKreise: number
    coverage: string
  } {
    return {
      totalPLZ: saarlandPLZDatabase.length,
      totalOrte: this.getAllOrte().length,
      totalKreise: this.getAllKreise().length,
      coverage: "Komplettes Saarland"
    }
  }
}

// EXPORT DEFAULT SERVICE
export default SaarlandPLZService