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
import { alertAPI, campAPI, requestAPI } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/components/contexts/AuthContext";

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

  const [myCamps, setMyCamps] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch alerts (all statuses, not just pending)
      const { data: alertsData, error: alertsError } = await alertAPI.getAll();
      if (!alertsError) {
        setAlerts(alertsData || []);
      }

      // Fetch my camps
      const { data: campsData, error: campsError } = await campAPI.getAll();
      if (!campsError) {
        const myOwnCamps = ((campsData as any[]) || []).filter((camp: any) => {
          const organizerId = typeof camp.organizer === 'object' ? camp.organizer._id : camp.organizer;
          return organizerId === user._id || organizerId?.toString() === user._id?.toString();
        });
        setMyCamps(myOwnCamps);
      }

      // Fetch my requests
      const { data: requestsData, error: requestsError } = await requestAPI.getAll();
      if (!requestsError) {
        const myOwnRequests = ((requestsData as any[]) || []).filter((req: any) => {
          const requesterId = typeof req.requester === 'object' ? req.requester._id : req.requester;
          return requesterId === user._id;
        });
        setMyRequests(myOwnRequests);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data"); // Changed message to be more general
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
              <span className="text-3xl font-bold">{myRequests.length}</span>
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

      {/* My Camps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Camps</CardTitle>
          <CardDescription>Your scheduled camps and their approval status</CardDescription>
        </CardHeader>
        <CardContent>
          {myCamps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No camps created yet. Click "Schedule New Camp" to create one.</p>
          ) : (
            <div className="space-y-4">
              {myCamps.map((camp) => (
                <div key={camp._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                      <Calendar className="h-6 w-6 text-ngo" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{camp.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(camp.date).toLocaleDateString()} • {camp.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {camp.hospitalApproval?.status === "approved" ? (
                          <Badge className="bg-ngo text-ngo-foreground">Hospital ✓</Badge>
                        ) : camp.hospitalApproval?.status === "rejected" ? (
                          <Badge variant="destructive">Hospital ✗</Badge>
                        ) : (
                          <Badge variant="secondary">Hospital Pending</Badge>
                        )}
                        {camp.governmentApproval?.status === "approved" ? (
                          <Badge className="bg-ngo text-ngo-foreground">Government ✓</Badge>
                        ) : camp.governmentApproval?.status === "rejected" ? (
                          <Badge variant="destructive">Government ✗</Badge>
                        ) : (
                          <Badge variant="secondary">Government Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      camp.approvalStatus === "approved" ? "bg-ngo text-ngo-foreground" :
                        camp.approvalStatus === "rejected" ? "bg-alertRed/20 text-alertRed" :
                          "bg-alertYellow text-foreground"
                    }>
                      {camp.approvalStatus === "approved" ? "Fully Approved" :
                        camp.approvalStatus === "rejected" ? "Rejected" : "Pending Approval"}
                    </Badge>
                    {camp.registrations && camp.registrations.length > 0 && (
                      <Badge variant="outline">{camp.registrations.length} Registered</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            {myRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No stock requests found.</p>
            ) : (
              myRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medicine/10">
                      <Package className="h-6 w-6 text-medicine" />
                    </div>
                    <div>
                      <p className="font-semibold">{request.item_name} ({request.quantity})</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()} • {request.urgency} urgency
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      request.status === "fulfilled" ? "bg-ngo text-ngo-foreground" :
                        request.status === "cancelled" ? "bg-alertRed/20 text-alertRed" :
                          "bg-alertYellow text-foreground"
                    }>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
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
