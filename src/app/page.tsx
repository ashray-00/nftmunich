import Header from '../components/Header';
import Carousel from '../components/Carousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="flex flex-col items-center">
        <section id="home" className="relative w-full h-screen flex flex-col items-center justify-center">
          <div className="hidden md:block absolute top-4 left-4 text-center z-10">
            <div className="flex items-center">
              <img src="/logo.png" alt="NFT Munich Logo" width={50} height={50} />
            </div>
          </div>
          <div className="w-full h-full">
            <Carousel />
          </div>
        </section>
        <section id="about" className="w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl">About Us</h2>
        </section>
        <section id="contact" className="w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl">Contact Us</h2>
        </section>
      </main>
    </div>
  );
}