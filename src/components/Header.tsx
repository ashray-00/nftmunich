'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center fixed w-full z-10">
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
        <a href="#home" className="block mt-4 md:inline-block md:mt-0 md:ml-6">
          Home
        </a>
        <a href="#about" className="block mt-4 md:inline-block md:mt-0 md:ml-6">
          About
        </a>
        <a href="#contact" className="block mt-4 md:inline-block md:mt-0 md:ml-6">
          Contact
        </a>
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-20">
          <button onClick={toggleMenu} className="absolute top-4 right-4 focus:outline-none">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <nav className="flex flex-col items-center space-y-6">
            <a href="#home" onClick={toggleMenu} className="text-2xl text-white">
              Home
            </a>
            <a href="#about" onClick={toggleMenu} className="text-2xl text-white">
              About
            </a>
            <a href="#contact" onClick={toggleMenu} className="text-2xl text-white">
              Contact
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}