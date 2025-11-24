import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Pill, Activity, AlertTriangle, Send } from "lucide-react";

const HospitalDashboard = () => {
  const activeRequests = [
    { id: 1, type: "Blood", item: "O- (3 units)", status: "Pending", urgency: "Critical", date: "2024-02-10" },
    { id: 2, type: "Medicine", item: "Insulin (50 units)", status: "Approved", urgency: "High", date: "2024-02-09" },
    { id: 3, type: "Blood", item: "A+ (2 units)", status: "In Transit", urgency: "Medium", date: "2024-02-08" }
  ];

  const inventory = [
    { type: "A+", units: 45, status: "Normal" },
    { type: "O-", units: 8, status: "Low" },
    { type: "AB+", units: 12, status: "Normal" },
    { type: "B-", units: 5, status: "Critical" }
  ];

  return (
    <DashboardLayout title="Hospital Dashboard" role="Hospital" roleColor="medicine">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-medicine/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-medicine" />
              <span className="text-3xl font-bold">8</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blood Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">70</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medicine" />
              <span className="text-3xl font-bold">234</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-alertRed/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alertRed" />
              <span className="text-3xl font-bold">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button className="h-auto py-4 bg-blood hover:bg-blood/90" asChild>
          <Link to="/request?type=blood&from=hospital">
            <div className="flex flex-col items-center gap-2">
              <Droplet className="h-6 w-6" />
              <span>Request Blood</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4 bg-medicine hover:bg-medicine/90" asChild>
          <Link to="/request?type=medicine&from=hospital">
            <div className="flex flex-col items-center gap-2">
              <Pill className="h-6 w-6" />
              <span>Request Medicine</span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Active Requests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Requests</CardTitle>
          <CardDescription>Track your blood and medicine requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    request.type === "Blood" ? "bg-blood/10" : "bg-medicine/10"
                  }`}>
                    {request.type === "Blood" ? (
                      <Droplet className="h-6 w-6 text-blood" />
                    ) : (
                      <Pill className="h-6 w-6 text-medicine" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{request.item}</p>
                    <p className="text-sm text-muted-foreground">{new Date(request.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={request.urgency === "Critical" ? "destructive" : "secondary"}>
                    {request.urgency}
                  </Badge>
                  <Badge className={
                    request.status === "Pending" ? "bg-alertYellow text-foreground" :
                    request.status === "Approved" ? "bg-ngo text-ngo-foreground" :
                    "bg-medicine text-medicine-foreground"
                  }>
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blood Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Inventory Status</CardTitle>
          <CardDescription>Current blood stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                item.status === "Critical" ? "border-alertRed/50 bg-alertRed/10" :
                item.status === "Low" ? "border-alertOrange/50 bg-alertOrange/10" :
                "border-border/50"
              }`}>
                <div className="text-sm text-muted-foreground mb-1">Type {item.type}</div>
                <div className="text-2xl font-bold mb-1">{item.units}</div>
                <Badge variant={item.status === "Critical" ? "destructive" : "secondary"} className="text-xs">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default HospitalDashboard;
