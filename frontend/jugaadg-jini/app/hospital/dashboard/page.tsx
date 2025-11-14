"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Calendar, MapPin, CreditCard, Building2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Hospital = {
  id: number;
  name: string;
  address?: string | null;
  quote?: string | null;
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

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [processingBidId, setProcessingBidId] = useState<number | null>(null);
  const router = useRouter();

  // Fetch first hospital
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/hospitals/`);
        if (!res.ok) throw new Error("Failed to fetch hospitals");
        const data: Hospital[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHospital(data[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load hospital information.");
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, []);

  // Fetch all bids
  const fetchBids = async () => {
    try {
      setLoadingBids(true);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/bids/`);
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

  useEffect(() => {
    fetchBids();
  }, []);

  const handleApprove = async (bidId: number) => {
    try {
      setProcessingBidId(bidId);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/bids/${bidId}/approve`, {
        method: "PATCH",
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error("Approve failed:", errText);
        throw new Error("Failed to approve bid");
      }

      toast.success("Bid approved successfully!");
      // Reload bids
      await fetchBids();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not approve bid");
    } finally {
      setProcessingBidId(null);
    }
  };

  const handleReject = async (bidId: number) => {
    try {
      setProcessingBidId(bidId);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/bids/${bidId}/reject`, {
        method: "PATCH",
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error("Reject failed:", errText);
        throw new Error("Failed to reject bid");
      }

      toast.success("Bid rejected successfully!");
      // Reload bids
      await fetchBids();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not reject bid");
    } finally {
      setProcessingBidId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navbar */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="logo" className="rounded-lg" width={40} height={40} />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {loading ? "Loading..." : hospital?.name ?? "Hospital Dashboard"}
              </div>
              <div className="text-xs text-gray-500">Hospital Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">All Leads</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage surgical bid requests from patients
          </p>
        </div>

        {/* Bids List */}
        <div className="space-y-3">
          {loadingBids ? (
            <div className="text-sm text-gray-500 py-8 text-center">Loading bids...</div>
          ) : bids.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-300 rounded-lg">
              No bids available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bids.map((b) => (
                <Card key={b.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {b.surgery_needed}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
                            {b.status ?? "Pending"}
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
                            <span>Patient ID: {b.patient_id}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{b.budget ? `₹${b.budget}` : "—"}</span>
                          </div>
                        </div>

                        {b.insurance && (
                          <div className="mt-3 text-xs text-gray-600">
                            <span className="font-medium">Insurance:</span> {b.insurance}
                            {b.insurance_balance && ` (Balance: ₹${b.insurance_balance})`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {b.status === "pending" && (
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(b.id)}
                        disabled={processingBidId === b.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {processingBidId === b.id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(b.id)}
                        disabled={processingBidId === b.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {processingBidId === b.id ? "Processing..." : "Reject"}
                      </Button>
                    </div>
                    )}
                    
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}