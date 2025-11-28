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
import MapComponent from "@/components/MapComponent";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Camps = () => {
  const navigate = useNavigate();
  // Default center (e.g., New York or user's location)
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Places Autocomplete Hook
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });

  useEffect(() => {
    // Try to get user's location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLoc);
          fetchCamps(userLoc);
        },
        () => {
          fetchCamps(); // Fallback to fetching all/default
        }
      );
    } else {
      fetchCamps();
    }
  }, []);

  const fetchCamps = async (location?: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const params: any = { status: "upcoming" };
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
        params.radius = 50; // 50km radius
      }

      const { data, error } = await campAPI.getAll(params);
      if (error) {
        toast.error(error);
      } else {
        setCamps((data as any[]) || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch camps");
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(userLoc);
        fetchCamps(userLoc);
        toast.success("Location updated!");
      },
      (error) => {
        setLoading(false);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const handleSelectAddress = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    setSearchOpen(false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const newCenter = { lat, lng };
      setCenter(newCenter);
      fetchCamps(newCenter);
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Failed to get coordinates for this address");
    }
  };

  const handleRegister = async (campId: string, campName: string) => {
    setRegistering(campId);
    try {
      const { error } = await campAPI.register(campId);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Successfully registered for ${campName}! Notifications sent to hospital and government.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setRegistering(null);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <div className="container mx-auto max-w-6xl py-8 px-4">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Medical Camps</h1>
          <p className="text-muted-foreground">Find and register for blood donation camps and medical camps near you</p>
        </div>

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative w-full max-w-md">
                    <Input
                      placeholder="Search by address..."
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        setSearchOpen(true);
                      }}
                      disabled={!ready}
                      className="w-full"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]" align="start">
                  <Command>
                    <CommandList>
                      {status === "OK" && data.map(({ place_id, description }) => (
                        <CommandItem
                          key={place_id}
                          onSelect={() => handleSelectAddress(description)}
                          className="cursor-pointer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          {description}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button variant="outline" onClick={handleUseMyLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Use My Location
              </Button>
            </div>

            {/* Map View */}
            <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
              <MapComponent
                camps={camps}
                center={center}
                onMarkerClick={(camp) => {
                  // Optional: Scroll to card or open modal
                  const element = document.getElementById(`camp-${camp._id}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* List View */}
          <div className="lg:col-span-1 h-[600px] overflow-y-auto pr-2">

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : camps.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {camps.length === 0 && "No upcoming camps available"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {camps.map((camp) => (
                  <Card key={camp._id} id={`camp-${camp._id}`} className="border-border/50 hover:shadow-lg transition-shadow">
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
      </div>
    </div>
  );
};

export default Camps;
