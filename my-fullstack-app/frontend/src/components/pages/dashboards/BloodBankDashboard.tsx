import { Link } from "react-router-dom";
import { Request, Alert } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplet, Upload, AlertTriangle, Send, TrendingUp, Loader2, CheckCircle, XCircle, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { requestAPI, donationAPI, alertAPI } from "@/services/api";
import { toast } from "sonner";

const BloodBankDashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState<string | null>(null);

  // Modal states
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isSendAlertModalOpen, setIsSendAlertModalOpen] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    bloodType: "",
    quantity: "",
    expiryDate: "",
    urgency: "medium",
    message: "",
    location: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch blood requests
      const { data: requestsData, error: requestsError } = await requestAPI.getAll({
        type: "blood",
        status: "pending"
      });

      if (requestsError) {
        toast.error("Failed to fetch requests");
      } else {
        setRequests(requestsData || []);
      }

      // Fetch blood donations for inventory
      const { data: donationsData, error: donationsError } = await donationAPI.getAll({
        status: "completed"
      });

      if (!donationsError) {
        setDonations((donationsData as any[]) || []);
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
        fetchData();
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
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel request");
    } finally {
      setFulfilling(null);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alertForm.bloodType || !alertForm.quantity || !alertForm.expiryDate || !alertForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSendingAlert(true);
    try {
      const { error } = await alertAPI.create({
        bloodType: alertForm.bloodType,
        quantity: parseInt(alertForm.quantity),
        expiryDate: alertForm.expiryDate,
        urgency: alertForm.urgency,
        message: alertForm.message,
        location: alertForm.location,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Alert sent successfully!");
        setIsSendAlertModalOpen(false);
        setAlertForm({
          bloodType: "",
          quantity: "",
          expiryDate: "",
          urgency: "medium",
          message: "",
          location: "",
        });
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };



  // Calculate inventory from donations
  const inventory = donations.reduce((acc: any, donation: any) => {
    const existing = acc.find((item: any) => item.type === donation.blood_type);
    if (existing) {
      existing.units += donation.units || 1;
    } else {
      acc.push({
        type: donation.blood_type,
        units: donation.units || 1,
        status: "Normal"
      });
    }
    return acc;
  }, []);

  // Mock expiring blood data (in real app, this would come from backend)
  const expiringBlood = [
    { id: 1, bloodType: "O+", units: 5, expiryDate: "2024-02-20", daysLeft: 5 },
    { id: 2, bloodType: "A-", units: 3, expiryDate: "2024-02-18", daysLeft: 3 },
    { id: 3, bloodType: "B+", units: 7, expiryDate: "2024-02-25", daysLeft: 10 },
  ];

  // Sort inventory by blood type
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const sortedInventory = bloodTypes.map(type => {
    const item = inventory.find((i: any) => i.type === type);
    return item || { type, units: 0, status: "Critical" };
  });

  const totalUnits = inventory.reduce((sum: number, item: any) => sum + item.units, 0);
  const criticalStock = sortedInventory.filter((item: any) => item.units < 10).length;

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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
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
              <span className="text-3xl font-bold">{totalUnits}</span>
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
              <span className="text-3xl font-bold">{criticalStock}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-alertOrange/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-alertOrange" />
              <span className="text-3xl font-bold">{requests.length}</span>
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
              <span className="text-3xl font-bold">{donations.length * 3}</span>
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

        <Button className="h-auto py-4" variant="outline" onClick={() => setIsExpiryModalOpen(true)}>
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>View Expiry Alerts ({expiringBlood.length})</span>
          </div>
        </Button>

        <Button className="h-auto py-4" variant="outline" onClick={() => setIsSendAlertModalOpen(true)}>
          <div className="flex flex-col items-center gap-2">
            <Send className="h-6 w-6" />
            <span>Send Alert</span>
          </div>
        </Button>
      </div>

      {/* Sent Alerts Section */}
      {alerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sent Alerts</CardTitle>
            <CardDescription>Your blood expiry alerts and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{alert.bloodType} - {alert.quantity} units</p>
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

      {/* Pending Requests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Blood Requests</CardTitle>
          <CardDescription>Requests from hospitals awaiting fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                      <Droplet className="h-6 w-6 text-blood" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {typeof request.requester === 'object' ? (request.requester.organization_name || request.requester.full_name || "Unknown Hospital") : "Unknown Hospital"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.item_name} • {request.quantity} units
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

      {/* Blood Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Inventory</CardTitle>
          <CardDescription>Current stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sortedInventory.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(item.units < 10 ? "Critical" : item.units < 20 ? "Low" : "Normal")}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blood" />
                    <span className="text-xl font-bold">{item.type}</span>
                  </div>
                  <Badge variant={
                    item.units < 10 ? "destructive" :
                      item.units < 20 ? "secondary" :
                        "outline"
                  } className="text-xs">
                    {item.units < 10 ? "Critical" : item.units < 20 ? "Low" : "Normal"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{item.units} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expiry Alerts Modal */}
      <Dialog open={isExpiryModalOpen} onOpenChange={setIsExpiryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blood Units Expiring Soon</DialogTitle>
            <DialogDescription>Blood units that will expire in the next 14 days</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {expiringBlood.map((blood) => (
              <div key={blood.id} className="p-4 rounded-lg border border-alertOrange/50 bg-alertOrange/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10">
                      <Droplet className="h-6 w-6 text-blood" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{blood.bloodType}</p>
                      <p className="text-sm text-muted-foreground">{blood.units} units available</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(blood.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={blood.daysLeft <= 3 ? "destructive" : "secondary"}>
                    {blood.daysLeft} days left
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsExpiryModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Alert Modal */}
      <Dialog open={isSendAlertModalOpen} onOpenChange={setIsSendAlertModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Blood Expiry Alert</DialogTitle>
            <DialogDescription>Alert NGOs and Hospitals about expiring blood units</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendAlert} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select value={alertForm.bloodType} onValueChange={(value) => setAlertForm({ ...alertForm, bloodType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (units) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={alertForm.quantity}
                  onChange={(e) => setAlertForm({ ...alertForm, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={alertForm.expiryDate}
                  onChange={(e) => setAlertForm({ ...alertForm, expiryDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency *</Label>
                <Select value={alertForm.urgency} onValueChange={(value) => setAlertForm({ ...alertForm, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={alertForm.location}
                onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                placeholder="Blood bank location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                placeholder="Provide details about the blood units and any special instructions..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsSendAlertModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendingAlert} className="bg-blood hover:bg-blood/90">
                {sendingAlert ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Alert
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BloodBankDashboard;
