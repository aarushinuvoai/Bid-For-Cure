"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // prevents back button returning to "/"
  }, [router]);

  return null; // nothing to render
}
