"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { LogOut, Building2, MapPin, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Hospital = {
  id: number;
  name: string;
  address?: string | null;
  quote?: string | null;
};

type HospitalForm = {
  name: string;
  address: string;
};

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState } = useForm<HospitalForm>({
    defaultValues: {
      name: "",
      address: "",
    },
  });

  // Fetch all hospitals
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/hospitals/`);
      if (!res.ok) {
        console.error("Failed to fetch hospitals:", res.status, await res.text());
        setHospitals([]);
        return;
      }
      const data: Hospital[] = await res.json();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      toast.error("Could not load hospitals.");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const onSubmit = async (data: HospitalForm) => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";

      const payload = {
        name: data.name,
        address: data.address,
        quote: "", // Keep empty as requested
      };

      const res = await fetch(`${API_BASE}/hospitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Create hospital failed:", errText);
        throw new Error("Failed to create hospital");
      }

      setDialogOpen(false);
      reset();
      toast.success("Hospital created successfully!");
      // Reload hospitals
      await fetchHospitals();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not create hospital");
    } finally {
      setLoading(false);
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
              <div className="text-lg font-semibold text-gray-900">Bid For Cure</div>
              <div className="text-xs text-gray-500">Admin Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">SuperAdmin</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>

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
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Hospital Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage all hospitals in the system
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Hospital
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md w-full">
              <DialogHeader>
                <DialogTitle>Create New Hospital</DialogTitle>
                <DialogDescription>
                  Add a new hospital to the system
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-sm font-medium">Hospital Name</Label>
                  <Input 
                    {...register("name", { required: true })}
                    className="mt-1.5"
                    placeholder="Enter hospital name"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <Textarea 
                    {...register("address", { required: true })}
                    className="mt-1.5"
                    rows={3}
                    placeholder="Enter hospital address"
                  />
                </div>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" disabled={loading} onClick={handleSubmit(onSubmit)}>
                  {loading ? "Creating..." : "Create Hospital"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hospitals List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500 py-8 text-center">Loading hospitals...</div>
          ) : hospitals.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-300 rounded-lg">
              No hospitals available. Create your first hospital to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((hospital) => (
                <Card key={hospital.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {hospital.name}
                        </h4>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="line-clamp-2">
                            {hospital.address ?? "No address provided"}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Hospital ID: {hospital.id}</span>
                        </div>
                      </div>
                    </div>
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