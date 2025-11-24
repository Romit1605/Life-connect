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

const Request = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "blood";
  const from = searchParams.get("from") || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Request submitted successfully!");
    setTimeout(() => {
      navigate(-1);
    }, 1500);
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

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
                <Input id="requester" placeholder="Hospital/NGO Name" required />
              </div>

              {type === "blood" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood-type">Blood Type *</Label>
                      <Select required>
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
                      <Input id="units-needed" type="number" placeholder="2" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
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
                      <Input id="medicine-name" placeholder="Paracetamol" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity Needed *</Label>
                      <Input id="quantity" type="number" placeholder="100" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select required>
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
                      <Input id="camp-name" placeholder="Community Health Camp" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="camp-date">Scheduled Date *</Label>
                      <Input id="camp-date" type="date" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" placeholder="City, Address" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expected-attendees">Expected Attendees *</Label>
                      <Input id="expected-attendees" type="number" placeholder="500" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Required</Label>
                      <Input id="budget" type="number" placeholder="50000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resources">Resources Needed</Label>
                    <Textarea
                      id="resources"
                      placeholder="Medicines, equipment, volunteers required..."
                      rows={3}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input id="contact" type="tel" placeholder="+1 (555) 000-0000" required />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Submit Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
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
