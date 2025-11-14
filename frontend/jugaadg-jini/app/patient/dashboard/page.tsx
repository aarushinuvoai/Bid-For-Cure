"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// shadcn/ui components (adjust import paths in your project)
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Calendar, MapPin, CreditCard, Building2, X, Send } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

// Type for patient returned by /patient/by-email/{email}
type Patient = {
  id: number;
  name: string;
  emailid: string;
  role?: string;
};

type Hospital = {
  id: number;
  name: string;
  address?: string | null;
  quote?: string | null;
};

type BidForm = {
  medical_conditions: string;
  surgery_needed: string;
  area: string;
  surgery_date: string;
  has_insurance: "yes" | "no";
  insurance_balance?: number;
  min_budget: number;
  max_budget: number;
};

type Bid = {
  id: number;
  patient_id: number;
  medical_conditions: string;
  surgery_needed: string;
  surgery_area: string;
  surgery_date: string;
  hospital_id: number;
  insurance?: string | null;
  insurance_balance?: string | null;
  budget?: string | null;
  status?: string;
};

export default function PatientDashboard({ emailProp }: { emailProp?: string }) {
  const [email] = useState<string | undefined>(
    emailProp ?? (typeof window !== "undefined" ? localStorage.getItem("userEmail") ?? undefined : undefined)
  );
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: "user" | "bot"; timestamp: Date }>>([
    { id: 1, text: "Hello! I'm here to help you with your medical queries. How can I assist you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("userEmail");
    if (!stored && !email) {
      router.push("/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (!email) return;
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/patient/by-email/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Failed to fetch patient");
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load patient profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [email]);

  const { register, handleSubmit, watch, reset, formState } = useForm<BidForm>({
    defaultValues: {
      medical_conditions: "",
      surgery_needed: "",
      area: "",
      surgery_date: "",
      has_insurance: "no",
      insurance_balance: undefined,
      min_budget: 0,
      max_budget: 0,
    },
  });

  async function onSubmit(data: BidForm) {
    if (!patient) {
      toast.error("Patient information not loaded yet.");
      return;
    }

    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";

      const hospitalsRes = await fetch(`${API_BASE}/hospitals/`);
      if (!hospitalsRes.ok) {
        throw new Error("Failed to fetch hospitals; cannot create bid without hospital_id");
      }
      const hospitals = await hospitalsRes.json();
      if (!Array.isArray(hospitals) || hospitals.length === 0) {
        throw new Error("No hospitals available to attach to this bid");
      }
      if (!selectedHospitalId) {
        toast.error("Please choose a hospital.");
        setLoading(false);
        return;
      }
      const hospital_id = selectedHospitalId;

      const budget =
        data.min_budget && data.max_budget
          ? `${data.min_budget}-${data.max_budget}`
          : data.max_budget > 0
          ? String(data.max_budget)
          : data.min_budget > 0
          ? String(data.min_budget)
          : undefined;

      const payload: any = {
        patient_id: patient.id,
        medical_conditions: data.medical_conditions,
        surgery_needed: data.surgery_needed,
        surgery_area: data.area,
        surgery_date: data.surgery_date,
        hospital_id,
        insurance: data.has_insurance ?? undefined,
      };

      if (data.insurance_balance !== undefined && data.insurance_balance !== null && !Number.isNaN(data.insurance_balance)) {
        payload.insurance_balance = String(data.insurance_balance);
      }

      if (budget !== undefined) {
        payload.budget = String(budget);
      }

      const res = await fetch(`${API_BASE}/patient/create-bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Create bid failed:", errText);
        throw new Error("Failed to create bid");
      }

      setDialogOpen(false);
      reset();
      toast.success("Bid created successfully");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not create bid");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const effectiveEmail = email ?? (typeof window !== "undefined" ? localStorage.getItem("userEmail") ?? undefined : undefined);
    if (!effectiveEmail) return;

    const fetchBids = async () => {
      try {
        setLoadingBids(true);
        const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/bids/by-email/${encodeURIComponent(effectiveEmail)}`);
        if (!res.ok) {
          console.error("Failed to fetch bids:", res.status, await res.text());
          setBids([]);
          return;
        }
        const data: Bid[] = await res.json();
        setBids(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching bids:", err);
        toast.error("Could not load bids.");
        setBids([]);
      } finally {
        setLoadingBids(false);
      }
    };

    fetchBids();
  }, [email]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoadingHospitals(true);
        const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/hospitals/`);
        if (!res.ok) {
          console.error("Failed to fetch hospitals:", res.status, await res.text());
          setHospitals([]);
          return;
        }
        const data: Hospital[] = await res.json();
        setHospitals(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && selectedHospitalId === null) {
          setSelectedHospitalId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching hospitals:", err);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessageText = inputMessage.trim().toLowerCase();
    const newUserMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    // Mock bot response after a short delay
    setTimeout(() => {
      let botResponse = "";

      // Check for specific predefined inputs
      if (userMessageText.includes("looking for hospitals in my area") || 
          userMessageText.includes("looking for hospitals") ||
          userMessageText.includes("find hospitals")) {
        botResponse = "okay what is your budget?";
      } else if (userMessageText.includes("my budget is around") || 
                 userMessageText.includes("budget is around") ||
                 (userMessageText.includes("budget") && (userMessageText.includes("100000") || userMessageText.includes("500000") || userMessageText.includes("1000000")))) {
        botResponse = "okay here are the Hospitals\n\n1. Apollo Hospital\n\n2. Divine Hospital";
      } else {
        // Default random responses
        const botResponses = [
          "Thank you for your message. I'm here to help you with your medical queries.",
          "I understand your concern. Let me help you find the best solution.",
          "That's a great question! Based on your profile, I can suggest some options.",
          "I'm processing your request. Please give me a moment to provide you with the best assistance.",
        ];
        botResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot" as const,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navbar */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="logo" className="rounded-lg" width={40} height={40} />
            <div>
              <div className="text-lg font-semibold text-gray-900">Bid for Cure</div>
              <div className="text-xs text-gray-500">Patient Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {loading ? "Loading..." : patient?.name ?? ""}
              </div>
              <div className="text-xs text-gray-500">{patient?.role ?? "Patient"}</div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">Create Bid</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create a new surgical bid</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to match with hospitals and surgeons.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Medical Conditions</Label>
                      <Textarea 
                        {...register("medical_conditions", { required: true })} 
                        rows={3}
                        className="mt-1.5"
                        placeholder="Describe your medical conditions"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Surgery Needed</Label>
                      <Input 
                        {...register("surgery_needed", { required: true })}
                        className="mt-1.5"
                        placeholder="Type of surgery required"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Area</Label>
                        <Input 
                          {...register("area", { required: true })}
                          className="mt-1.5"
                          placeholder="Location/Region"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Surgery Date</Label>
                        <Input 
                          type="date" 
                          {...register("surgery_date", { required: true })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Insurance</Label>
                        <Select {...register("has_insurance") as any}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Do you have insurance?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Insurance Balance</Label>
                        <Input
                          {...register("insurance_balance", {
                            valueAsNumber: true,
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                          })}
                          className="mt-1.5"
                          placeholder="₹ 0"
                          type="number"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Select Hospital</Label>
                      <Select
                        value={selectedHospitalId !== null ? String(selectedHospitalId) : undefined}
                        onValueChange={(val) => setSelectedHospitalId(Number(val))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder={loadingHospitals ? "Loading..." : "Choose a hospital"} />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.length === 0 ? (
                            <SelectItem value="0" disabled>
                              No hospitals available
                            </SelectItem>
                          ) : (
                            hospitals.map((h) => (
                              <SelectItem key={h.id} value={String(h.id)}>
                                {h.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Minimum Budget (INR)</Label>
                        <Input 
                          type="number" 
                          {...register("min_budget", { valueAsNumber: true })}
                          className="mt-1.5"
                          placeholder="₹ 0"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Maximum Budget (INR)</Label>
                        <Input 
                          type="number" 
                          {...register("max_budget", { valueAsNumber: true })}
                          className="mt-1.5"
                          placeholder="₹ 0"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={loading} onClick={handleSubmit(onSubmit)}>
                      {loading ? "Submitting..." : "Submit Bid"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                try {
                  toast.success("Logged out successfully!");
                  localStorage.removeItem('userEmail');
                } catch (e) {
                  // ignore
                }
                router.push('/login');
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Bids */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Welcome back{patient ? `, ${patient.name}` : ""}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your surgical bids and track their status
                  </p>
                </div>

                {/* Bids List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Your Bids</h3>
                  
                  {loadingBids ? (
                    <div className="text-sm text-gray-500 py-8 text-center">Loading bids...</div>
                  ) : bids.length === 0 ? (
                    <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-300 rounded-lg">
                      No active bids yet. Create your first bid to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bids.map((b) => (
                        <Card key={b.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 truncate">
                                    {b.surgery_needed}
                                  </h4>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
                                   {b.status || "Pending"}
                                  </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {b.medical_conditions}
                                </p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{b.surgery_area}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{new Date(b.surgery_date).toLocaleDateString()}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    <span>Hospital ID: {b.hospital_id}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-gray-700">
                                    <CreditCard className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{b.budget ? `₹${b.budget}` : "—"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Profile & Recommendations */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Full Name
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {patient?.name ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </div>
                    <div className="text-sm text-gray-900 break-all">
                      {patient?.emailid ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Role
                    </div>
                    <div className="text-sm text-gray-900">
                      {patient?.role ?? "Patient"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Hospitals - Only show if bids exist */}
            {!loadingBids && bids.length > 0 && (
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Recommended Hospitals</h3>
                  <p className="text-xs text-gray-600 mb-4">Based on your budget and requirements</p>
                  
                  <div className="space-y-3">
                    {hospitals.slice(0, 3).map((hospital) => (
                      <div 
                        key={hospital.id} 
                        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">
                            <Building2 className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {hospital.name}
                            </h4>
                            {hospital.address && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {hospital.address}
                              </p>
                            )}
                            {hospital.quote && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                "{hospital.quote}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hospitals.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                        No hospitals available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Open chatbot"
      >
        <Image
          src="/chatbot.png"
          alt="Chatbot"
          width={32}
          height={32}
          className="rounded-full"
        />
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Image
                src="/chatbot.png"
                alt="Chatbot"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold text-sm">Bid Assistant</h3>
                <p className="text-blue-100 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}