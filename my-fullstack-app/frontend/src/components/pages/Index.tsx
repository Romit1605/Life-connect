import { Heart, Activity, Building2, Users, Shield, ArrowRight, Droplet, Pill } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";
import Header from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user?.role) return "/";
    return `/dashboard/${user.role.toLowerCase()}`;
  };

  const features = [
    {
      icon: Droplet,
      title: "Blood Bank Management",
      description: "Real-time inventory tracking with automated expiry alerts to prevent wastage",
      color: "blood"
    },
    {
      icon: Pill,
      title: "Medicine Redistribution",
      description: "Connect pharmacies with those in need before medicines expire",
      color: "medicine"
    },
    {
      icon: Users,
      title: "NGO Coordination",
      description: "Organize medical camps and distribute resources efficiently",
      color: "ngo"
    },
    {
      icon: Shield,
      title: "Government Oversight",
      description: "Monitor, analyze, and regulate the entire healthcare network",
      color: "gov"
    }
  ];

  const stats = [
    { value: "50K+", label: "Lives Saved", icon: Heart },
    { value: "1.2M", label: "Units Managed", icon: Activity },
    { value: "500+", label: "Hospitals Connected", icon: Building2 },
    { value: "200+", label: "Active NGOs", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Activity className="h-4 w-4" />
            Saving Lives Through Smart Distribution
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Connecting Healthcare
            <span className="block mt-2 bg-gradient-to-r from-blood via-primary to-ngo bg-clip-text text-transparent">
              Resources & Communities
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform managing blood donation, medicine redistribution,
            and healthcare resource optimization to save lives and reduce waste.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              size="lg"
              variant="default"
              onClick={() => navigate(user ? getDashboardPath() : "/login")}
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(user ? "/camps" : "/login?role=donor")}>
              Donate Blood
              <Droplet className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Healthcare Management
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four integrated systems working together to optimize healthcare resources
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-8">
                <div className={`h-14 w-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-br from-primary via-primary to-medicine text-primary-foreground border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the LifeLink Network
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a hospital, NGO, pharmacy, or individual donor,
              your participation helps save lives and reduce healthcare waste.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate("/login")}>
                Register Your Organization
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => navigate(user ? "/dashboard/volunteer" : "/login?role=volunteer")}>
                Become a Volunteer
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blood to-primary flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">LifeLink Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LifeLink. Saving lives through smart healthcare distribution.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
