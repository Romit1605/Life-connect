import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Award, MapPin, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const VolunteerDashboard = () => {
  const upcomingCamps = [
    { 
      id: 1, 
      name: "Community Health Camp", 
      date: "2024-02-15", 
      time: "9:00 AM - 5:00 PM",
      location: "Downtown Community Center", 
      role: "Registration Desk",
      status: "Confirmed"
    },
    { 
      id: 2, 
      name: "Blood Donation Drive", 
      date: "2024-02-20", 
      time: "10:00 AM - 4:00 PM",
      location: "University Campus", 
      role: "Donor Support",
      status: "Pending"
    }
  ];

  const pastCamps = [
    { id: 1, name: "Medicine Distribution Camp", date: "2024-01-28", hours: 8, beneficiaries: 250 },
    { id: 2, name: "Blood Donation Event", date: "2024-01-15", hours: 6, beneficiaries: 150 },
    { id: 3, name: "Health Screening Camp", date: "2023-12-20", hours: 7, beneficiaries: 300 }
  ];

  const handleRegister = (campId: number) => {
    toast.success("Successfully registered for the camp!");
  };

  return (
    <DashboardLayout title="Volunteer Dashboard" role="Volunteer" roleColor="volunteer">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-volunteer/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-volunteer" />
              <span className="text-3xl font-bold">156</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Camps Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">24</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">People Helped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">3.2K</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-government" />
              <span className="text-3xl font-bold">8</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button className="h-auto py-4 bg-volunteer hover:bg-volunteer/90" asChild>
          <Link to="/camps">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Browse Available Camps</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Award className="h-6 w-6" />
            <span>View Certificates</span>
          </div>
        </Button>
      </div>

      {/* Upcoming Camps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Camps</CardTitle>
          <CardDescription>Your registered and pending camp assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingCamps.map((camp) => (
              <div key={camp.id} className="p-4 rounded-lg border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-volunteer/10">
                      <Calendar className="h-6 w-6 text-volunteer" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{camp.name}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{camp.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{camp.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge className={camp.status === "Confirmed" ? "bg-ngo text-ngo-foreground" : "bg-alertYellow text-foreground"}>
                    {camp.status}
                  </Badge>
                </div>
                <div className="pl-16">
                  <p className="text-sm mb-3">
                    <span className="font-medium">Role:</span> {camp.role}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {camp.status === "Confirmed" && (
                      <Button size="sm" className="bg-volunteer hover:bg-volunteer/90">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Past Contributions</CardTitle>
          <CardDescription>Your volunteer history and impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pastCamps.map((camp) => (
              <div key={camp.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ngo/10">
                    <CheckCircle className="h-5 w-5 text-ngo" />
                  </div>
                  <div>
                    <p className="font-semibold">{camp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(camp.date).toLocaleDateString()} • {camp.hours} hours • {camp.beneficiaries} people helped
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Certificate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
