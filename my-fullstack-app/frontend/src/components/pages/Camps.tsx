import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Camps = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");

  const camps = [
    {
      id: 1,
      name: "Community Blood Donation Drive",
      location: "City Hospital, Downtown",
      date: "2024-02-15",
      time: "9:00 AM - 5:00 PM",
      organizer: "Red Cross Society",
      volunteers: 15,
      capacity: 100,
      registered: 67,
      status: "upcoming",
      description: "Join us for a blood donation camp. All blood types needed. Free health checkup included."
    },
    {
      id: 2,
      name: "Medical & Medicine Distribution Camp",
      location: "Community Center, East District",
      date: "2024-02-20",
      time: "10:00 AM - 4:00 PM",
      organizer: "HealthCare NGO",
      volunteers: 25,
      capacity: 200,
      registered: 134,
      status: "upcoming",
      description: "Free medical checkup and medicine distribution for the community."
    },
    {
      id: 3,
      name: "Blood Donation & Health Screening",
      location: "University Campus, North Wing",
      date: "2024-02-25",
      time: "8:00 AM - 6:00 PM",
      organizer: "Student Medical Association",
      volunteers: 20,
      capacity: 150,
      registered: 89,
      status: "upcoming",
      description: "Blood donation drive with comprehensive health screening for donors."
    }
  ];

  const handleRegister = () => {
    toast.success("Registration successful! You'll receive a confirmation email.");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Medical Camps</h1>
          <p className="text-muted-foreground">Find and register for blood donation camps and medical camps near you</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Use My Location
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {camps.map((camp) => (
            <Card key={camp.id} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{camp.name}</CardTitle>
                    <CardDescription>Organized by {camp.organizer}</CardDescription>
                  </div>
                  <Badge className="bg-ngo text-ngo-foreground">{camp.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.registered} / {camp.capacity} registered</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{camp.description}</p>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{camp.name}</DialogTitle>
                        <DialogDescription>Complete camp information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Location</h4>
                          <p className="text-sm text-muted-foreground">{camp.location}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Date</h4>
                            <p className="text-sm text-muted-foreground">{new Date(camp.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Time</h4>
                            <p className="text-sm text-muted-foreground">{camp.time}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Organizer</h4>
                          <p className="text-sm text-muted-foreground">{camp.organizer}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Volunteers</h4>
                            <p className="text-sm text-muted-foreground">{camp.volunteers} volunteers</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Capacity</h4>
                            <p className="text-sm text-muted-foreground">{camp.registered} / {camp.capacity}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{camp.description}</p>
                        </div>
                        <Button 
                          className="w-full bg-ngo hover:bg-ngo/90"
                          onClick={handleRegister}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Register for Camp
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    className="bg-ngo hover:bg-ngo/90"
                    onClick={handleRegister}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Register Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Camps;
