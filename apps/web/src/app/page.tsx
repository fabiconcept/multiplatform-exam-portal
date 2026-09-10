import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import ExamCategories from '@/components/landing/ExamCategories';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import Download from '@/components/landing/Download';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ExamCategories />
        <Testimonials />
        <FAQ />
        <Download />
      </main>
      <Footer />
    </>
  );
}
