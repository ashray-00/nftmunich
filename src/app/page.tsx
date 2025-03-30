import Header from '../components/Header';
import Carousel from '../components/Carousel';
import ContactOptions from '../components/ContactOptions';
import PlayerRegistrationForm from '../components/PlayerRegistrationForm';
import AboutUs from "../components/AboutUs";

export default function Home() {
  return (
    <div className="min-h-screen bg-bavarian-white text-bavarian-blue">
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
          <div>
            <AboutUs />
          </div>
        </section>
        <section id="player-registration" className="w-full h-screen flex flex-col items-center justify-center">
          <h2 className="text-4xl mb-8">Player Registration</h2>
          <div className="w-full flex justify-center mt-8">
            <PlayerRegistrationForm />
          </div>
        </section>
        <section id="contact" className="w-full h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center" style={{ marginTop: '30vh' }}>
            <h2 className="text-4xl mb-8">Contact Us</h2>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <ContactOptions />
          </div>
        </section>
      </main>
    </div>
  );
}