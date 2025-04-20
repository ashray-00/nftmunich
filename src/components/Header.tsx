"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6,
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
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="bg-bavarian-white text-bavarian-blue p-4 flex justify-between items-center fixed w-full z-10">
      <div className="flex items-center">
        <Image src="/logo.png" alt="NFT Munich Logo" width={50} height={50} />
        <span className="ml-2 text-xl font-bold">NFT Munich</span>
      </div>
      <div className="md:hidden">
        <button onClick={toggleMenu} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
      <nav className="hidden md:flex md:items-center">
        <a
          href="#home"
          onClick={() => scrollToSection('home')}
          className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === 'home' ? 'text-yellow-700' : ''}`}
        >
          Home
        </a>
        <a
          href="#about"
          onClick={() => scrollToSection('about')}
          className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === 'about' ? 'text-yellow-700' : ''}`}
        >
          About
        </a>
        <a
          href="#player-registration"
          onClick={() => scrollToSection('player-registration')}
          className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === 'player-registration' ? 'text-yellow-700' : ''}`}
        >
          Player Registration
        </a>
        <a
          href="#shop"
          onClick={() => scrollToSection('shop')}
          className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === 'shop' ? 'text-yellow-700' : ''}`}
        >
          Shop
        </a>
        <a
          href="#contact"
          onClick={() => scrollToSection('contact')}
          className={`block mt-4 md:inline-block md:mt-0 md:ml-6 cursor-pointer ${activeSection === 'contact' ? 'text-yellow-700' : ''}`}
        >
          Contact
        </a>
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-bavarian-white bg-opacity-90 flex flex-col items-center justify-center z-20">
          <button onClick={toggleMenu} className="absolute top-4 right-4 focus:outline-none">
            <svg className="w-6 h-6 text-bavarian-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <nav className="flex flex-col items-center space-y-6">
            <a href="#home" onClick={toggleMenu} className="text-2xl text-bavarian-blue">
              Home
            </a>
            <a href="#about" onClick={toggleMenu} className="text-2xl text-bavarian-blue">
              About
            </a>
            <a href="#player-registration" onClick={toggleMenu} className="text-2xl text-bavarian-blue">
              Player Registration
            </a>
            <a href="#shop" onClick={toggleMenu} className="text-2xl text-bavarian-blue">
              Shop
            </a>
            <a href="#contact" onClick={toggleMenu} className="text-2xl text-bavarian-blue">
              Contact
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}