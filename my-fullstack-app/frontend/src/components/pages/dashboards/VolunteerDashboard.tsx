import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Calendar, Award, MapPin, Clock, CheckCircle, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { volunteerAPI, certificateAPI } from "@/services/api";

const VolunteerDashboard = () => {
  const [selectedCamp, setSelectedCamp] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myCertificates, setMyCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [applicationsResponse, certificatesResponse] = await Promise.all([
        volunteerAPI.getMyApplications(),
        certificateAPI.getMyCertificates(),
      ]);

      if (!applicationsResponse.error && applicationsResponse.data) {
        setMyApplications(applicationsResponse.data as any[]);
      }

      if (!certificatesResponse.error && certificatesResponse.data) {
        setMyCertificates(certificatesResponse.data as any[]);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };



  const pastCamps = myCertificates;

  const handleViewCertificates = () => {
    window.location.href = "/ngo/certificates";
  };

  const handleViewDetails = (camp: any) => {
    setSelectedCamp(camp);
    setIsDetailsOpen(true);
  };

  const handleCheckIn = (campId: number, campName: string) => {
    toast.success(`Checked in to ${campName}!`);
  };

  const handleDownloadCertificate = (campId: number, campName: string) => {
    toast.success(`Downloading certificate for ${campName}`);
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
              <span className="text-3xl font-bold">
                {myCertificates.reduce((sum, cert) => sum + (cert.hoursWorked || 0), 0)}
              </span>
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
              <span className="text-3xl font-bold">{myCertificates.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">{myApplications.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-government" />
              <span className="text-3xl font-bold">{myCertificates.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-volunteer hover:bg-volunteer/90" asChild>
          <Link to="/volunteer/opportunities">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Browse Opportunities</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline" asChild>
          <Link to="/camps">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>View All Camps</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline" asChild>
          <Link to="/ngo/certificates">
            <div className="flex flex-col items-center gap-2">
              <Award className="h-6 w-6" />
              <span>My Certificates</span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Upcoming Camps & Applications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Applications & Upcoming Camps</CardTitle>
          <CardDescription>Track your volunteer applications and confirmed camp assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-volunteer" />
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven't applied to any camps yet.
              </p>
              <Button className="bg-volunteer hover:bg-volunteer/90" asChild>
                <Link to="/volunteer/opportunities">
                  Browse Opportunities
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application) => (
                <div key={application._id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-volunteer/10">
                        <Calendar className="h-6 w-6 text-volunteer" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{application.camp?.name}</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(application.camp?.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{application.camp?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      application.status === "approved" ? "bg-ngo text-ngo-foreground" :
                        application.status === "rejected" ? "bg-destructive text-destructive-foreground" :
                          "bg-yellow-100 text-yellow-800"
                    }>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="pl-16">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedCamp(application.camp);
                        setIsDetailsOpen(true);
                      }}>View Details</Button>
                      {application.status === "approved" && (
                        <Button size="sm" className="bg-volunteer hover:bg-volunteer/90" onClick={() => handleCheckIn(application.camp._id, application.camp.name)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Past Contributions</CardTitle>
          <CardDescription>Your volunteer history and certificates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-volunteer" />
            </div>
          ) : pastCamps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No certificates yet. Complete camps to earn certificates!
            </p>
          ) : (
            <div className="space-y-3">
              {pastCamps.map((cert) => (
                <div key={cert._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ngo/10">
                      <CheckCircle className="h-5 w-5 text-ngo" />
                    </div>
                    <div>
                      <p className="font-semibold">{cert.campName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(cert.issuedDate).toLocaleDateString()} • {cert.hoursWorked} hours
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/ngo/certificates`, '_blank')}>
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camp Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCamp?.name}</DialogTitle>
            <DialogDescription>Complete camp information and details</DialogDescription>
          </DialogHeader>

          {selectedCamp && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge className={selectedCamp.status === "Confirmed" ? "bg-ngo text-ngo-foreground" : "bg-alertYellow text-foreground"}>
                  {selectedCamp.status}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCamp.description}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-volunteer" />
                    Date
                  </h4>
                  <p className="text-sm">{new Date(selectedCamp.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-volunteer" />
                    Time
                  </h4>
                  <p className="text-sm">{selectedCamp.time}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-volunteer" />
                  Location
                </h4>
                <p className="text-sm font-medium">{selectedCamp.location}</p>
                <p className="text-sm text-muted-foreground">{selectedCamp.address}</p>
              </div>

              {/* Your Role */}
              <div>
                <h4 className="font-semibold mb-2">Your Assigned Role</h4>
                <p className="text-sm bg-volunteer/10 text-volunteer px-3 py-2 rounded-md inline-block">{selectedCamp.role}</p>
              </div>

              {/* Camp Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-volunteer" />
                    Expected Attendees
                  </h4>
                  <p className="text-sm">{selectedCamp.expectedAttendees} people</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-volunteer" />
                    Volunteers Needed
                  </h4>
                  <p className="text-sm">{selectedCamp.volunteersNeeded} volunteers</p>
                </div>
              </div>

              {/* Coordinator Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Camp Coordinator</h4>
                <p className="text-sm font-medium">{selectedCamp.coordinator}</p>
                <p className="text-sm text-muted-foreground">{selectedCamp.contactPhone}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedCamp.status === "Confirmed" && (
                  <Button className="bg-volunteer hover:bg-volunteer/90" onClick={() => {
                    handleCheckIn(selectedCamp.id, selectedCamp.name);
                    setIsDetailsOpen(false);
                  }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
