import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Package, AlertTriangle, Upload, Send } from "lucide-react";

const PharmacyDashboard = () => {
  const inventory = [
    { id: 1, name: "Paracetamol", batch: "BATCH-001", quantity: 5000, expiry: "2024-08-15", daysLeft: 180, status: "Normal" },
    { id: 2, name: "Amoxicillin", batch: "BATCH-002", quantity: 1200, expiry: "2024-03-20", daysLeft: 38, status: "Warning" },
    { id: 3, name: "Ibuprofen", batch: "BATCH-003", quantity: 800, expiry: "2024-02-25", daysLeft: 14, status: "Critical" },
    { id: 4, name: "Aspirin", batch: "BATCH-004", quantity: 3000, expiry: "2024-05-10", daysLeft: 88, status: "Warning" }
  ];

  const requests = [
    { id: 1, from: "City Hospital", medicine: "Insulin (100 units)", urgency: "High", status: "Pending" },
    { id: 2, from: "HealthCare NGO", medicine: "Paracetamol (500 tablets)", urgency: "Medium", status: "Approved" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-alertRed/10 border-alertRed/50";
      case "Warning":
        return "bg-alertOrange/10 border-alertOrange/50";
      default:
        return "border-border/50";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return "destructive";
      case "Warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout title="Pharmacy Dashboard" role="Pharmacy" roleColor="medicine">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-medicine/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medicine" />
              <span className="text-3xl font-bold">234</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-alertOrange/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alertOrange" />
              <span className="text-3xl font-bold">18</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$450K</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">7</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-medicine hover:bg-medicine/90" asChild>
          <Link to="/upload?type=medicine">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Upload New Stock</span>
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
            <span>Notify NGOs</span>
          </div>
        </Button>
      </div>

      {/* Medicine Inventory */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>Current stock with expiry monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medicine/10">
                      <Pill className="h-5 w-5 text-medicine" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Batch: {item.batch}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(item.status)}>
                    {item.daysLeft} days left
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="ml-2 font-medium">{item.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry:</span>
                    <span className="ml-2 font-medium">{new Date(item.expiry).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 font-medium ${
                      item.status === "Critical" ? "text-alertRed" :
                      item.status === "Warning" ? "text-alertOrange" :
                      "text-ngo"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incoming Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests</CardTitle>
          <CardDescription>Medicine requests from hospitals and NGOs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medicine/10">
                    <Package className="h-6 w-6 text-medicine" />
                  </div>
                  <div>
                    <p className="font-semibold">{request.medicine}</p>
                    <p className="text-sm text-muted-foreground">From: {request.from}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.urgency === "High" ? "destructive" : "secondary"}>
                    {request.urgency}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {request.status === "Pending" ? "Review" : "View"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
