import Navbar from "../components/Navbar";
import homeStyles from "../styles/homeStyles";
import Hero from "../components/home/Hero";
import PhotoStrip from "../components/home/PhotoStrip";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import TopRatedCarousel from "../components/home/TopRatedCarousel";
import CTA from "../components/home/CTA";
import DarkFooter from "../components/home/DarkFooter";

export default function HomePage() {
  return (
    <div style={{ background: "#09090b" }}>
      <style>{homeStyles}</style>
      <Navbar />
      <Hero />
      <PhotoStrip />
      <HowItWorks />
      <Features />
      <TopRatedCarousel />
      <CTA />
      <DarkFooter />
    </div>
  );
}
