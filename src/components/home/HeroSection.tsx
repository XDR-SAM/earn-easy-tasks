import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "Earn Money Completing Simple Tasks",
    subtitle: "Join thousands of workers earning daily by completing micro-tasks from anywhere in the world.",
    cta: "Start Earning Today",
    stats: { label: "Active Workers", value: "50K+" },
  },
  {
    title: "Get Your Tasks Done Fast",
    subtitle: "Post your tasks and get them completed by our global network of skilled workers within hours.",
    cta: "Post Your First Task",
    stats: { label: "Tasks Completed", value: "2M+" },
  },
  {
    title: "Secure & Reliable Platform",
    subtitle: "Built with trust and transparency. Your earnings and payments are always protected.",
    cta: "Join Now",
    stats: { label: "Paid Out", value: "$500K+" },
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-primary/10 blur-2xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 relative z-10 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Slides */}
          <div className="relative h-[300px] md:h-[250px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button variant="hero" size="xl" className="group">
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="glass-card p-4 bg-primary-foreground/5 border-primary-foreground/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">50K+</p>
              <p className="text-sm text-primary-foreground/60">Active Workers</p>
            </div>
            <div className="glass-card p-4 bg-primary-foreground/5 border-primary-foreground/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">2M+</p>
              <p className="text-sm text-primary-foreground/60">Tasks Done</p>
            </div>
            <div className="glass-card p-4 bg-primary-foreground/5 border-primary-foreground/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-warning" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">$500K+</p>
              <p className="text-sm text-primary-foreground/60">Paid Out</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
