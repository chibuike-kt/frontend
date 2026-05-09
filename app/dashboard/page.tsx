"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    // In a real app, middleware handles this redirect
    // This is a fallback
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Not authenticated.{" "}
          <a href="/login" className="text-violet-600">
            Log in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">💸</span>
          </div>
          <span className="font-bold text-gray-900">OwambePay</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {user.name} ·{" "}
            <span className="capitalize text-violet-600 font-medium">
              {user.role}
            </span>
          </span>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Welcome, {user.name} 🎉
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            You&apos;re signed in as a{" "}
            <span className="capitalize font-medium text-violet-600">
              {user.role}
            </span>
            . Phase 2 will add wallets and the event system here.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Account ID
              </p>
              <p className="font-mono text-sm text-gray-700 truncate">
                {user.id}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Email
              </p>
              <p className="text-sm text-gray-700">{user.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
