"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import {FlickeringGrid}from "@/components/ui/flickering-grid"; // adjust path

export default function SuperadminLogin() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    // call superadmin login API
    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";
        const res = await fetch(`${API_BASE}/superadmin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, passwd: password }),
        });
        const data = await res.json().catch(() => ({}));
        console.log("superadmin login response", data);
        if (data && data.status === "success") {
          router.push("/admin/dashboard");
        } else {
          console.error("Superadmin login failed", data);
        }
      } catch (err) {
        console.error("Superadmin API error", err);
      }
    })();
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT HALF: relative + overflow-hidden ensures the grid is clipped to left half */}
      <div className="w-1/2 relative hidden md:flex overflow-hidden">
        {/* FlickeringGrid absolutely fills this left half only */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <FlickeringGrid
            className="absolute inset-0 w-full h-full"
            squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={800}
        width={800}
          />
        </div>

        {/* Foreground content on top of grid */}
        <div className="relative z-10 flex flex-col justify-center px-16 bg-white/70">
          <div className="flex flex-col items-start">
            <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-6 bg-white">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              SuperAdmin Panel
            </h1>

            <p className="text-gray-600 max-w-md text-sm leading-relaxed">
              High-level access for system administrators.
              Monitor analytics, manage users, and configure restricted settings.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full px-10">
          <h2 className="text-2xl font-semibold mb-6">SuperAdmin Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
              />
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>

            <p className="text-xs text-gray-500 text-center pt-2">
              Access restricted. Actions are audited.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
