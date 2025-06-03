'use client'

import React from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Loader2, MapPin, Calendar, Euro, Building2, GraduationCap } from 'lucide-react';

interface EnhancedChatResponseProps {
  category: string;
  query: string;
}

export default function EnhancedChatResponse({ category, query }: EnhancedChatResponseProps) {
  const { data, loading, error } = useRealTimeData(category, 30000); // Refresh every 30 seconds

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Lade echte Daten...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  // Generate response based on real data
  const generateRealDataResponse = () => {
    const keywords = query.toLowerCase();
    
    switch(category) {
      case 'tourism':
        if (!data) return 'Keine Tourismusdaten verfügbar.';
        
        let tourismResponse = `🏞️ **Aktuelle Tourismus-Informationen** (Live-Daten)\n\n`;
        
        // Weather info
        if (data.weather && data.weather.temperature) {
          tourismResponse += `**Wetter in Saarbrücken:**\n`;
          tourismResponse += `🌡️ ${Math.round(data.weather.temperature)}°C - ${data.weather.description}\n`;
          tourismResponse += `💨 Wind: ${data.weather.wind_speed} km/h\n`;
          tourismResponse += `💧 Luftfeuchtigkeit: ${data.weather.humidity}%\n\n`;
        }
        
        // Attractions
        if (data.attractions && data.attractions.length > 0) {
          tourismResponse += `**Sehenswürdigkeiten:**\n`;
          data.attractions.forEach(attr => {
            tourismResponse += `• **${attr.name}** - ${attr.status === 'open' ? '✅ Geöffnet' : '❌ Geschlossen'}\n`;
            tourismResponse += `  ${attr.opening_hours} | ${attr.price}\n`;
            if (attr.current_visitors) {
              tourismResponse += `  Besucheraufkommen: ${attr.current_visitors === 'low' ? '🟢 Niedrig' : attr.current_visitors === 'moderate' ? '🟡 Mittel' : '🔴 Hoch'}\n`;
            }
          });
          tourismResponse += '\n';
        }
        
        // Events
        if (data.events && data.events.length > 0) {
          tourismResponse += `**Aktuelle Veranstaltungen:**\n`;
          data.events.forEach(event => {
            tourismResponse += `• **${event.title}**\n`;
            tourismResponse += `  📅 ${event.date} | 📍 ${event.location}\n`;
            tourismResponse += `  💶 ${event.price_range || event.price}\n`;
          });
        }
        
        return tourismResponse;
        
      case 'business':
        if (!data) return 'Keine Wirtschaftsdaten verfügbar.';
        
        let businessResponse = `💼 **Aktuelle Wirtschaftsdaten** (Live-Daten)\n\n`;
        
        // Funding programs
        if (data.funding_programs && data.funding_programs.length > 0) {
          businessResponse += `**Aktive Förderprogramme:**\n`;
          data.funding_programs.forEach(program => {
            businessResponse += `• **${program.name}**\n`;
            businessResponse += `  💰 Bis zu ${program.max_funding.toLocaleString('de-DE')}€\n`;
            businessResponse += `  🎯 Fokus: ${program.focus.join(', ')}\n`;
            businessResponse += `  ⏰ Deadline: ${program.deadline}\n`;
            businessResponse += `  📊 Erfolgsquote: ${(program.success_rate * 100).toFixed(0)}%\n\n`;
          });
        }
        
        // Economic indicators
        if (data.economic_indicators) {
          businessResponse += `**Wirtschaftsindikatoren:**\n`;
          businessResponse += `• Arbeitslosenquote: ${data.economic_indicators.unemployment_rate}%\n`;
          businessResponse += `• Startup-Wachstum: ${(data.economic_indicators.startup_growth * 100).toFixed(0)}%\n`;
          businessResponse += `• KI-Unternehmen: ${data.economic_indicators.ki_companies}\n`;
          businessResponse += `• Verfügbare Förderung: ${(data.economic_indicators.funding_available / 1000000).toFixed(0)} Mio. €\n`;
        }
        
        return businessResponse;
        
      case 'admin':
        if (!data) return 'Keine Verwaltungsdaten verfügbar.';
        
        let adminResponse = `🏛️ **Aktuelle Verwaltungsinformationen** (Live-Daten)\n\n`;
        
        // Office wait times
        if (data.offices && data.offices.length > 0) {
          adminResponse += `**Wartezeiten in Ämtern:**\n`;
          data.offices.forEach(office => {
            adminResponse += `• **${office.name}**\n`;
            adminResponse += `  ⏱️ Wartezeit: ${office.current_wait_time} Minuten\n`;
            adminResponse += `  🚪 Status: ${office.status === 'open' ? '✅ Geöffnet' : '❌ Geschlossen'}\n`;
            adminResponse += `  💻 Online-Services: ${office.online_services}/${office.services_available}\n\n`;
          });
        }
        
        // Digital services
        adminResponse += `**Digitale Services:**\n`;
        adminResponse += `• Verfügbarkeit: ${(data.online_service_availability * 100).toFixed(1)}%\n`;
        adminResponse += `• Digitale Dienste: ${data.digital_services_count}\n`;
        
        return adminResponse;
        
      default:
        return 'Echte Daten für diese Kategorie werden geladen...';
    }
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap">
          {generateRealDataResponse()}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Live-Daten • Zuletzt aktualisiert: {new Date(data?.timestamp || Date.now()).toLocaleTimeString('de-DE')}
      </div>
    </div>
  );
}
