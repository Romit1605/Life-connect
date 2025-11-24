import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Upload, AlertTriangle, Send, TrendingUp } from "lucide-react";

const BloodBankDashboard = () => {
  const inventory = [
    { type: "A+", units: 45, expiring: 5, status: "Normal", daysToExpire: 15 },
    { type: "A-", units: 12, expiring: 2, status: "Low", daysToExpire: 8 },
    { type: "B+", units: 38, expiring: 3, status: "Normal", daysToExpire: 20 },
    { type: "B-", units: 8, expiring: 4, status: "Critical", daysToExpire: 3 },
    { type: "AB+", units: 22, expiring: 1, status: "Normal", daysToExpire: 25 },
    { type: "AB-", units: 6, expiring: 2, status: "Critical", daysToExpire: 5 },
    { type: "O+", units: 56, expiring: 8, status: "Normal", daysToExpire: 12 },
    { type: "O-", units: 4, expiring: 3, status: "Critical", daysToExpire: 2 }
  ];

  const recentRequests = [
    { id: 1, hospital: "City Hospital", type: "O-", units: 3, urgency: "Critical", status: "Approved" },
    { id: 2, hospital: "General Hospital", type: "A+", units: 2, urgency: "Urgent", status: "Pending" },
    { id: 3, hospital: "Children's Hospital", type: "B+", units: 1, urgency: "Routine", status: "In Transit" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-alertRed/10 border-alertRed/50";
      case "Low":
        return "bg-alertOrange/10 border-alertOrange/50";
      default:
        return "border-border/50";
    }
  };

  return (
    <DashboardLayout title="Blood Bank Dashboard" role="Blood Bank" roleColor="blood">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-blood/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">191</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-alertRed/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alertRed" />
              <span className="text-3xl font-bold">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alertOrange" />
              <span className="text-3xl font-bold">28</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lives Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">1,243</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-blood hover:bg-blood/90" asChild>
          <Link to="/upload?type=blood">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Add Blood Unit</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>View Expiry Alerts</span>
          </div>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Send className="h-6 w-6" />
            <span>Send Alerts</span>
          </div>
        </Button>
      </div>

      {/* Blood Inventory */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Blood Inventory</CardTitle>
          <CardDescription>Current stock levels with expiry monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blood" />
                    <span className="text-xl font-bold">{item.type}</span>
                  </div>
                  <Badge variant={
                    item.status === "Critical" ? "destructive" : 
                    item.status === "Low" ? "secondary" : 
                    "outline"
                  } className="text-xs">
                    {item.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{item.units} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiring:</span>
                    <span className="font-semibold text-alertOrange">{item.expiring}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days:</span>
                    <span className={`font-semibold ${
                      item.daysToExpire < 7 ? "text-alertRed" : 
                      item.daysToExpire < 14 ? "text-alertOrange" : 
                      "text-ngo"
                    }`}>
                      {item.daysToExpire}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Blood requests from hospitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                    <Droplet className="h-6 w-6 text-blood" />
                  </div>
                  <div>
                    <p className="font-semibold">{request.hospital}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.type} • {request.units} units
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.urgency === "Critical" ? "destructive" : "secondary"}>
                    {request.urgency}
                  </Badge>
                  <Badge className={
                    request.status === "Approved" ? "bg-ngo text-ngo-foreground" :
                    request.status === "Pending" ? "bg-alertYellow text-foreground" :
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
    </DashboardLayout>
  );
};

export default BloodBankDashboard;
