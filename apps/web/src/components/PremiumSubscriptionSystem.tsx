"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "SAAR-Basic",
    price: 0,
    interval: "month",
    stripePriceId: "",
    features: [
      "50 KI-Anfragen pro Monat",
      "Grundlegende Saarland-Informationen",
      "Standard-Support",
      "Mobile App Zugang",
    ],
  },
  {
    id: "premium",
    name: "SAAR-Premium",
    price: 10,
    interval: "month",
    stripePriceId: "price_1OExample123",
    popular: true,
    features: [
      "Unlimited KI-Anfragen",
      "Premium Saarland Services",
      "Prioritäts-Support",
      "Advanced Document Generation",
      "Business Analytics Dashboard",
      "Cross-Border DE/FR/LU Services",
      "Voice Interface",
      "Custom API Access",
    ],
  },
  {
    id: "enterprise",
    name: "SAAR-Enterprise",
    price: 50,
    interval: "month",
    stripePriceId: "price_1OExample456",
    features: [
      "Alle Premium Features",
      "White-Label Lösung",
      "Dedicated Support Manager",
      "Custom AI Model Training",
      "Enterprise API (1M Calls/Monat)",
      "Advanced Analytics & Reporting",
      "SSO Integration",
      "Custom Integrations",
      "SLA Garantie (99.9%)",
      "Vor-Ort Schulungen",
    ],
  },
];

export default function PremiumSubscriptionSystem() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Load user subscription
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      // Redirect to authentication
      window.location.href = "/auth?redirect=/premium";
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      const plan = subscriptionPlans.find((p) => p.id === planId);
      if (!plan || plan.price === 0) {
        // Handle free plan
        await updateUserSubscription(planId, "active");
        setIsProcessing(false);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: currentUser.id,
          planId: planId,
          successUrl: `${window.location.origin}/premium/success`,
          cancelUrl: `${window.location.origin}/premium`,
        }),
      });

      const { checkoutUrl } = await response.json();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Fehler beim Abonnement-Prozess. Bitte versuchen Sie es erneut.");
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription) return;

    const confirmed = window.confirm(
      "Möchten Sie Ihr Abonnement wirklich kündigen? Sie behalten Zugang bis zum Ende der aktuellen Periode.",
    );

    if (!confirmed) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/subscription", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: userSubscription.id,
        }),
      });

      if (response.ok) {
        await loadUserData(); // Reload subscription data
        alert("Abonnement erfolgreich gekündigt.");
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Fehler beim Kündigen. Bitte kontaktieren Sie den Support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateUserSubscription = async (planId: string, status: string) => {
    try {
      const { error } = await supabase.from("user_subscriptions").upsert({
        user_id: currentUser?.id,
        plan_id: planId,
        status: status,
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      if (error) throw error;
      await loadUserData();
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCurrentPlan = () => {
    if (!userSubscription) return subscriptionPlans[0]; // Default to basic
    return (
      subscriptionPlans.find((p) => p.id === userSubscription.planId) ||
      subscriptionPlans[0]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Abonnement-Optionen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SAAR-GPT Premium Services
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Erweitern Sie Ihre KI-Erfahrung mit Premium-Features für das
            Saarland
          </p>

          {userSubscription && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Aktueller Plan: {getCurrentPlan()?.name}
              {userSubscription.status === "active"
                ? " (Aktiv)"
                : ` (${userSubscription.status})`}
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular
                  ? "border-blue-500 ring-4 ring-blue-200"
                  : "border-gray-200"
              } ${userSubscription?.planId === plan.id ? "ring-4 ring-green-200 border-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Beliebteste Wahl
                  </span>
                </div>
              )}

              {userSubscription?.planId === plan.id && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Aktueller Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatPrice(plan.price)}
                  <span className="text-lg font-normal text-gray-500">
                    /{plan.interval}
                  </span>
                </div>
                {plan.price === 0 && (
                  <p className="text-sm text-gray-500">Für immer kostenlos</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {userSubscription?.planId === plan.id ? (
                  userSubscription.status === "active" ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full bg-green-100 text-green-800 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                      >
                        Aktueller Plan
                      </button>
                      {plan.price > 0 && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isProcessing}
                          className="w-full bg-red-100 text-red-700 py-2 px-6 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          Kündigen
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isProcessing || selectedPlan === plan.id}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing && selectedPlan === plan.id
                        ? "Wird verarbeitet..."
                        : "Reaktivieren"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing || selectedPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isProcessing && selectedPlan === plan.id
                      ? "Wird verarbeitet..."
                      : plan.price === 0
                        ? "Kostenlos starten"
                        : "Jetzt upgraden"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Detaillierter Feature-Vergleich
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-900">
                    Features
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    Basic
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">KI-Anfragen pro Monat</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Saarland-Datenbank Zugang</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Voice Interface</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Analytics Dashboard</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">API Zugang</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">10K Calls/Monat</td>
                  <td className="text-center py-3 px-4">1M Calls/Monat</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Support Level</td>
                  <td className="text-center py-3 px-4">Community</td>
                  <td className="text-center py-3 px-4">Priority</td>
                  <td className="text-center py-3 px-4">Dedicated Manager</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">SLA Garantie</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">99%</td>
                  <td className="text-center py-3 px-4">99.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Häufig gestellte Fragen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Kann ich jederzeit kündigen?
              </h3>
              <p className="text-gray-600 text-sm">
                Ja, Sie können Ihr Abonnement jederzeit kündigen. Sie behalten
                Zugang bis zum Ende der bezahlten Periode.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Welche Zahlungsmethoden werden akzeptiert?
              </h3>
              <p className="text-gray-600 text-sm">
                Wir akzeptieren alle gängigen Kreditkarten, SEPA-Lastschrift und
                PayPal über Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Gibt es eine Geld-zurück-Garantie?
              </h3>
              <p className="text-gray-600 text-sm">
                Ja, wir bieten eine 30-Tage-Geld-zurück-Garantie für alle
                Premium-Abonnements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Kann ich zwischen Plänen wechseln?
              </h3>
              <p className="text-gray-600 text-sm">
                Ja, Sie können jederzeit upgraden oder downgraden. Änderungen
                werden anteilig berechnet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
