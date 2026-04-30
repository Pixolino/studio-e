import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/ProblemSection";
import Approach from "@/components/sections/Approach";
import Services from "@/components/sections/Services";
// import Studio from "@/components/sections/Studio";
import AboutUs from "@/components/sections/FoundersSection";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero owns its sticky scroll-lock wrapper internally */}
      <div className="relative z-0">
        <Hero />
      </div>
      <div className="relative z-10">
        <Marquee />
        <About />
        <Approach />
        <Services />
        {/* <Studio /> */}
        <Work />
        <AboutUs />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
