import { useState, useEffect } from "react";
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
import { MapPin, Calendar, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { campAPI } from "@/services/api";

const Camps = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const { data, error } = await campAPI.getAll({ status: "upcoming" });
      if (error) {
        toast.error(error);
      } else {
        setCamps(data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch camps");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campId: string, campName: string) => {
    setRegistering(campId);
    try {
      // In a real app, you would have a registration endpoint
      // For now, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`Successfully registered for ${campName}! You'll receive a confirmation email.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setRegistering(null);
    }
  };

  const filteredCamps = camps.filter(camp =>
    searchLocation === "" ||
    camp.location?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    camp.name?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <div className="container mx-auto max-w-6xl py-8 px-4">

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCamps.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchLocation ? "No camps found matching your search" : "No upcoming camps available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredCamps.map((camp) => (
              <Card key={camp._id} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{camp.name}</CardTitle>
                      <CardDescription>
                        Organized by {camp.organizer?.organization_name || camp.organizer?.full_name || "Unknown"}
                      </CardDescription>
                    </div>
                    <Badge className="bg-ngo text-ngo-foreground">{camp.status || "upcoming"}</Badge>
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
                    {camp.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{camp.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  {camp.description && (
                    <p className="text-sm text-muted-foreground mb-4">{camp.description}</p>
                  )}

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
                            {camp.contact_phone && (
                              <div>
                                <h4 className="font-semibold mb-2">Contact</h4>
                                <p className="text-sm text-muted-foreground">{camp.contact_phone}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Organizer</h4>
                            <p className="text-sm text-muted-foreground">
                              {camp.organizer?.organization_name || camp.organizer?.full_name}
                            </p>
                            {camp.organizer?.email && (
                              <p className="text-sm text-muted-foreground">{camp.organizer.email}</p>
                            )}
                          </div>
                          {camp.description && (
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{camp.description}</p>
                            </div>
                          )}
                          <Button
                            className="w-full bg-ngo hover:bg-ngo/90"
                            onClick={() => handleRegister(camp._id, camp.name)}
                            disabled={registering === camp._id}
                          >
                            {registering === camp._id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Register for Camp
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      className="bg-ngo hover:bg-ngo/90"
                      onClick={() => handleRegister(camp._id, camp.name)}
                      disabled={registering === camp._id}
                    >
                      {registering === camp._id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Register Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Camps;
