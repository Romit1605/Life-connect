import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { requestAPI } from "@/services/api";
import { useAuth } from "@/components/contexts/AuthContext";

const Request = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const type = searchParams.get("type") || "blood";
  const from = searchParams.get("from") || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requesterName: "",
    bloodType: "",
    unitsNeeded: "",
    urgency: "",
    medicineName: "",
    quantity: "",
    priority: "",
    campName: "",
    campDate: "",
    location: "",
    expectedAttendees: "",
    budget: "",
    resources: "",
    reason: "",
    contact: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a request");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      let requestData: any = {
        type: type === "camp" ? "blood" : type, // Camp requests are treated as blood type
        location: formData.location,
        notes: formData.reason
      };

      if (type === "blood") {
        requestData.item_name = formData.bloodType;
        requestData.quantity = parseInt(formData.unitsNeeded);
        requestData.urgency = formData.urgency;
      } else if (type === "medicine") {
        requestData.item_name = formData.medicineName;
        requestData.quantity = parseInt(formData.quantity);
        requestData.urgency = formData.priority;
      } else if (type === "camp") {
        // For camp requests, we'll store camp details in notes
        requestData.item_name = formData.campName;
        requestData.quantity = parseInt(formData.expectedAttendees) || 1;
        requestData.urgency = "medium";
        requestData.notes = `Camp: ${formData.campName}\nDate: ${formData.campDate}\nLocation: ${formData.location}\nExpected Attendees: ${formData.expectedAttendees}\nBudget: ${formData.budget}\nResources: ${formData.resources}\nReason: ${formData.reason}`;
      }

      const { data, error } = await requestAPI.create(requestData);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Request submitted successfully!");
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getRequestTitle = () => {
    if (type === "blood") return "Blood Request";
    if (type === "medicine") return "Medicine Request";
    if (type === "camp") return "Camp Registration Request";
    return "Request";
  };

  const getRequestDescription = () => {
    if (type === "blood") return "Request blood units from blood bank";
    if (type === "medicine") return "Request medicines from pharmacy";
    if (type === "camp") return "Request government approval for medical camp";
    return "Submit your request";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <div className="container mx-auto max-w-3xl py-8 px-4">

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Send className="h-6 w-6 text-primary" />
              {getRequestTitle()}
            </CardTitle>
            <CardDescription>
              {getRequestDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="requester">Requester Name *</Label>
                <Input
                  id="requester"
                  placeholder="Hospital/NGO Name"
                  required
                  value={formData.requesterName}
                  onChange={(e) => handleChange("requesterName", e.target.value)}
                />
              </div>

              {type === "blood" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood-type">Blood Type *</Label>
                      <Select
                        required
                        value={formData.bloodType}
                        onValueChange={(value) => handleChange("bloodType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units-needed">Units Needed *</Label>
                      <Input
                        id="units-needed"
                        type="number"
                        placeholder="2"
                        required
                        value={formData.unitsNeeded}
                        onChange={(e) => handleChange("unitsNeeded", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level *</Label>
                    <Select
                      required
                      value={formData.urgency}
                      onValueChange={(value) => handleChange("urgency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {type === "medicine" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicine-name">Medicine Name *</Label>
                      <Input
                        id="medicine-name"
                        placeholder="Paracetamol"
                        required
                        value={formData.medicineName}
                        onChange={(e) => handleChange("medicineName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity Needed *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="100"
                        required
                        value={formData.quantity}
                        onChange={(e) => handleChange("quantity", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      required
                      value={formData.priority}
                      onValueChange={(value) => handleChange("priority", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {type === "camp" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="camp-name">Camp Name *</Label>
                      <Input
                        id="camp-name"
                        placeholder="Community Health Camp"
                        required
                        value={formData.campName}
                        onChange={(e) => handleChange("campName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="camp-date">Scheduled Date *</Label>
                      <Input
                        id="camp-date"
                        type="date"
                        required
                        value={formData.campDate}
                        onChange={(e) => handleChange("campDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, Address"
                      required
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expected-attendees">Expected Attendees *</Label>
                      <Input
                        id="expected-attendees"
                        type="number"
                        placeholder="500"
                        required
                        value={formData.expectedAttendees}
                        onChange={(e) => handleChange("expectedAttendees", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Required</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="50000"
                        value={formData.budget}
                        onChange={(e) => handleChange("budget", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resources">Resources Needed</Label>
                    <Textarea
                      id="resources"
                      placeholder="Medicines, equipment, volunteers required..."
                      rows={3}
                      value={formData.resources}
                      onChange={(e) => handleChange("resources", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide details about the request..."
                  rows={4}
                  required
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  value={formData.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Request;
