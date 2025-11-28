import { Link, useNavigate } from "react-router-dom";
import { Request, Alert } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Package, AlertTriangle, Upload, Send, Loader2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { requestAPI, medicineAPI, alertAPI } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/components/contexts/AuthContext";

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState<string | null>(null);

  // Modal states
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    urgency: "medium",
    message: "",
  });

  useEffect(() => {
    if (user && user.role !== "pharmacy") {
      toast.error("Access denied. Pharmacy only.");
      navigate(`/dashboard/${user.role}`);
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user || user.role !== "pharmacy") return;
    setLoading(true);
    try {
      // Fetch requests
      const { data: requestsData, error: requestsError } = await requestAPI.getAll({
        type: "medicine",
        status: "pending"
      });

      if (requestsError) {
        toast.error("Failed to fetch requests");
      } else {
        setRequests(requestsData || []);
      }

      // Fetch inventory
      const { data: inventoryData, error: inventoryError } = await medicineAPI.getAll();
      if (inventoryError) {
        toast.error("Failed to fetch inventory");
      } else {
        setInventory((inventoryData as any[]) || []);
      }

      // Fetch alerts
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

  const handleFulfillRequest = async (requestId: string) => {
    setFulfilling(requestId);
    try {
      const { error } = await requestAPI.update(requestId, { status: "fulfilled" });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Request fulfilled successfully!");
        fetchData(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fulfill request");
    } finally {
      setFulfilling(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setFulfilling(requestId);
    try {
      const { error } = await requestAPI.update(requestId, { status: "cancelled" });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Request cancelled");
        fetchData(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel request");
    } finally {
      setFulfilling(null);
    }
  };

  const handleNotifyClick = (medicine: any) => {
    setSelectedMedicine(medicine);
    setAlertForm({
      urgency: medicine.status === "Critical" ? "high" : "medium",
      message: `Medicine ${medicine.name} (Batch: ${medicine.batchNumber}) is expiring on ${new Date(medicine.expiryDate).toLocaleDateString()}. Quantity: ${medicine.quantity}.`,
    });
    setIsNotifyModalOpen(true);
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setSendingAlert(true);
    try {
      const { error } = await alertAPI.create({
        alertType: "medicine",
        medicineName: selectedMedicine.name,
        batchNumber: selectedMedicine.batchNumber,
        quantity: selectedMedicine.quantity,
        expiryDate: selectedMedicine.expiryDate,
        urgency: alertForm.urgency,
        message: alertForm.message,
        location: "Pharmacy", // Could be dynamic if user has location
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Alert sent to NGOs successfully!");
        setIsNotifyModalOpen(false);
        setIsExpiryModalOpen(false); // Close parent modal if open
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send alert");
    } finally {
      setSendingAlert(false);
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

  // Calculate days left for display
  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const expiringMedicines = inventory.filter(item => item.status === "Critical" || item.status === "Warning");

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
              <span className="text-3xl font-bold">{inventory.length}</span>
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
              <span className="text-3xl font-bold">{expiringMedicines.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-ngo" />
              <span className="text-3xl font-bold">{requests.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-auto py-4 bg-medicine hover:bg-medicine/90" asChild>
          <Link to="/pharmacy/upload">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Upload New Stock</span>
            </div>
          </Link>
        </Button>

        <Button className="h-auto py-4" variant="outline" onClick={() => setIsExpiryModalOpen(true)}>
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>View Expiry Alerts ({expiringMedicines.length})</span>
          </div>
        </Button>

        <Button className="h-auto py-4" variant="outline" onClick={() => setIsNotifyModalOpen(true)}>
          <div className="flex flex-col items-center gap-2">
            <Send className="h-6 w-6" />
            <span>Notify NGOs</span>
          </div>
        </Button>
      </div>

      {/* Sent Alerts Section */}
      {alerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sent Alerts</CardTitle>
            <CardDescription>Your medicine expiry alerts and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{alert.medicineName || alert.bloodType} - {alert.quantity} units</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    <Badge variant={alert.status === "acknowledged" ? "outline" : "secondary"}>
                      {alert.status}
                    </Badge>
                  </div>

                  {alert.responses.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Responses:</p>
                      {alert.responses.map((response, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <Badge variant={response.action === "approved" ? "default" : "destructive"} className="text-xs">
                            {response.action}
                          </Badge>
                          <span className="text-muted-foreground">
                            by {typeof response.respondent === 'object' ? (response.respondent.organization_name || response.respondent.full_name) : 'Unknown'}
                          </span>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Requests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Incoming Medicine Requests</CardTitle>
          <CardDescription>Medicine requests from hospitals and NGOs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medicine/10">
                      <Package className="h-6 w-6 text-medicine" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{request.item_name} ({request.quantity} items)</p>
                      <p className="text-sm text-muted-foreground">
                        From: {typeof request.requester === 'object' ? (request.requester.organization_name || request.requester.full_name || "Unknown") : "Unknown"}
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-ngo hover:bg-ngo/10"
                      onClick={() => handleFulfillRequest(request._id)}
                      disabled={fulfilling === request._id}
                    >
                      {fulfilling === request._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Fulfill
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-alertRed hover:bg-alertRed/10"
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={fulfilling === request._id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicine Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>Current stock with expiry monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No medicines in inventory. Upload new stock to get started.</p>
            ) : (
              inventory.map((item) => (
                <div key={item._id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medicine/10">
                        <Pill className="h-5 w-5 text-medicine" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Batch: {item.batchNumber}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(item.status)}>
                      {getDaysLeft(item.expiryDate)} days left
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="ml-2 font-medium">{item.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiry:</span>
                      <span className="ml-2 font-medium">{new Date(item.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Manufacturer:</span>
                      <span className="ml-2 font-medium">{item.manufacturer || "N/A"}</span>
                    </div>
                    <div className="flex justify-end">
                      {(item.status === "Critical" || item.status === "Warning") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-alertOrange text-alertOrange hover:bg-alertOrange/10"
                          onClick={() => handleNotifyClick(item)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Notify NGOs
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiry Alerts Modal */}
      <Dialog open={isExpiryModalOpen} onOpenChange={setIsExpiryModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Expiring Medicines</DialogTitle>
            <DialogDescription>
              Medicines expiring within 30 days (Critical) or 90 days (Warning)
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
            {expiringMedicines.length === 0 ? (
              <p className="text-center text-muted-foreground">No expiring medicines found.</p>
            ) : (
              expiringMedicines.map((item) => (
                <div key={item._id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Batch: {item.batchNumber}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleNotifyClick(item)}
                        className="bg-alertOrange hover:bg-alertOrange/90 text-white"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Notify NGOs
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpiryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify NGOs Modal */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify NGOs</DialogTitle>
            <DialogDescription>
              Send an alert to all NGOs about this expiring medicine.
            </DialogDescription>
          </DialogHeader>

          {!selectedMedicine ? (
            <div className="py-4">
              <Label>Select Medicine</Label>
              <Select onValueChange={(val) => {
                const medicine = inventory.find(i => i._id === val);
                if (medicine) handleNotifyClick(medicine);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a medicine..." />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} (Expires: {new Date(item.expiryDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="p-3 bg-muted rounded-md text-sm">
                <p><strong>Medicine:</strong> {selectedMedicine.name}</p>
                <p><strong>Batch:</strong> {selectedMedicine.batchNumber}</p>
                <p><strong>Quantity:</strong> {selectedMedicine.quantity}</p>
                <p><strong>Expiry:</strong> {new Date(selectedMedicine.expiryDate).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={alertForm.urgency}
                  onValueChange={(val) => setAlertForm({ ...alertForm, urgency: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNotifyModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={sendingAlert}>
                  {sendingAlert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Alert
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
