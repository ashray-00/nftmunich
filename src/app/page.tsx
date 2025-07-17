"use client";

// import Header from '../components/Header';
import Carousel from '../components/Carousel';
import ContactOptions from '../components/ContactOptions';
import AboutUs from "../components/AboutUs";
import Shop from "../components/Shop";
import Achievements from '../components/Achievements';
import News from '../components/News'; // Ensure the file exists at this path or adjust the path accordingly
import NrnaCup2025 from '../components/NrnaCup2025';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-bavarian-white text-bavarian-blue">
      {/* <Header /> */}
      <main className="flex flex-col items-center">
        <section id="home" className="relative w-full flex flex-col items-center justify-center">
          <div className="w-full">
            <Carousel />
          </div>
        </section>
        <section id="about" className="relative w-full min-h-screen flex flex-col items-center justify-center">
          <div>
            <AboutUs />
          </div>
        </section>
        <section id="news" className="relative w-full min-h-screen flex flex-col items-center justify-center">
          <div>
            <News />
          </div>
        </section>
        <section id="nrna-cup-2025" className="w-full min-h-screen flex flex-col items-center justify-center">
          <NrnaCup2025 />
        </section>
        <section id="achievements" className="relative w-full min-h-screen flex flex-col items-center justify-center">
          <Achievements />
        </section>
        <section id="player-registration" className="w-full min-h-screen flex flex-col items-center justify-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl mb-8 font-bold title">Player Registration</h2>
            <div className="text-center mb-6">
              <p className="mb-4">
                Join our football community. Click the button below to get started.
              </p>
              <button
                onClick={() => router.push("/player-registration")}
                className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900 transition"
              >
                Register
              </button>
            </div>
          </div>
        </section>
        <section id="shop" className="w-full min-h-screen flex flex-col items-center justify-center">
          <Shop />
        </section>
        <section id="contact" className="w-full min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center contact">
            <h2 className="text-4xl mb-8 title">Contact Us</h2>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <ContactOptions />
          </div>
        </section>
      </main>
    </div>
  );
}