import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/About";
import Approach from "@/components/sections/Approach";
import Services from "@/components/sections/Services";
import Studio from "@/components/sections/Studio";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero pins to top; subsequent sections slide over it */}
      <div className="sticky top-0 z-0">
        <Hero />
      </div>
      <div className="relative z-10">
        <Marquee />
        <About />
        <Approach />
        <Services />
        <Studio />
        <Work />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
