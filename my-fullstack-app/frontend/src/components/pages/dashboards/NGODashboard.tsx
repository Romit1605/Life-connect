import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Package, TrendingUp, Plus } from "lucide-react";

const NGODashboard = () => {
  const camps = [
    { id: 1, name: "Community Health Camp", date: "2024-02-15", volunteers: 25, status: "Approved", beneficiaries: 500 },
    { id: 2, name: "Medicine Distribution", date: "2024-02-20", volunteers: 15, status: "Pending", beneficiaries: 300 },
    { id: 3, name: "Blood Donation Drive", date: "2024-02-25", volunteers: 20, status: "Planning", beneficiaries: 150 }
  ];

  const stockRequests = [
    { id: 1, item: "Paracetamol (500 tablets)", pharmacy: "City Pharmacy", status: "Approved", expiry: "30 days" },
    { id: 2, item: "Antibiotics (200 bottles)", pharmacy: "MedStore", status: "Pending", expiry: "45 days" }
  ];

  return (
    <DashboardLayout title="NGO Dashboard" role="NGO" roleColor="ngo">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-ngo/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Camps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">6</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-volunteer" />
              <span className="text-3xl font-bold">145</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-medicine" />
              <span className="text-3xl font-bold">12</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lives Impacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">5.2K</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-ngo hover:bg-ngo/90" asChild>
          <Link to="/request?type=camp&from=ngo">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule New Camp</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline" asChild>
          <Link to="/request?type=medicine&from=ngo">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span>Request Stock</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-6 w-6" />
            <span>Manage Volunteers</span>
          </div>
        </Button>
      </div>

      {/* Medical Camps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Medical Camps</CardTitle>
          <CardDescription>Scheduled and upcoming camps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {camps.map((camp) => (
              <div key={camp.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                    <Calendar className="h-6 w-6 text-ngo" />
                  </div>
                  <div>
                    <p className="font-semibold">{camp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(camp.date).toLocaleDateString()} • {camp.volunteers} volunteers • {camp.beneficiaries} expected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    camp.status === "Approved" ? "bg-ngo text-ngo-foreground" :
                    camp.status === "Pending" ? "bg-alertYellow text-foreground" :
                    "bg-secondary text-secondary-foreground"
                  }>
                    {camp.status}
                  </Badge>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Expiring Stock Requests</CardTitle>
          <CardDescription>Medicines available from pharmacies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medicine/10">
                    <Package className="h-6 w-6 text-medicine" />
                  </div>
                  <div>
                    <p className="font-semibold">{request.item}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.pharmacy} • Expires in {request.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    request.status === "Approved" ? "bg-ngo text-ngo-foreground" :
                    "bg-alertYellow text-foreground"
                  }>
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NGODashboard;
