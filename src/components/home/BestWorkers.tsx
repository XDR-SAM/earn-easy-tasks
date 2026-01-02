import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, Crown, Medal } from "lucide-react";

const topWorkers = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    coins: 15420,
    rank: 1,
  },
  {
    id: 2,
    name: "Michael Brown",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    coins: 12850,
    rank: 2,
  },
  {
    id: 3,
    name: "Emily Johnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    coins: 11200,
    rank: 3,
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    coins: 9800,
    rank: 4,
  },
  {
    id: 5,
    name: "Lisa Martinez",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    coins: 8950,
    rank: 5,
  },
  {
    id: 6,
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    coins: 8200,
    rank: 6,
  },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const BestWorkers = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Top <span className="gradient-text">Earners</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet our best-performing workers who have earned the most coins through their dedication and quality work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {topWorkers.map((worker, index) => (
            <div
              key={worker.id}
              className={`glass-card p-6 hover-lift animate-slide-up opacity-0 ${
                worker.rank === 1 ? "ring-2 ring-amber-400/50" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={worker.avatar} alt={worker.name} />
                    <AvatarFallback>{worker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-background flex items-center justify-center">
                    {getRankIcon(worker.rank)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{worker.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="coin-badge text-xs py-1 px-2">
                      <Coins className="w-3 h-3" />
                      {worker.coins.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestWorkers;
