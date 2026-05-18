"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function FinishLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setErrorMessage("No login token found in the URL. Please request a new login link.");
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          setErrorMessage("This login link is invalid or has expired. Please request a new one.");
          setStatus("error");
          return;
        }
        const data = await res.json();
        localStorage.setItem("nft_session", data.session_token);
        const redirect = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      })
      .catch(() => {
        setErrorMessage("A network error occurred. Please check your connection and try again.");
        setStatus("error");
      });
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#1a3a6b", marginBottom: "1rem" }}>Login Failed</h2>
        <p style={{ color: "#555", maxWidth: "400px", marginBottom: "1.5rem" }}>{errorMessage}</p>
        <Link href="/" style={{ color: "#1a3a6b", textDecoration: "underline" }}>Return to home page</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#1a3a6b", fontSize: "1.1rem" }}>Verifying your login link…</p>
    </div>
  );
}

export default function FinishLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#1a3a6b", fontSize: "1.1rem" }}>Loading…</p>
      </div>
    }>
      <FinishLoginContent />
    </Suspense>
  );
}
