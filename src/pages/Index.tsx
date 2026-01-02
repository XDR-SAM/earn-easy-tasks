import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import BestWorkers from "@/components/home/BestWorkers";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BestWorkers />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CallToAction />
    </Layout>
  );
};

export default Index;
