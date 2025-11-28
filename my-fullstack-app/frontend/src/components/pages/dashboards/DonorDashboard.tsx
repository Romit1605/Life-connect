import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Award, TrendingUp, MapPin } from "lucide-react";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/contexts/AuthContext";

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donationHistory, setDonationHistory] = useState([]);
  const [upcomingCamps, setUpcomingCamps] = useState([]);

  const [stats, setStats] = useState({
    totalDonations: 0,
    bloodType: user?.blood_type || "N/A", // Assuming user object has this
    livesSaved: 0,
    nextEligible: "Available"
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = user.token;

        // Fetch Donations
        const donRes = await fetch("http://localhost:5000/api/donations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const donations = await donRes.json();
        setDonationHistory(donations);

        // Fetch Camps
        const campRes = await fetch("http://localhost:5000/api/camps");
        const camps = await campRes.json();
        setUpcomingCamps(camps);



        // Calculate Stats
        setStats(prev => ({
          ...prev,
          totalDonations: donations.length,
          livesSaved: donations.length * 3 // Approx 3 lives per donation
        }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [user]);



  return (
    <DashboardLayout title="Donor Dashboard" role="Donor" roleColor="blood">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-blood/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">{stats.totalDonations}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blood Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blood">{stats.bloodType}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lives Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">{stats.livesSaved}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-medicine" />
              <span className="text-lg font-semibold">{stats.nextEligible}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-blood hover:bg-blood/90" asChild>
          <Link to="/register?type=blood">
            <div className="flex flex-col items-center gap-2">
              <Heart className="h-6 w-6" />
              <span>Schedule Donation</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline" asChild>
          <Link to="/camps">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6" />
              <span>Find Camps Near Me</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Award className="h-6 w-6" />
            <span>View Certificate</span>
          </div>
        </Button>
      </div>

      {/* Pending Camp Approvals */}


      {/* Donation History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>Your blood donation records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donationHistory.map((donation: any) => (
              <div key={donation._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                    <Heart className="h-6 w-6 text-blood" />
                  </div>
                  <div>
                    <p className="font-semibold">{new Date(donation.donation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">{donation.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{donation.blood_type}</Badge>
                  <Badge className="bg-ngo text-ngo-foreground">{donation.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Camps */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Camps</CardTitle>
          <CardDescription>Medical camps near your location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingCamps.map((camp: any) => (
              <div key={camp._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-semibold">{camp.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(camp.date).toLocaleDateString()} • {camp.location}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/camps">View Details</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DonorDashboard;
