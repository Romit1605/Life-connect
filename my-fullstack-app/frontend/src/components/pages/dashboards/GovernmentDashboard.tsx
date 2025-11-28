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
import { alertAPI, campAPI, reportAPI } from "@/services/api";
import { generateCSV, downloadFile, generateReportFilename, ReportData } from "@/utils/reportUtils";
import { Alert } from "@/types";

const GovernmentDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [pendingCamps, setPendingCamps] = useState<any[]>([]);
  const [approvedCamps, setApprovedCamps] = useState<any[]>([]);
  const [rejectedCamps, setRejectedCamps] = useState<any[]>([]);
  const [approvingCamp, setApprovingCamp] = useState<string | null>(null);
  const [rejectingCamp, setRejectingCamp] = useState<string | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsData, setRecordsData] = useState<ReportData | null>(null);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);

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
        const allCamps = (campsData as any[]) || [];
        const pending = allCamps.filter((camp: any) => camp.governmentApproval?.status === "pending");
        const approved = allCamps.filter((camp: any) => camp.governmentApproval?.status === "approved");
        const rejected = allCamps.filter((camp: any) => camp.governmentApproval?.status === "rejected");
        setPendingCamps(pending);
        setApprovedCamps(approved);
        setRejectedCamps(rejected);
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

  const handleViewRecords = async () => {
    setLoadingRecords(true);
    try {
      const { data, error } = await reportAPI.generateComprehensive();
      if (error) {
        toast.error(error);
      } else {
        setRecordsData(data as ReportData);
        setIsRecordsModalOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!recordsData) return;
    setDownloadingCSV(true);
    try {
      const csv = generateCSV(recordsData);
      const filename = generateReportFilename("government_comprehensive_report");
      downloadFile(csv, filename, "text/csv");
      toast.success("Report downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download report");
    } finally {
      setDownloadingCSV(false);
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

        <Button
          className="h-auto py-4"
          variant="outline"
          onClick={handleViewRecords}
          disabled={loadingRecords}
        >
          <div className="flex flex-col items-center gap-2">
            {loadingRecords ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
            <span>{loadingRecords ? "Loading..." : "View Records"}</span>
          </div>
        </Button>

        <Button
          className="h-auto py-4"
          variant="outline"
          onClick={() => window.location.href = "/rules"}
        >
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

      {/* Approved Camps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Approved Camps</CardTitle>
          <CardDescription>Camps approved by government</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedCamps.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No approved camps.</p>
            ) : (
              approvedCamps.map((camp) => (
                <div key={camp._id} className="p-4 rounded-lg border border-ngo/30 bg-ngo/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                        <CheckCircle className="h-6 w-6 text-ngo" />
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
                    <Badge className="bg-ngo text-white">Approved</Badge>
                  </div>

                  <div className="pl-16 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Location: {camp.location} • Volunteers Needed: {camp.volunteersNeeded}
                    </p>
                    {camp.governmentApproval?.approvedBy && (
                      <p className="text-sm text-ngo font-medium">
                        Approved by: {typeof camp.governmentApproval.approvedBy === 'object'
                          ? (camp.governmentApproval.approvedBy.organization_name || camp.governmentApproval.approvedBy.full_name)
                          : 'Government'} on {new Date(camp.governmentApproval.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejected Camps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rejected Camps</CardTitle>
          <CardDescription>Camps rejected by government</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rejectedCamps.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No rejected camps.</p>
            ) : (
              rejectedCamps.map((camp) => (
                <div key={camp._id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <XCircle className="h-6 w-6 text-destructive" />
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
                    <Badge variant="destructive">Rejected</Badge>
                  </div>

                  <div className="pl-16 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Location: {camp.location}
                    </p>
                    {camp.governmentApproval?.rejectionReason && (
                      <p className="text-sm text-destructive font-medium">
                        Rejection Reason: {camp.governmentApproval.rejectionReason}
                      </p>
                    )}
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

      {/* Records Modal */}
      <Dialog open={isRecordsModalOpen} onOpenChange={setIsRecordsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>System Records</span>
              <Button
                onClick={handleDownloadCSV}
                disabled={downloadingCSV}
                size="sm"
                className="bg-government hover:bg-government/90"
              >
                {downloadingCSV ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Download CSV
                  </>
                )}
              </Button>
            </DialogTitle>
            <DialogDescription>
              Comprehensive system records sorted by date
            </DialogDescription>
          </DialogHeader>

          {recordsData && (
            <div className="space-y-6 mt-4">
              {/* Statistics Summary */}
              <Card className="border-government/20">
                <CardHeader>
                  <CardTitle className="text-lg">Statistics Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Camps</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Total: {recordsData.statistics.camps.total}</li>
                        <li>• Approved: {recordsData.statistics.camps.approved}</li>
                        <li>• Rejected: {recordsData.statistics.camps.rejected}</li>
                        <li>• Pending: {recordsData.statistics.camps.pending}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Blood Requests</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Total: {recordsData.statistics.bloodRequests.total}</li>
                        <li>• Fulfilled: {recordsData.statistics.bloodRequests.fulfilled}</li>
                        <li>• Pending: {recordsData.statistics.bloodRequests.pending}</li>
                        <li>• Cancelled: {recordsData.statistics.bloodRequests.cancelled}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Medicine Requests</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Total: {recordsData.statistics.medicineRequests.total}</li>
                        <li>• Fulfilled: {recordsData.statistics.medicineRequests.fulfilled}</li>
                        <li>• Pending: {recordsData.statistics.medicineRequests.pending}</li>
                        <li>• Cancelled: {recordsData.statistics.medicineRequests.cancelled}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Policies</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Total: {recordsData.statistics.policies.total}</li>
                        <li>• Pharmacy: {recordsData.statistics.policies.byRole.pharmacy}</li>
                        <li>• Blood Bank: {recordsData.statistics.policies.byRole.blood_bank}</li>
                        <li>• Hospital: {recordsData.statistics.policies.byRole.hospital}</li>
                        <li>• NGO: {recordsData.statistics.policies.byRole.ngo}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Camps Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Camps Records</CardTitle>
                  <CardDescription>All camps sorted by date (newest first)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recordsData.camps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No camps recorded</p>
                    ) : (
                      recordsData.camps.map((camp) => (
                        <div key={camp.id} className="p-3 rounded-lg border bg-muted/30">
                          <p className="font-semibold mb-2">{camp.name}</p>
                          <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                            <li>• Date: {new Date(camp.date).toLocaleDateString()}</li>
                            <li>• Organizer: {camp.organizer}</li>
                            <li>• Location: {camp.location}</li>
                            <li>• Status: {camp.status} | Approval: {camp.approvalStatus}</li>
                            <li>• Hospital Approval: {camp.hospitalApproval.status}
                              {camp.hospitalApproval.approvedBy && ` by ${camp.hospitalApproval.approvedBy}`}
                              {camp.hospitalApproval.approvedAt && ` on ${new Date(camp.hospitalApproval.approvedAt).toLocaleDateString()}`}
                            </li>
                            <li>• Government Approval: {camp.governmentApproval.status}
                              {camp.governmentApproval.approvedBy && ` by ${camp.governmentApproval.approvedBy}`}
                              {camp.governmentApproval.approvedAt && ` on ${new Date(camp.governmentApproval.approvedAt).toLocaleDateString()}`}
                            </li>
                            {camp.governmentApproval.rejectionReason && (
                              <li>• Rejection Reason: {camp.governmentApproval.rejectionReason}</li>
                            )}
                            <li>• Volunteers Needed: {camp.volunteersNeeded} | Registrations: {camp.registrations}</li>
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Blood Requests Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blood Requests Records</CardTitle>
                  <CardDescription>All blood requests sorted by date (newest first)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recordsData.bloodRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No blood requests recorded</p>
                    ) : (
                      recordsData.bloodRequests.map((req) => (
                        <div key={req.id} className="p-3 rounded-lg border bg-muted/30">
                          <p className="font-semibold mb-2">Blood Type: {req.bloodType}</p>
                          <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                            <li>• Requester: {req.requester}</li>
                            <li>• Quantity: {req.quantity} units</li>
                            <li>• Urgency: {req.urgency}</li>
                            <li>• Status: {req.status}</li>
                            {req.approvedBy && <li>• Approved By: {req.approvedBy}</li>}
                            {req.notes && <li>• Notes: {req.notes}</li>}
                            <li>• Updated: {new Date(req.updatedAt).toLocaleDateString()}</li>
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medicine Requests Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medicine Requests Records</CardTitle>
                  <CardDescription>All medicine requests sorted by date (newest first)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recordsData.medicineRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No medicine requests recorded</p>
                    ) : (
                      recordsData.medicineRequests.map((req) => (
                        <div key={req.id} className="p-3 rounded-lg border bg-muted/30">
                          <p className="font-semibold mb-2">Medicine: {req.medicineName}</p>
                          <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                            <li>• Requester: {req.requester}</li>
                            <li>• Quantity: {req.quantity}</li>
                            <li>• Urgency: {req.urgency}</li>
                            <li>• Status: {req.status}</li>
                            {req.approvedBy && <li>• Approved By: {req.approvedBy}</li>}
                            {req.notes && <li>• Notes: {req.notes}</li>}
                            <li>• Updated: {new Date(req.updatedAt).toLocaleDateString()}</li>
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Policies Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Policies Records</CardTitle>
                  <CardDescription>All policies sorted by role and section number</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recordsData.policies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No policies recorded</p>
                    ) : (
                      recordsData.policies.map((policy) => (
                        <div key={policy.id} className="p-3 rounded-lg border bg-muted/30">
                          <p className="font-semibold mb-2">{policy.role.toUpperCase()} - Section {policy.sectionNumber}: {policy.sectionTitle}</p>
                          <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                            <li>• Version: {policy.version}</li>
                            <li>• Last Updated By: {policy.lastUpdatedBy || "N/A"}</li>
                            <li>• Policy Items:</li>
                            <ul className="ml-4 space-y-1">
                              {policy.policyItems.map((item: string, idx: number) => (
                                <li key={idx}>- {item}</li>
                              ))}
                            </ul>
                            <li>• Created: {new Date(policy.createdAt).toLocaleDateString()}</li>
                            <li>• Updated: {new Date(policy.updatedAt).toLocaleDateString()}</li>
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsRecordsModalOpen(false)}>
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
