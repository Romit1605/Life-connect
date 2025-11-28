import { Link } from "react-router-dom";
import { Alert } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Calendar, Package, TrendingUp, Droplet, AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { alertAPI } from "@/services/api";
import { toast } from "sonner";

const NGODashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const camps = [
    { id: 1, name: "Community Health Camp", date: "2024-02-15", volunteers: 25, status: "Approved", beneficiaries: 500 },
    { id: 2, name: "Medicine Distribution", date: "2024-02-20", volunteers: 15, status: "Pending", beneficiaries: 300 },
    { id: 3, name: "Blood Donation Drive", date: "2024-02-25", volunteers: 20, status: "Planning", beneficiaries: 150 }
  ];

  const stockRequests = [
    { id: 1, item: "Paracetamol (500 tablets)", pharmacy: "City Pharmacy", status: "Approved", expiry: "30 days" },
    { id: 2, item: "Antibiotics (200 bottles)", pharmacy: "MedStore", status: "Pending", expiry: "45 days" }
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await alertAPI.getAll();
      if (error) {
        toast.error("Failed to fetch alerts");
      } else {
        setAlerts(data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
    setResponseMessage("");
  };

  const handleRespondToAlert = async (action: 'approved' | 'rejected') => {
    if (!selectedAlert) return;

    setResponding(true);
    try {
      const { error } = await alertAPI.respond(selectedAlert._id, action, responseMessage);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Alert ${action}!`);
        setIsAlertModalOpen(false);
        setSelectedAlert(null);
        setResponseMessage("");
        fetchAlerts();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to alert");
    } finally {
      setResponding(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

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

        <Card className="border-alertRed/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blood Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alertRed" />
              <span className="text-3xl font-bold">{alerts.length}</span>
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

      {/* Blood Expiry Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Blood Expiry Alerts</CardTitle>
            <CardDescription>Blood units expiring soon from blood banks - Take action to help</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert._id} className="p-4 rounded-lg border border-alertOrange/50 bg-alertOrange/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                          <Droplet className="h-6 w-6 text-blood" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{alert.bloodType} - {alert.quantity} units</p>
                          <p className="text-sm text-muted-foreground">
                            {typeof alert.bloodBank === 'object' ? (alert.bloodBank.organization_name || alert.bloodBank.full_name) : 'Blood Bank'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                            </div>
                            <Badge variant={getUrgencyBadge(alert.urgency)} className="text-xs">
                              {alert.urgency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewAlert(alert)}>
                        View & Respond
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Alert Details Modal */}
      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Blood Expiry Alert Details</DialogTitle>
            <DialogDescription>Review and respond to this alert</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-blood/20 bg-blood/5">
                <div className="flex items-center gap-3 mb-3">
                  <Droplet className="h-8 w-8 text-blood" />
                  <div>
                    <p className="text-xl font-bold">{selectedAlert.bloodType}</p>
                    <p className="text-sm text-muted-foreground">{selectedAlert.quantity} units available</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blood Bank:</span>
                    <span className="font-medium">
                      {typeof selectedAlert.bloodBank === 'object' ? (selectedAlert.bloodBank.organization_name || selectedAlert.bloodBank.full_name) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="font-medium">{new Date(selectedAlert.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgency:</span>
                    <Badge variant={getUrgencyBadge(selectedAlert.urgency)}>{selectedAlert.urgency}</Badge>
                  </div>
                  {selectedAlert.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedAlert.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {selectedAlert.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Response Message (Optional)</Label>
                <Textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Add any notes or comments..."
                  rows={3}
                />
              </div>

              {selectedAlert.status === "approved" && (
                <div className="p-3 rounded-md bg-ngo/10 border border-ngo/30">
                  <p className="text-sm font-medium text-ngo">
                    ✓ This alert has already been approved by another organization
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRespondToAlert('rejected')}
                  disabled={responding || selectedAlert.status === "approved"}
                >
                  {responding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-ngo hover:bg-ngo/90"
                  onClick={() => handleRespondToAlert('approved')}
                  disabled={responding || selectedAlert.status === "approved"}
                >
                  {responding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {selectedAlert.status === "approved" ? "Already Approved" : "Approve"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NGODashboard;
