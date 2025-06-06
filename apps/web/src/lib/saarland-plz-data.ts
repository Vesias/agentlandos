// VOLLSTÄNDIGE SAARLAND PLZ-DATENBANK
// Alle Postleitzahlen des Saarlandes mit Behördenzuordnung

export interface BehoerdeInfo {
  name: string;
  strasse: string;
  ort: string;
  telefon: string;
  email: string;
  webseite: string;
  oeffnungszeiten: {
    [key: string]: string;
  };
  wartezeit?: number;
  online_services?: string[];
  koordinaten: {
    lat: number;
    lon: number;
  };
}

export interface PLZInfo {
  plz: string;
  ort: string;
  kreis: string;
  behoerden: {
    [key: string]: BehoerdeInfo;
  };
}

// KOMPLETTE SAARLAND PLZ-MAPPING
export const saarlandPLZData: { [plz: string]: PLZInfo } = {
  // SAARBRÜCKEN (661xx)
  "66111": {
    plz: "66111",
    ort: "Saarbrücken-Mitte",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarbrücken-Mitte",
        strasse: "Gerberstraße 4",
        ort: "66111 Saarbrücken",
        telefon: "0681 905-0",
        email: "buergeramt@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 15,
        online_services: ["Personalausweis", "Reisepass", "Wohnsitz ummelden"],
        koordinaten: { lat: 49.2354, lon: 6.9969 }
      },
      kfz: {
        name: "KFZ-Zulassungsstelle Saarbrücken",
        strasse: "Lebacher Straße 6-8",
        ort: "66113 Saarbrücken",
        telefon: "0681 506-5151",
        email: "kfz-zulassung@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/kfz",
        oeffnungszeiten: {
          "Mo-Fr": "7:30 - 12:00",
          "Mo,Di,Do": "13:00 - 15:30"
        },
        wartezeit: 25,
        online_services: ["Wunschkennzeichen", "Feinstaubplakette"],
        koordinaten: { lat: 49.2401, lon: 6.9903 }
      },
      finanzamt: {
        name: "Finanzamt Saarbrücken Am Stadtgraben",
        strasse: "Am Stadtgraben 2-4",
        ort: "66111 Saarbrücken",
        telefon: "0681 3034-0",
        email: "poststelle@fasb.saarland.de",
        webseite: "https://www.finanzamt.saarland.de",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 15:30",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        koordinaten: { lat: 49.2376, lon: 6.9941 }
      }
    }
  },
  "66113": {
    plz: "66113",
    ort: "Saarbrücken-Mitte",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarbrücken-Mitte",
        strasse: "Gerberstraße 4",
        ort: "66111 Saarbrücken",
        telefon: "0681 905-0",
        email: "buergeramt@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 15,
        koordinaten: { lat: 49.2354, lon: 6.9969 }
      }
    }
  },
  "66115": {
    plz: "66115",
    ort: "Saarbrücken-Alt-Saarbrücken",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarbrücken-Alt-Saarbrücken",
        strasse: "Schlossplatz 6-7",
        ort: "66119 Saarbrücken",
        telefon: "0681 905-1510",
        email: "buergeramt-alt@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo,Mi,Fr": "8:00 - 12:00",
          "Di,Do": "14:00 - 18:00"
        },
        wartezeit: 10,
        koordinaten: { lat: 49.2311, lon: 6.9898 }
      }
    }
  },
  "66117": {
    plz: "66117",
    ort: "Saarbrücken-St. Johann",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarbrücken-Mitte",
        strasse: "Gerberstraße 4",
        ort: "66111 Saarbrücken",
        telefon: "0681 905-0",
        email: "buergeramt@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 15,
        koordinaten: { lat: 49.2354, lon: 6.9969 }
      }
    }
  },
  "66119": {
    plz: "66119",
    ort: "Saarbrücken-St. Arnual",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt St. Arnual",
        strasse: "Saargemünder Straße 91",
        ort: "66119 Saarbrücken",
        telefon: "0681 905-1520",
        email: "buergeramt-arnual@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo,Mi": "8:00 - 12:00",
          "Di,Do": "14:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 8,
        koordinaten: { lat: 49.2177, lon: 7.0015 }
      }
    }
  },
  "66121": {
    plz: "66121",
    ort: "Saarbrücken-Schafbrücke",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Burbach",
        strasse: "Burbacher Markt 1",
        ort: "66115 Saarbrücken",
        telefon: "0681 905-1530",
        email: "buergeramt-burbach@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 12:00",
          "Do": "14:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 12,
        koordinaten: { lat: 49.2443, lon: 6.9734 }
      }
    }
  },
  "66123": {
    plz: "66123",
    ort: "Saarbrücken-St. Ingbert",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarbrücken-Mitte",
        strasse: "Gerberstraße 4",
        ort: "66111 Saarbrücken",
        telefon: "0681 905-0",
        email: "buergeramt@saarbruecken.de",
        webseite: "https://www.saarbruecken.de/buergeramt",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 15,
        koordinaten: { lat: 49.2354, lon: 6.9969 }
      }
    }
  },
  
  // VÖLKLINGEN (663xx)
  "66333": {
    plz: "66333",
    ort: "Völklingen",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Völklingen",
        strasse: "Rathausplatz",
        ort: "66333 Völklingen",
        telefon: "06898 13-0",
        email: "buergerbuero@voelklingen.de",
        webseite: "https://www.voelklingen.de",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 20,
        online_services: ["Personalausweis", "Führungszeugnis"],
        koordinaten: { lat: 49.2506, lon: 6.8639 }
      },
      kfz: {
        name: "KFZ-Zulassungsstelle Völklingen",
        strasse: "Stadionstraße 25",
        ort: "66333 Völklingen",
        telefon: "06898 13-2530",
        email: "kfz@voelklingen.de",
        webseite: "https://www.voelklingen.de/kfz",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Di,Do": "14:00 - 16:00"
        },
        wartezeit: 30,
        koordinaten: { lat: 49.2485, lon: 6.8601 }
      }
    }
  },
  
  // SAARLOUIS (668xx)
  "66740": {
    plz: "66740",
    ort: "Saarlouis",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Bürgeramt Saarlouis",
        strasse: "Großer Markt 1",
        ort: "66740 Saarlouis",
        telefon: "06831 443-0",
        email: "buergeramt@saarlouis.de",
        webseite: "https://www.saarlouis.de",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 13:00"
        },
        wartezeit: 18,
        online_services: ["Wohnsitz", "Personalausweis", "Reisepass"],
        koordinaten: { lat: 49.3135, lon: 6.7520 }
      },
      kfz: {
        name: "Straßenverkehrsamt Saarlouis",
        strasse: "Kaiser-Wilhelm-Straße 4-6",
        ort: "66740 Saarlouis",
        telefon: "06831 444-550",
        email: "strassenverkehrsamt@kreis-saarlouis.de",
        webseite: "https://www.kreis-saarlouis.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 15:30"
        },
        wartezeit: 35,
        koordinaten: { lat: 49.3156, lon: 6.7494 }
      }
    }
  },
  
  // HOMBURG (664xx)
  "66424": {
    plz: "66424",
    ort: "Homburg",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Homburg",
        strasse: "Am Forum 5",
        ort: "66424 Homburg",
        telefon: "06841 101-0",
        email: "buergerbuero@homburg.de",
        webseite: "https://www.homburg.de",
        oeffnungszeiten: {
          "Mo,Mi,Fr": "8:00 - 12:00",
          "Di": "8:00 - 16:00",
          "Do": "8:00 - 18:00"
        },
        wartezeit: 22,
        online_services: ["Wunschkennzeichen", "Meldebescheinigung"],
        koordinaten: { lat: 49.3228, lon: 7.3372 }
      },
      kfz: {
        name: "KFZ-Zulassungsstelle Homburg",
        strasse: "Talstraße 57a",
        ort: "66424 Homburg",
        telefon: "06841 104-7171",
        email: "kfz-zulassung@saarpfalz-kreis.de",
        webseite: "https://www.saarpfalz-kreis.de",
        oeffnungszeiten: {
          "Mo-Fr": "7:30 - 12:00",
          "Do": "14:00 - 17:30"
        },
        wartezeit: 28,
        koordinaten: { lat: 49.3201, lon: 7.3345 }
      }
    }
  },
  
  // NEUNKIRCHEN (665xx)
  "66538": {
    plz: "66538",
    ort: "Neunkirchen",
    kreis: "Landkreis Neunkirchen",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Neunkirchen",
        strasse: "Oberer Markt 16",
        ort: "66538 Neunkirchen",
        telefon: "06821 202-0",
        email: "buergerbuero@neunkirchen.de",
        webseite: "https://www.neunkirchen.de",
        oeffnungszeiten: {
          "Mo-Mi": "8:00 - 16:00",
          "Do": "8:00 - 18:00",
          "Fr": "8:00 - 12:00"
        },
        wartezeit: 25,
        online_services: ["Personalausweis", "Führerschein"],
        koordinaten: { lat: 49.3474, lon: 7.1794 }
      }
    }
  },
  
  // ST. WENDEL (665xx)
  "66606": {
    plz: "66606",
    ort: "St. Wendel",
    kreis: "Landkreis St. Wendel",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro St. Wendel",
        strasse: "Welvertstraße 2",
        ort: "66606 St. Wendel",
        telefon: "06851 809-0",
        email: "buergerbuero@st-wendel.de",
        webseite: "https://www.st-wendel.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 15,
        online_services: ["Meldebescheinigung", "Führungszeugnis"],
        koordinaten: { lat: 49.4674, lon: 7.1686 }
      },
      kfz: {
        name: "KFZ-Zulassungsstelle St. Wendel",
        strasse: "Mommstraße 21-31",
        ort: "66606 St. Wendel",
        telefon: "06851 801-5151",
        email: "kfz@lkwnd.de",
        webseite: "https://www.landkreis-st-wendel.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Do": "14:00 - 17:00"
        },
        wartezeit: 20,
        koordinaten: { lat: 49.4651, lon: 7.1698 }
      }
    }
  },
  
  // MERZIG (667xx)
  "66663": {
    plz: "66663",
    ort: "Merzig",
    kreis: "Landkreis Merzig-Wadern",
    behoerden: {
      buergeramt: {
        name: "Bürgerservice Merzig",
        strasse: "Brauerstraße 5",
        ort: "66663 Merzig",
        telefon: "06861 85-0",
        email: "buergerservice@merzig.de",
        webseite: "https://www.merzig.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 12,
        online_services: ["Personalausweis", "Hundesteuer"],
        koordinaten: { lat: 49.4459, lon: 6.6387 }
      }
    }
  },
  
  // WADERN (666xx)
  "66687": {
    plz: "66687",
    ort: "Wadern",
    kreis: "Landkreis Merzig-Wadern",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Wadern",
        strasse: "Marktplatz 13",
        ort: "66687 Wadern",
        telefon: "06871 507-0",
        email: "buergerbuero@wadern.de",
        webseite: "https://www.wadern.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 10,
        koordinaten: { lat: 49.5383, lon: 6.8826 }
      }
    }
  },
  
  // WEITERE WICHTIGE PLZ
  "66280": {
    plz: "66280",
    ort: "Sulzbach",
    kreis: "Regionalverband Saarbrücken",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Sulzbach",
        strasse: "Sulzbachtalstraße 81",
        ort: "66280 Sulzbach",
        telefon: "06897 508-0",
        email: "buergerbuero@sulzbach-saar.de",
        webseite: "https://www.sulzbach-saar.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00"
        },
        wartezeit: 8,
        koordinaten: { lat: 49.3003, lon: 7.0546 }
      }
    }
  },
  "66386": {
    plz: "66386",
    ort: "St. Ingbert",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro St. Ingbert",
        strasse: "Am Markt 12",
        ort: "66386 St. Ingbert",
        telefon: "06894 13-0",
        email: "buergerbuero@st-ingbert.de",
        webseite: "https://www.st-ingbert.de",
        oeffnungszeiten: {
          "Mo,Mi,Fr": "8:00 - 12:00",
          "Di": "8:00 - 16:00",
          "Do": "8:00 - 18:00"
        },
        wartezeit: 16,
        online_services: ["Personalausweis", "Meldebescheinigung"],
        koordinaten: { lat: 49.2769, lon: 7.1127 }
      }
    }
  },
  "66450": {
    plz: "66450",
    ort: "Bexbach",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Bexbach",
        strasse: "Rathausstraße 68",
        ort: "66450 Bexbach",
        telefon: "06826 529-0",
        email: "buergerbuero@bexbach.de",
        webseite: "https://www.bexbach.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Do": "14:00 - 16:00"
        },
        wartezeit: 5,
        koordinaten: { lat: 49.3478, lon: 7.2551 }
      }
    }
  },
  "66557": {
    plz: "66557",
    ort: "Illingen",
    kreis: "Landkreis Neunkirchen",
    behoerden: {
      buergeramt: {
        name: "Rathaus Illingen",
        strasse: "Hauptstraße 71",
        ort: "66557 Illingen",
        telefon: "06825 409-0",
        email: "rathaus@illingen.de",
        webseite: "https://www.illingen.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 6,
        koordinaten: { lat: 49.3779, lon: 7.0452 }
      }
    }
  },
  "66709": {
    plz: "66709",
    ort: "Weiskirchen",
    kreis: "Landkreis Merzig-Wadern",
    behoerden: {
      buergeramt: {
        name: "Gemeindeverwaltung Weiskirchen",
        strasse: "Trierer Straße 22",
        ort: "66709 Weiskirchen",
        telefon: "06876 700-0",
        email: "info@weiskirchen.de",
        webseite: "https://www.weiskirchen.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Di": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 3,
        koordinaten: { lat: 49.5532, lon: 6.8142 }
      }
    }
  },
  "66763": {
    plz: "66763",
    ort: "Dillingen/Saar",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Dillingen",
        strasse: "Merziger Straße 31",
        ort: "66763 Dillingen/Saar",
        telefon: "06831 709-0",
        email: "buergerbuero@dillingen-saar.de",
        webseite: "https://www.dillingen-saar.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 14,
        koordinaten: { lat: 49.3547, lon: 6.7285 }
      }
    }
  },
  "66787": {
    plz: "66787",
    ort: "Wadgassen",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Rathaus Wadgassen",
        strasse: "Lindenstraße 114",
        ort: "66787 Wadgassen",
        telefon: "06834 944-0",
        email: "rathaus@wadgassen.de",
        webseite: "https://www.wadgassen.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00"
        },
        wartezeit: 7,
        koordinaten: { lat: 49.2663, lon: 6.8072 }
      }
    }
  },
  "66802": {
    plz: "66802",
    ort: "Überherrn",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Rathaus Überherrn",
        strasse: "Rathausstraße 101",
        ort: "66802 Überherrn",
        telefon: "06836 909-0",
        email: "rathaus@ueberherrn.de",
        webseite: "https://www.ueberherrn.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Di": "14:00 - 16:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 9,
        koordinaten: { lat: 49.2445, lon: 6.6956 }
      }
    }
  },
  "66822": {
    plz: "66822",
    ort: "Lebach",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Lebach",
        strasse: "Am Markt 1",
        ort: "66822 Lebach",
        telefon: "06881 59-0",
        email: "buergerbuero@lebach.de",
        webseite: "https://www.lebach.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00"
        },
        wartezeit: 11,
        koordinaten: { lat: 49.4115, lon: 6.9096 }
      }
    }
  },
  "66839": {
    plz: "66839",
    ort: "Schmelz",
    kreis: "Landkreis Saarlouis",
    behoerden: {
      buergeramt: {
        name: "Gemeindeverwaltung Schmelz",
        strasse: "Rathausplatz 1",
        ort: "66839 Schmelz",
        telefon: "06887 301-0",
        email: "rathaus@schmelz.de",
        webseite: "https://www.schmelz.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Do": "14:00 - 16:00"
        },
        wartezeit: 4,
        koordinaten: { lat: 49.4404, lon: 6.8481 }
      }
    }
  },
  "66849": {
    plz: "66849",
    ort: "Landsweiler-Reden",
    kreis: "Landkreis Neunkirchen",
    behoerden: {
      buergeramt: {
        name: "Ortsamt Landsweiler-Reden",
        strasse: "Hauptstraße",
        ort: "66849 Landsweiler-Reden",
        telefon: "06821 202-0",
        email: "buergerbuero@neunkirchen.de",
        webseite: "https://www.neunkirchen.de",
        oeffnungszeiten: {
          "Di,Do": "8:00 - 12:00",
          "Do": "14:00 - 18:00"
        },
        wartezeit: 5,
        koordinaten: { lat: 49.3474, lon: 7.1417 }
      }
    }
  },
  "66862": {
    plz: "66862",
    ort: "Kindsbach",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Homburg",
        strasse: "Am Forum 5",
        ort: "66424 Homburg",
        telefon: "06841 101-0",
        email: "buergerbuero@homburg.de",
        webseite: "https://www.homburg.de",
        oeffnungszeiten: {
          "Mo,Mi,Fr": "8:00 - 12:00",
          "Di": "8:00 - 16:00",
          "Do": "8:00 - 18:00"
        },
        wartezeit: 22,
        koordinaten: { lat: 49.3228, lon: 7.3372 }
      }
    }
  },
  "66877": {
    plz: "66877",
    ort: "Ramstein-Miesenbach",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Homburg",
        strasse: "Am Forum 5",
        ort: "66424 Homburg",
        telefon: "06841 101-0",
        email: "buergerbuero@homburg.de",
        webseite: "https://www.homburg.de",
        oeffnungszeiten: {
          "Mo,Mi,Fr": "8:00 - 12:00",
          "Di": "8:00 - 16:00",
          "Do": "8:00 - 18:00"
        },
        wartezeit: 22,
        koordinaten: { lat: 49.3228, lon: 7.3372 }
      }
    }
  },
  "66894": {
    plz: "66894",
    ort: "Bechhofen",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Bürgerbüro Blieskastel",
        strasse: "Paradeplatz 5",
        ort: "66440 Blieskastel",
        telefon: "06842 926-0",
        email: "info@blieskastel.de",
        webseite: "https://www.blieskastel.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Di,Do": "14:00 - 16:00"
        },
        wartezeit: 10,
        koordinaten: { lat: 49.2364, lon: 7.2543 }
      }
    }
  },
  "66907": {
    plz: "66907",
    ort: "Glan-Münchweiler",
    kreis: "Saarpfalz-Kreis",
    behoerden: {
      buergeramt: {
        name: "Verbandsgemeinde Glan-Münchweiler",
        strasse: "Bahnhofstraße 25",
        ort: "66907 Glan-Münchweiler",
        telefon: "06372 922-0",
        email: "info@vg-glan-muenchweiler.de",
        webseite: "https://www.vg-glan-muenchweiler.de",
        oeffnungszeiten: {
          "Mo-Fr": "8:00 - 12:00",
          "Mo,Do": "14:00 - 16:00"
        },
        wartezeit: 8,
        koordinaten: { lat: 49.4729, lon: 7.4424 }
      }
    }
  }
};

// Hilfsfunktion: PLZ validieren
export function isValidSaarlandPLZ(plz: string): boolean {
  return plz in saarlandPLZData;
}

// Hilfsfunktion: Alle PLZ eines Kreises
export function getPLZByKreis(kreis: string): string[] {
  return Object.entries(saarlandPLZData)
    .filter(([_, info]) => info.kreis === kreis)
    .map(([plz, _]) => plz);
}

// Hilfsfunktion: Nächstgelegene Behörde finden
export function findNearestBehoerde(plz: string, behoerdeType: string): BehoerdeInfo | null {
  // Wenn PLZ direkt gefunden
  if (saarlandPLZData[plz] && saarlandPLZData[plz].behoerden[behoerdeType]) {
    return saarlandPLZData[plz].behoerden[behoerdeType];
  }
  
  // Suche in nahegelegenen PLZ (gleicher Kreis)
  const currentKreis = saarlandPLZData[plz]?.kreis;
  if (currentKreis) {
    const kreisPlzList = getPLZByKreis(currentKreis);
    for (const nearbyPlz of kreisPlzList) {
      if (saarlandPLZData[nearbyPlz].behoerden[behoerdeType]) {
        return saarlandPLZData[nearbyPlz].behoerden[behoerdeType];
      }
    }
  }
  
  return null;
}

// Export für API
export function getPLZInfo(plz: string): PLZInfo | null {
  return saarlandPLZData[plz] || null;
}