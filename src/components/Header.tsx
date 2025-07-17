"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
    <header className="bg-bavarian-white text-bavarian-blue p-4 md:px-8 md:py-3 flex justify-between items-center fixed w-full z-10 md:z-20">
      <div className="flex items-center">
        <Image src="/logo.png" alt="NFT Munich Logo" width={50} height={50} />
        <span className="ml-2 text-xl font-bold">NFT Munich</span>
      </div>
      <div className="md:hidden">
        <button onClick={toggleMenu} className="focus:outline-none">
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
      <nav className="hidden md:flex md:items-center">
        {[
          { id: "home", label: "Home" },
          { id: "about", label: "About Us" },
          { id: "news", label: "News" },
          { id: "nrna-cup-2025", label: "NRNA Cup"},
          { id: "achievements", label: "Achievements" },
          { id: "player-registration", label: "Player Registration" },
          { id: "shop", label: "Shop" },
          { id: "contact", label: "Contact" },
        ].map((section) => (
          <Link
            key={section.id}
            href={`/#${section.id}`}
            onClick={() => scrollToSection(section.id)}
            className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === section.id ? "text-yellow-700" : ""
              }`}
          >
            {section.label}
          </Link>
        ))}
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-bavarian-white bg-opacity-90 flex flex-col items-center justify-center z-20">
          <button onClick={toggleMenu} className="absolute top-4 right-4 focus:outline-none">
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
          <nav className="flex flex-col items-center space-y-6">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About Us" },
              { id: "news", label: "News" },
              { id: "nrna-cup-2025", label: "NRNA Cup"},
              { id: "achievements", label: "Achievements" },
              { id: "player-registration", label: "Player Registration" },
              { id: "shop", label: "Shop" },
              { id: "contact", label: "Contact" },
            ].map((section) => (
              <Link
                key={section.id}
                href={`/#${section.id}`}
                onClick={toggleMenu}
                className="text-2xl text-bavarian-blue"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}