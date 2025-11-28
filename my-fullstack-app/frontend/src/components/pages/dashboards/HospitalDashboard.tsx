import { Link } from "react-router-dom";
import { Request, Alert } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Droplet, Pill, Activity, AlertTriangle, Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { requestAPI, alertAPI } from "@/services/api";
import { useAuth } from "@/components/contexts/AuthContext";
import { toast } from "sonner";

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch requests
      const { data, error } = await requestAPI.getAll();
      if (error) {
        toast.error("Failed to fetch requests");
      } else {
        const myRequests = (data || []).filter((req) => {
          const requesterId = typeof req.requester === 'object' ? req.requester?._id : req.requester;
          return requesterId === user._id;
        });
        setRequests(myRequests);
      }

      // Fetch alerts (all statuses, not just pending)
      const { data: alertsData, error: alertsError } = await alertAPI.getAll();
      if (!alertsError) {
        setAlerts(alertsData || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
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
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to alert");
    } finally {
      setResponding(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const bloodRequests = requests.filter(r => r.type === "blood");
  const medicineRequests = requests.filter(r => r.type === "medicine");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "bg-ngo text-ngo-foreground";
      case "pending":
        return "bg-alertYellow text-foreground";
      case "cancelled":
        return "bg-alertRed/20 text-alertRed";
      default:
        return "bg-medicine text-medicine-foreground";
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
              <span className="text-3xl font-bold">{pendingRequests.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blood Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blood" />
              <span className="text-3xl font-bold">{bloodRequests.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medicine Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medicine" />
              <span className="text-3xl font-bold">{medicineRequests.length}</span>
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

      {/* Blood Expiry Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Blood Expiry Alerts</CardTitle>
            <CardDescription>Blood units expiring soon from blood banks</CardDescription>
          </CardHeader>
          <CardContent>
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
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Track your blood and medicine requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requests yet</p>
              <p className="text-sm mt-2">Click the buttons above to create a request</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${request.type === "blood" ? "bg-blood/10" : "bg-medicine/10"
                      }`}>
                      {request.type === "blood" ? (
                        <Droplet className="h-6 w-6 text-blood" />
                      ) : (
                        <Pill className="h-6 w-6 text-medicine" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {request.item_name} ({request.quantity} {request.type === "blood" ? "units" : "items"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{request.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getUrgencyBadge(request.urgency)}>
                      {request.urgency}
                    </Badge>
                    <Badge className={getStatusBadge(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default HospitalDashboard;
