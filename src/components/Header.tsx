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
  const isOwner = user?.email.toLowerCase() === "evrcolgy@gmail.com";

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
      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height || 0;
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="fixed top-0 w-full z-30 shadow-[0_10px_30px_rgba(0,35,80,0.16)]">
      <div className="h-[83px] lg:h-[94px] bg-white text-bavarian-blue px-5 md:px-8 lg:px-10 xl:px-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 lg:gap-4 group" aria-label="NFT Munich homepage">
          <Image className="h-[58px] w-[58px] lg:h-[74px] lg:w-[74px] object-contain transition-transform duration-300 group-hover:scale-105" src="/logo.png" alt="NFT Munich Logo" width={74} height={74} priority />
          <span className="text-xl lg:text-[1.65rem] font-semibold tracking-[-0.025em] leading-none">NFT Munich</span>
        </Link>

        <div className="hidden lg:flex items-center gap-5 text-sm font-semibold">
          <span className="text-blue-950/55">Est. 2014 · Munich</span>
          <Link href="/#contact" onClick={() => scrollToSection("contact")} className="hover:text-blue-800 transition-colors">Contact</Link>
          {!authLoading && (user ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[160px] truncate text-blue-950/60">{user.email}</span>
              {isOwner && <Link href="/admin" className="font-bold hover:text-blue-800">Admin</Link>}
              <button onClick={handleSignOut} className="border border-bavarian-blue px-4 py-2 rounded-md hover:bg-bavarian-blue hover:text-white transition-colors">Sign Out</button>
            </div>
          ) : (
            <button onClick={() => router.push("/login")} className="font-bold bg-bavarian-blue text-white px-5 py-2.5 rounded-md hover:bg-blue-800 transition-colors">Sign In</button>
          ))}
        </div>

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
      </div>

      <nav className="hidden lg:flex h-[50px] items-center px-10 xl:px-14 bg-bavarian-blue text-white gap-1 xl:gap-3 border-t border-white/10" aria-label="Main navigation">
        {[
          { id: "home", label: "Home" },
          { id: "about", label: "About Us" },
          { id: "news", label: "News" },
          { id: "achievements", label: "Achievements" },
          { id: "registration", label: "Registration" },
          { id: "shop", label: "Shop" },
          { id: "contact", label: "Contact" },
        ].map((section) => (
          <Link
            key={section.id}
            href={section.id === "registration" ? "/registration" : `/#${section.id}`}
            onClick={() => section.id !== "registration" && scrollToSection(section.id)}
            className={`h-full inline-flex items-center px-3 xl:px-4 text-sm xl:text-[15px] font-bold border-b-[3px] transition-colors cursor-pointer ${activeSection === section.id ? "border-amber-400 text-amber-300" : "border-transparent hover:border-white/55 hover:bg-white/10"
              }`}
          >
            {section.label}
          </Link>
        ))}
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
              { id: "registration", label: "Registration" },
              { id: "shop", label: "Shop" },
              { id: "contact", label: "Contact" },
            ].map((section) => (
              <Link
                key={section.id}
                href={section.id === "registration" ? "/registration" : `/#${section.id}`}
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
                    {isOwner && (
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
