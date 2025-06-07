"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  pubDate: string;
  category: string;
  premium?: boolean;
}

interface FootballScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  minute?: number;
}

interface UserProfile {
  id: string;
  name: string;
  points: number;
  level: number;
  badges: string[];
  premium: boolean;
}

export default function SaarCommunityDashboard() {
  const [activeTab, setActiveTab] = useState("news");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [footballScores, setFootballScores] = useState<FootballScore[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load news
      const newsResponse = await fetch(
        `/api/saarnews?premium=${isPremium}&limit=5`,
      );
      const newsData = await newsResponse.json();
      if (newsData.success) {
        setNews(newsData.news);
      }

      // Load football scores
      const footballResponse = await fetch("/api/saar-football?type=scores");
      const footballData = await footballResponse.json();
      if (footballData.success) {
        setFootballScores(footballData.scores);
      }

      // Load user profile
      const communityResponse = await fetch(
        "/api/community?type=profile&user_id=demo_user",
      );
      const communityData = await communityResponse.json();
      if (communityData.success) {
        setUserProfile(communityData.user);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumUpgrade = async () => {
    try {
      const response = await fetch("/api/premium/saarland", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "premium",
          user_id: "demo_user",
          payment_method: "demo",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsPremium(true);
        alert(data.message);
        loadData(); // Reload with premium content
      }
    } catch (error) {
      console.error("Premium upgrade failed:", error);
    }
  };

  const handleNewsAction = async (action: string, newsId: string) => {
    try {
      const response = await fetch("/api/saarnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: action,
          user_id: "demo_user",
          data: { news_id: newsId },
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        // Update user points
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            points: userProfile.points + (data.points_earned || 3),
          });
        }
      }
    } catch (error) {
      console.error("News action failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Saarland Community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          🏠 Saarland Community Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Dein Heimat-Hub für News, Fußball und Community
        </p>
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">
                  👋 Hallo {userProfile.name}!
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Level {userProfile.level} • {userProfile.points} Punkte
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm mb-2">
                  {userProfile.badges.length} Badges
                </div>
                {!isPremium && (
                  <Button
                    onClick={handlePremiumUpgrade}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    💎 Premium (9,99€)
                  </Button>
                )}
                {isPremium && (
                  <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    💎 PREMIUM AKTIV
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: "news", label: "📰 Saarnews", icon: "📰" },
          { id: "football", label: "⚽ Saar-Fußball", icon: "⚽" },
          { id: "community", label: "🤝 Community", icon: "🤝" },
        ].map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "default" : "outline"}
            className={`text-lg px-6 py-3 ${
              activeTab === tab.id ? "bg-blue-600 text-white" : ""
            }`}
          >
            {tab.icon} {tab.label}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === "news" && (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              📰 Aktuelle Saarnews
            </h2>
            {!isPremium && (
              <div className="text-sm text-gray-600">
                💎 Premium für personalisierte News & Insider-Infos
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {news.map((item) => (
              <Card
                key={item.id}
                className={item.premium ? "border-yellow-400 bg-yellow-50" : ""}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.premium && "💎"}
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {item.source} •{" "}
                        {new Date(item.pubDate).toLocaleDateString("de-DE")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNewsAction("share", item.id)}
                      >
                        📤 Teilen (+3)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNewsAction("bookmark", item.id)}
                      >
                        📌 Merken
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {item.category}
                    </span>
                    <Button size="sm" variant="link">
                      Weiterlesen →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "football" && (
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚽ Saar-Fußball Live
          </h2>

          <div className="grid gap-4">
            {footballScores.map((score, index) => (
              <Card key={index} className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">{score.homeTeam}</span>
                      <div className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold">
                        {score.homeScore} : {score.awayScore}
                      </div>
                      <span className="font-bold">{score.awayTeam}</span>
                    </div>
                    {score.status === "live" && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-bold">
                          {score.minute}&apos;
                        </span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {score.status === "live" ? "🔴 LIVE" : "⏰ Anpfiff bald"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {!isPremium && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  💎 Premium Fußball-Features
                </h3>
                <ul className="text-yellow-700 space-y-1 mb-4">
                  <li>• Live-Ticker alle Saarland-Spiele</li>
                  <li>• Exklusive Spieler-Interviews</li>
                  <li>• Ticket-Vorverkauf Benachrichtigungen</li>
                  <li>• VIP Fan-Events</li>
                </ul>
                <Button
                  onClick={handlePremiumUpgrade}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Jetzt Premium holen!
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "community" && userProfile && (
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🤝 Saarland Community
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Deine Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Community-Punkte</span>
                    <span className="font-bold">{userProfile.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span className="font-bold">Level {userProfile.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Badges</span>
                    <span className="font-bold">
                      {userProfile.badges.length} 🏅
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleNewsAction("share", "demo")}
                >
                  📰 News kommentieren (+5 Punkte)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleNewsAction("share", "demo")}
                >
                  ⚽ Fußball diskutieren (+5 Punkte)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleNewsAction("share", "demo")}
                >
                  📤 Content teilen (+3 Punkte)
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardHeader>
              <CardTitle>🏆 Monatliche Belohnungen</CardTitle>
              <CardDescription className="text-purple-100">
                Sammle Punkte und gewinne tolle Preise!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl mb-2">🥇</div>
                  <div className="font-bold">1. Platz</div>
                  <div className="text-sm">2 FCS/SVE Tickets</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl mb-2">🥈</div>
                  <div className="font-bold">2. Platz</div>
                  <div className="text-sm">1 Monat Premium</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl mb-2">🥉</div>
                  <div className="font-bold">3. Platz</div>
                  <div className="text-sm">Saarland Merchandise</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Footer */}
      <Card className="mt-8 bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🚀 Agentland.saarland - Dein Saarland, digital vernetzt
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>📰 Lokale News in Echtzeit</div>
              <div>⚽ Saar-Fußball hautnah</div>
              <div>🤝 Starke Community</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
