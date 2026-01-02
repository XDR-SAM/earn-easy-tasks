import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, Calendar, Users, Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for available tasks
const tasks = [
  {
    id: 1,
    title: "Watch YouTube video and leave a meaningful comment",
    buyerName: "Marketing Pro",
    buyerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
    completionDate: "2024-01-15",
    payableAmount: 15,
    requiredWorkers: 45,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
  },
  {
    id: 2,
    title: "Complete a 5-minute survey about shopping preferences",
    buyerName: "Research Inc",
    buyerAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100",
    completionDate: "2024-01-18",
    payableAmount: 25,
    requiredWorkers: 100,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
  },
  {
    id: 3,
    title: "Share our Instagram post and tag 3 friends",
    buyerName: "Brand Boost",
    buyerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    completionDate: "2024-01-12",
    payableAmount: 10,
    requiredWorkers: 200,
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400",
  },
  {
    id: 4,
    title: "Write a 100-word product review for our new gadget",
    buyerName: "TechReview",
    buyerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    completionDate: "2024-01-20",
    payableAmount: 50,
    requiredWorkers: 30,
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
  },
  {
    id: 5,
    title: "Sign up for our newsletter and confirm email",
    buyerName: "Email Masters",
    buyerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    completionDate: "2024-01-25",
    payableAmount: 5,
    requiredWorkers: 500,
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400",
  },
  {
    id: 6,
    title: "Download our mobile app and complete onboarding",
    buyerName: "App Launch Co",
    buyerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    completionDate: "2024-01-22",
    payableAmount: 35,
    requiredWorkers: 75,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
  },
];

const TaskList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Available Tasks</h1>
        <p className="text-muted-foreground">Browse and complete tasks to earn coins.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="glass-card overflow-hidden hover-lift group">
            <div className="relative h-40 overflow-hidden">
              <img
                src={task.image}
                alt={task.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <div className="coin-badge">
                  <Coins className="w-4 h-4" />
                  {task.payableAmount}
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold line-clamp-2 min-h-[48px]">{task.title}</h3>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.buyerAvatar} alt={task.buyerName} />
                  <AvatarFallback>{task.buyerName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{task.buyerName}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.completionDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {task.requiredWorkers} spots
                </div>
              </div>

              <Link to={`/dashboard/tasks/${task.id}`}>
                <Button className="w-full" variant="gradient">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
