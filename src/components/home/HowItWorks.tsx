import { UserPlus, ListTodo, Coins, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up as a Worker or Buyer in seconds. No complex verification needed.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: ListTodo,
    title: "Browse or Post Tasks",
    description: "Workers browse available tasks. Buyers post tasks with clear instructions.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: CheckCircle,
    title: "Complete & Review",
    description: "Workers complete tasks and submit proof. Buyers review and approve submissions.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Coins,
    title: "Get Paid",
    description: "Approved work means instant coins! Withdraw your earnings anytime.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting started is easy! Follow these simple steps to begin earning or getting tasks done.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div 
                  className="glass-card p-6 h-full hover-lift animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${step.bgColor} flex items-center justify-center mb-4`}>
                    <step.icon className={`w-7 h-7 ${step.color}`} />
                  </div>
                  
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
