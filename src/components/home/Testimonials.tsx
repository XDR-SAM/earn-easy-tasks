import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Amanda Rodriguez",
    role: "Freelance Worker",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    quote: "MicroTasks has completely changed how I earn extra income. The tasks are simple, payments are reliable, and I can work from anywhere!",
    rating: 5,
  },
  {
    id: 2,
    name: "Robert Chang",
    role: "Digital Marketer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    quote: "As a buyer, I've been amazed by the speed and quality of work. My tasks get completed within hours, and the workers are incredibly dedicated.",
    rating: 5,
  },
  {
    id: 3,
    name: "Jennifer Smith",
    role: "Stay-at-home Mom",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    quote: "I love being able to earn while taking care of my kids. MicroTasks gives me the flexibility I need to balance work and family life.",
    rating: 5,
  },
  {
    id: 4,
    name: "Carlos Mendez",
    role: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    quote: "The platform is incredibly easy to use. I can quickly post tasks and get them done by verified workers. Highly recommended for any business!",
    rating: 5,
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150",
    quote: "Perfect for students like me! I complete tasks between classes and earn enough for my monthly expenses. The best side gig ever!",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say about their experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Main Testimonial */}
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/10" />
            
            <div className="relative z-10">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-500 ${
                    index === currentIndex
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 absolute inset-0 translate-x-8"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-6 border-4 border-primary/20">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                      ))}
                    </div>

                    <blockquote className="text-lg md:text-xl text-foreground/80 mb-6 max-w-2xl italic">
                      "{testimonial.quote}"
                    </blockquote>

                    <div>
                      <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                      <p className="text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
