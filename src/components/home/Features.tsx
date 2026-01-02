import { Shield, Zap, Globe, Wallet, HeadphonesIcon, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "All transactions are protected with industry-standard encryption and escrow system.",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Get your earnings immediately upon task approval. No waiting periods.",
  },
  {
    icon: Globe,
    title: "Work Anywhere",
    description: "Access tasks from anywhere in the world. All you need is an internet connection.",
  },
  {
    icon: Wallet,
    title: "Low Fees",
    description: "Keep more of what you earn with our competitive and transparent fee structure.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to help you with any issues.",
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Level up your profile, unlock premium tasks, and increase your earnings over time.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">MicroTasks</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've built the most reliable and user-friendly micro-tasking platform with features that set us apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card p-6 hover-lift animate-scale-in opacity-0"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
