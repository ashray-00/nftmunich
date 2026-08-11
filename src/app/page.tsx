"use client";

// import Header from '../components/Header';
import Carousel from '../components/Carousel';
import ContactOptions from '../components/ContactOptions';
import AboutUs from "../components/AboutUs";
import Shop from "../components/Shop";
import Achievements from '../components/Achievements';
import News from '../components/News'; // Ensure the file exists at this path or adjust the path accordingly

export default function Home() {
  return (
    <div className="homeGradient min-h-screen text-bavarian-blue">
      {/* <Header /> */}
      <main className="flex flex-col items-center">
        <section id="home" className="relative w-full flex flex-col items-center justify-center px-3 py-4 md:px-8 md:py-7">
          <div className="w-full max-w-[1280px]">
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
        <section id="achievements" className="relative w-full min-h-screen flex flex-col items-center justify-center">
          <Achievements />
        </section>
        <section id="shop" className="w-full min-h-screen flex flex-col items-center justify-center">
          <Shop />
        </section>
        <section id="contact" className="w-full px-4 py-24 md:px-8 md:py-32 flex items-center justify-center">
          <div className="w-full max-w-[1120px] rounded-[28px] border border-white/80 bg-white/85 p-6 md:p-12 shadow-[0_28px_80px_rgba(24,78,135,0.16)] backdrop-blur-xl">
            <div className="grid gap-8 border-b border-blue-950/10 pb-9 md:grid-cols-[1.25fr_.75fr] md:items-end">
              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">NFT Munich e.V.</p>
                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.045em] text-bavarian-blue">Let’s connect.</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Questions about the club, membership or partnerships? Contact us directly and we’ll help you find the right person.</p>
              </div>
              <div className="md:text-right text-sm leading-7 text-slate-600">
                <p className="font-bold text-bavarian-blue">Titurelstrasse 8</p>
                <p>81925 Munich, Germany</p>
                <a href="https://www.nftmunich.club" className="font-semibold text-blue-700 hover:underline">www.nftmunich.club</a>
              </div>
            </div>
            <ContactOptions />
          </div>
        </section>
      </main>
    </div>
  );
}
