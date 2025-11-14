"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogImage from "../../../../public/hospital.png"
import toast from "react-hot-toast";


export default function HospitalLoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // API call to login endpoint
   console.log("Hospital login attempt", {email, password});
   router.push("/hospital/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 relative hidden md:block">
        <Image
          src={LogImage}
          alt="Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-full flex items-end pb-20 pl-12">
          <div className="max-w-md text-white">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Welcome to Bid for Cure<span className="ml-2">🩺</span></h1>
            <p className="text-sm opacity-90">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi nam dolorum aliquam, quibusdam aperiam voluptatum.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-8 md:px-12 py-16">
          <h2 className="text-2xl font-semibold mb-6">Sign in to your Hospital</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm">
                Email
              </Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block text-sm">
                Password
              </Label>
              <Input id="password" name="password" type="password" required placeholder="********" />
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
            {/* <div className="pt-6 text-sm text-center">
              <span>Don’t have an account? </span>
              <Link href="/signup" className="underline">
                Create an account
              </Link>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
