import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import { Shield, TrendingUp, AlertTriangle, CheckCircle, FileText, Users } from "lucide-react";
import { toast } from "sonner";

const GovernmentDashboard = () => {
  const pendingApprovals = [
    { id: 1, type: "Camp", title: "Community Health Camp - Downtown", requester: "HealthCare NGO", date: "2024-02-15", details: "Budget: $50,000, Expected: 500 people" },
    { id: 2, type: "Budget", title: "Medical Equipment Allocation", requester: "City Hospital", date: "2024-02-18", details: "Amount: $75,000" },
    { id: 3, type: "Camp", title: "Blood Donation Drive", requester: "Red Cross", date: "2024-02-20", details: "Budget: $30,000, Expected: 200 people" }
  ];

  const analytics = {
    totalBloodUnits: "15,420",
    medicinesDistributed: "2.4M",
    activeCamps: "127",
    livesSaved: "45,890"
  };

  const handleApprove = (id: number, title: string) => {
    toast.success(`Approved: ${title}`);
  };

  const handleReject = (id: number, title: string) => {
    toast.error(`Rejected: ${title}`);
  };

  return (
    <DashboardLayout title="Government Dashboard" role="Government" roleColor="government">
      {/* National Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-blood/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blood Units Managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blood">{analytics.totalBloodUnits}</div>
          </CardContent>
        </Card>

        <Card className="border-medicine/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medicines Redistributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-medicine">{analytics.medicinesDistributed}</div>
          </CardContent>
        </Card>

        <Card className="border-ngo/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Camps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ngo">{analytics.activeCamps}</div>
          </CardContent>
        </Card>

        <Card className="border-government/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lives Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-government" />
              <span className="text-3xl font-bold">{analytics.livesSaved}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-government hover:bg-government/90 text-government-foreground">
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Monitor Alerts</span>
          </div>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-6 w-6" />
            <span>Generate Reports</span>
          </div>
        </Button>

        <Button className="h-auto py-4" variant="outline">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-6 w-6" />
            <span>Policy Actions</span>
          </div>
        </Button>
      </div>

      {/* Pending Approvals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve requests from NGOs and hospitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-4 rounded-lg border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-government/10">
                      {approval.type === "Camp" ? (
                        <Users className="h-6 w-6 text-government" />
                      ) : (
                        <FileText className="h-6 w-6 text-government" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{approval.title}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Requested by: {approval.requester}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(approval.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge>{approval.type}</Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 pl-16">
                  {approval.details}
                </p>

                <div className="flex items-center gap-2 pl-16">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{approval.title}</DialogTitle>
                        <DialogDescription>Complete request information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Requester</h4>
                          <p className="text-sm text-muted-foreground">{approval.requester}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Request Type</h4>
                          <Badge>{approval.type}</Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Details</h4>
                          <p className="text-sm text-muted-foreground">{approval.details}</p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            className="flex-1 bg-ngo hover:bg-ngo/90"
                            onClick={() => handleApprove(approval.id, approval.title)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => handleReject(approval.id, approval.title)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    size="sm" 
                    className="bg-ngo hover:bg-ngo/90"
                    onClick={() => handleApprove(approval.id, approval.title)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(approval.id, approval.title)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Live Alerts</CardTitle>
          <CardDescription>Critical alerts from across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-alertRed/10 border border-alertRed/20">
              <AlertTriangle className="h-5 w-5 text-alertRed" />
              <div className="flex-1">
                <p className="text-sm font-medium">Critical Blood Stock - O- Type</p>
                <p className="text-xs text-muted-foreground">City Hospital - Less than 5 units remaining</p>
              </div>
              <Badge variant="destructive">Critical</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-alertOrange/10 border border-alertOrange/20">
              <AlertTriangle className="h-5 w-5 text-alertOrange" />
              <div className="flex-1">
                <p className="text-sm font-medium">Medicine Expiry Warning</p>
                <p className="text-xs text-muted-foreground">Central Pharmacy - 25 batches expiring in 30 days</p>
              </div>
              <Badge className="bg-alertOrange text-white">Warning</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-alertYellow/10 border border-alertYellow/20">
              <AlertTriangle className="h-5 w-5 text-alertYellow" />
              <div className="flex-1">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">District Blood Bank - B+ type below threshold</p>
              </div>
              <Badge className="bg-alertYellow text-foreground">Monitor</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default GovernmentDashboard;
