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
import { Shield, TrendingUp, AlertTriangle, CheckCircle, FileText, Users, Droplet, Calendar, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { alertAPI, campAPI } from "@/services/api";
import { Alert } from "@/types";

const GovernmentDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [pendingCamps, setPendingCamps] = useState<any[]>([]);
  const [approvingCamp, setApprovingCamp] = useState<string | null>(null);
  const [rejectingCamp, setRejectingCamp] = useState<string | null>(null);

  const analytics = {
    totalBloodUnits: "15,420",
    medicinesDistributed: "2.4M",
    activeCamps: "127",
    livesSaved: "45,890"
  };

  useEffect(() => {
    fetchAlerts();
    fetchPendingCamps();
  }, []);

  const fetchPendingCamps = async () => {
    try {
      const { data: campsData, error: campsError } = await campAPI.getAll();
      if (!campsError) {
        const pending = ((campsData as any[]) || []).filter((camp: any) => camp.governmentApproval?.status === "pending");
        setPendingCamps(pending);
      }
    } catch (error) {
      console.error("Failed to fetch camps:", error);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await alertAPI.getAll();
      if (!error) {
        setAlerts(data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campId: string, campName: string) => {
    setApprovingCamp(campId);
    try {
      const { error } = await campAPI.approveGovernment(campId);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Camp "${campName}" approved by government!`);
        fetchPendingCamps();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve camp");
    } finally {
      setApprovingCamp(null);
    }
  };

  const handleReject = async (campId: string, campName: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setRejectingCamp(campId);
    try {
      const { error } = await campAPI.reject(campId, reason);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Camp "${campName}" rejected.`);
        fetchPendingCamps();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject camp");
    } finally {
      setRejectingCamp(null);
    }
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "bg-ngo/10 border-ngo/50";
      case "pending":
        return "bg-alertYellow/10 border-alertYellow/50";
      default:
        return "bg-muted/50 border-border/50";
    }
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

      {/* Blood Expiry Alerts Monitoring */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Blood Expiry Alerts Monitoring</CardTitle>
          <CardDescription>View all blood expiry alerts across the system (View Only)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Droplet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active blood expiry alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className={`p-4 rounded-lg border ${getStatusColor(alert.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                        <Droplet className="h-6 w-6 text-blood" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg">{alert.bloodType} - {alert.quantity} units</p>
                          <Badge variant={getUrgencyBadge(alert.urgency)} className="text-xs">
                            {alert.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {typeof alert.bloodBank === 'object' ? (alert.bloodBank.organization_name || alert.bloodBank.full_name) : 'Blood Bank'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alert.status}
                          </Badge>
                          {alert.responses.length > 0 && (
                            <span>{alert.responses.length} response(s)</span>
                          )}
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
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve requests from NGOs and hospitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCamps.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No pending camp approvals.</p>
            ) : (
              pendingCamps.map((camp) => (
                <div key={camp._id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-government/10">
                        <Users className="h-6 w-6 text-government" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{camp.name}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Organized by: {typeof camp.organizer === 'object' ? (camp.organizer.organization_name || camp.organizer.full_name) : 'NGO'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(camp.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Camp</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 pl-16">
                    Location: {camp.location} • Volunteers Needed: {camp.volunteersNeeded}
                    {camp.hospitalApproval?.status === "approved" && (
                      <span className="ml-2 inline-flex items-center text-ngo font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" /> Hospital Approved
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-2 pl-16">
                    <Button
                      size="sm"
                      className="bg-ngo hover:bg-ngo/90"
                      onClick={() => handleApprove(camp._id, camp.name)}
                      disabled={approvingCamp === camp._id || rejectingCamp === camp._id}
                    >
                      {approvingCamp === camp._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(camp._id, camp.name)}
                      disabled={approvingCamp === camp._id || rejectingCamp === camp._id}
                    >
                      {rejectingCamp === camp._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
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

      {/* Alert Details Modal (View Only) */}
      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Blood Expiry Alert Details (Monitoring)</DialogTitle>
            <DialogDescription>View alert information - Government monitoring only</DialogDescription>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{selectedAlert.status}</Badge>
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

              {selectedAlert.responses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Responses ({selectedAlert.responses.length})</h4>
                  <div className="space-y-2">
                    {selectedAlert.responses.map((response, idx) => (
                      <div key={idx} className="p-3 rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {typeof response.respondent === 'object' ? (response.respondent.organization_name || response.respondent.full_name) : 'Unknown'}
                          </span>
                          <Badge variant={response.action === "approved" ? "default" : "destructive"} className="text-xs">
                            {response.action}
                          </Badge>
                        </div>
                        {response.message && (
                          <p className="text-xs text-muted-foreground">{response.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAlertModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GovernmentDashboard;
