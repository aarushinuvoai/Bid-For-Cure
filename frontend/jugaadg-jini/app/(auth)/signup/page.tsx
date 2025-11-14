"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogImage from "../../../public/loginsignup.png"
import toast from "react-hot-toast";


export default function SignUpPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // API call to signup endpoint
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/patient/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, emailid: email, passwd: password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.status === "success") {
            toast.success("Signup successful!");
            localStorage.setItem("userEmail", email);
          router.push("/patient/dashboard");
        } else {
          // Optionally show error toast or message
          
          console.error("Signup failed", data);
        }
      })
      .catch((err) => {
        console.error("API error", err);
      });
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
            Welcome to our platform! Create your account to access personalized healthcare solutions, connect with experts, and manage your health journey with ease.
            </p>
          </div>
        </div>
      </div>


      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-8 md:px-12 py-16">
          <h2 className="text-2xl font-semibold mb-6">Register your account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="mb-2 block text-sm">
                Name
              </Label>
              <Input id="name" name="name" type="text" required placeholder="please enter your name" />
            </div>
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

            <div className="pt-6 text-sm text-center">
              <span>Already have an account? </span>
              <Link href="/login" className="underline">
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
