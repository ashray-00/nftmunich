"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="bg-bavarian-white/95 backdrop-blur-md text-bavarian-blue px-5 py-3 md:px-8 lg:px-10 xl:px-14 flex justify-between items-center fixed top-0 w-full z-30 border-b border-blue-950/10 shadow-[0_8px_30px_rgba(0,58,120,0.08)]">
      <Link href="/" className="flex items-center gap-3 group" aria-label="NFT Munich homepage">
        <Image className="h-[54px] w-[54px] md:h-[64px] md:w-[64px] object-contain transition-transform duration-300 group-hover:scale-105" src="/logo.png" alt="NFT Munich Logo" width={64} height={64} priority />
        <span className="text-xl md:text-2xl font-extrabold tracking-[-0.025em] leading-none">NFT Munich</span>
      </Link>
      <div className="lg:hidden">
        <button onClick={toggleMenu} className="w-11 h-11 grid place-items-center rounded-full border border-bavarian-blue/20 bg-white shadow-sm focus:outline-none" aria-label="Open navigation menu" aria-expanded={isOpen}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>
      <nav className="hidden lg:flex lg:items-center lg:gap-0 xl:gap-2" aria-label="Main navigation">
        {[
          { id: "home", label: "Home" },
          { id: "about", label: "About Us" },
          { id: "news", label: "News" },
          { id: "achievements", label: "Achievements" },
          { id: "registration-request", label: "Registration" },
          { id: "shop", label: "Shop" },
          { id: "contact", label: "Contact" },
        ].map((section) => (
          <Link
            key={section.id}
            href={section.id === "registration-request" ? "/registration-request" : `/#${section.id}`}
            onClick={() => section.id !== "registration-request" && scrollToSection(section.id)}
            className={`inline-flex items-center rounded-full px-2.5 xl:px-4 py-2 text-sm xl:text-[15px] font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-800 cursor-pointer ${activeSection === section.id ? "bg-amber-50 text-amber-700" : ""
              }`}
          >
            {section.label}
          </Link>
        ))}
        {!authLoading && (
          <div className="lg:ml-2 xl:ml-3 flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-bavarian-blue opacity-75 max-w-[140px] truncate">
                  {user.email}
                </span>
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    href="/admin"
                    className="text-sm bg-bavarian-blue text-bavarian-white px-4 py-2 rounded-full shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm border border-bavarian-blue text-bavarian-blue px-4 py-2 rounded-full hover:bg-bavarian-blue hover:text-bavarian-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-bold bg-bavarian-blue text-bavarian-white px-5 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,58,120,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,58,120,0.25)] transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-bavarian-white/95 backdrop-blur-lg flex flex-col items-center justify-center z-40">
          <button onClick={toggleMenu} className="absolute top-5 right-5 w-11 h-11 grid place-items-center rounded-full border border-bavarian-blue/20 bg-white shadow-sm focus:outline-none" aria-label="Close navigation menu">
            <svg
              className="w-6 h-6 text-bavarian-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <nav className="flex flex-col items-center space-y-3" aria-label="Mobile navigation">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About Us" },
              { id: "news", label: "News" },
              { id: "achievements", label: "Achievements" },
              { id: "registration-request", label: "Registration" },
              { id: "shop", label: "Shop" },
              { id: "contact", label: "Contact" },
            ].map((section) => (
              <Link
                key={section.id}
                href={section.id === "registration-request" ? "/registration-request" : `/#${section.id}`}
                onClick={toggleMenu}
                className="text-2xl font-bold text-bavarian-blue px-6 py-2 rounded-full hover:bg-blue-50"
              >
                {section.label}
              </Link>
            ))}
            {!authLoading && (
              <div className="mt-6 flex flex-col items-center gap-4">
                {user ? (
                  <>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <Link
                        href="/admin"
                        onClick={toggleMenu}
                        className="text-xl text-bavarian-blue border border-bavarian-blue px-6 py-2 rounded"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleSignOut(); toggleMenu(); }}
                      className="text-xl text-bavarian-blue border border-bavarian-blue px-6 py-2 rounded"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { router.push("/login"); toggleMenu(); }}
                    className="text-xl text-bavarian-blue border border-bavarian-blue px-6 py-2 rounded"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
