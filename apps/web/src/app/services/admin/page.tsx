"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  Building,
  CreditCard,
  Car,
  Home,
  Users,
  Briefcase,
  Heart,
  Baby,
  AlertCircle,
  Download,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const services = [
  {
    id: 1,
    category: "Persönliche Dokumente",
    icon: FileText,
    color: "bg-blue-500",
    items: [
      {
        name: "Personalausweis",
        description: "Beantragung und Verlängerung",
        onlineAvailable: true,
        processingTime: "2-3 Wochen",
        cost: "37€",
      },
      {
        name: "Reisepass",
        description: "Neu- und Folgeantrag",
        onlineAvailable: true,
        processingTime: "3-4 Wochen",
        cost: "60€",
      },
      {
        name: "Führerschein",
        description: "Erstausstellung, Umschreibung",
        onlineAvailable: true,
        processingTime: "1-2 Wochen",
        cost: "43,40€",
      },
      {
        name: "Führungszeugnis",
        description: "Einfaches oder erweitertes Führungszeugnis",
        onlineAvailable: true,
        processingTime: "1-2 Wochen",
        cost: "13€",
      },
    ],
  },
  {
    id: 2,
    category: "Fahrzeug & Verkehr",
    icon: Car,
    color: "bg-green-500",
    items: [
      {
        name: "KFZ-Zulassung",
        description: "Neu-, Um- und Abmeldung",
        onlineAvailable: true,
        processingTime: "Sofort",
        cost: "Ab 26€",
      },
      {
        name: "Wunschkennzeichen",
        description: "Reservierung und Bestellung",
        onlineAvailable: true,
        processingTime: "Sofort",
        cost: "10,20€",
      },
      {
        name: "Parkausweis",
        description: "Anwohner- und Behindertenparkausweis",
        onlineAvailable: true,
        processingTime: "1 Woche",
        cost: "Variabel",
      },
    ],
  },
  {
    id: 3,
    category: "Familie & Soziales",
    icon: Heart,
    color: "bg-red-500",
    items: [
      {
        name: "Kindergeld",
        description: "Antrag und Änderungen",
        onlineAvailable: true,
        processingTime: "4-6 Wochen",
        cost: "Kostenlos",
      },
      {
        name: "Elterngeld",
        description: "Berechnung und Antrag",
        onlineAvailable: true,
        processingTime: "2-3 Monate",
        cost: "Kostenlos",
      },
      {
        name: "Eheschließung",
        description: "Anmeldung zur Eheschließung",
        onlineAvailable: false,
        processingTime: "2-4 Wochen",
        cost: "Ab 100€",
      },
      {
        name: "Geburtsurkunde",
        description: "Ausstellung von Urkunden",
        onlineAvailable: true,
        processingTime: "1 Woche",
        cost: "12€",
      },
    ],
  },
  {
    id: 4,
    category: "Gewerbe & Arbeit",
    icon: Briefcase,
    color: "bg-purple-500",
    items: [
      {
        name: "Gewerbeanmeldung",
        description: "An-, Um- und Abmeldung",
        onlineAvailable: true,
        processingTime: "Sofort",
        cost: "26-60€",
      },
      {
        name: "Arbeitserlaubnis",
        description: "Für ausländische Arbeitnehmer",
        onlineAvailable: false,
        processingTime: "4-8 Wochen",
        cost: "Variabel",
      },
      {
        name: "Handwerkskarte",
        description: "Eintragung in die Handwerksrolle",
        onlineAvailable: true,
        processingTime: "2-3 Wochen",
        cost: "Ab 150€",
      },
    ],
  },
];

const onlineServices = [
  { name: "Online-Ausweisfunktion", status: "Verfügbar", users: "75.000+" },
  { name: "Digitales Bürgeramt", status: "Verfügbar", users: "120.000+" },
  { name: "E-Rechnung", status: "Beta", users: "15.000+" },
  { name: "Digitale Signatur", status: "Verfügbar", users: "45.000+" },
];

export default function AdminPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredServices = services.map((category) => ({
    ...category,
    items: showOnlineOnly
      ? category.items.filter((item) => item.onlineAvailable)
      : category.items,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Digitale Verwaltung Saarland
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Erledigen Sie Ihre Behördengänge einfach und bequem online - 24/7
            verfügbar, ohne Wartezeiten
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {onlineServices.map((service) => (
              <Card
                key={service.name}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {service.users}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    service.status === "Verfügbar"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {service.status}
                </span>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-y">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Verfügbare Services
          </h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Nur Online-Services</span>
            </label>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            {filteredServices.map((category) => (
              <div key={category.id}>
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {category.category}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="p-6 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {service.name}
                          </h4>
                          {service.onlineAvailable && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Online
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">
                          {service.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            Bearbeitungszeit: {service.processingTime}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Kosten: {service.cost}
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4"
                          variant={
                            service.onlineAvailable ? "default" : "outline"
                          }
                        >
                          {service.onlineAvailable
                            ? "Online beantragen"
                            : "Termin buchen"}
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            So einfach geht&apos;s online
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Service wählen</h3>
              <p className="text-sm text-gray-600">
                Finden Sie den passenden Service
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Identifizieren</h3>
              <p className="text-sm text-gray-600">Mit eID oder Video-Ident</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Antrag senden</h3>
              <p className="text-sm text-gray-600">
                Digital unterschreiben & absenden
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">4. Fertig!</h3>
              <p className="text-sm text-gray-600">Status online verfolgen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wichtige Hinweise
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • Für Online-Services benötigen Sie einen Personalausweis
                    mit aktivierter Online-Funktion
                  </li>
                  <li>
                    • Dokumente werden per Post zugestellt oder können digital
                    abgerufen werden
                  </li>
                  <li>
                    • Bei Fragen steht Ihnen unsere Service-Hotline zur
                    Verfügung: 0681 / 501-0000
                  </li>
                  <li>
                    • Öffnungszeiten der Bürgerbüros: Mo-Fr 8:00-18:00, Sa
                    9:00-13:00
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Brauchen Sie Hilfe?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Unser KI-Assistent führt Sie durch alle Verwaltungsprozesse und
            beantwortet Ihre Fragen rund um die Uhr
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100"
              onClick={() => router.push("/chat")}
            >
              <Users className="w-5 h-5 mr-2" />
              KI-Assistent starten
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Termin vereinbaren
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
