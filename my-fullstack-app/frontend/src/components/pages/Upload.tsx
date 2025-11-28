import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { donationAPI } from "@/services/api";
import { useAuth } from "@/components/contexts/AuthContext";

const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const type = searchParams.get("type") || "blood";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: "",
    units: "",
    collectionDate: "",
    expiryDate: "",
    donorId: "",
    location: "",
    notes: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to upload inventory");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      if (type === "blood") {
        const donationData = {
          blood_type: formData.bloodType,
          units: parseInt(formData.units),
          location: formData.location,
          donation_date: formData.collectionDate || new Date().toISOString(),
          status: "completed"
        };

        const { data, error } = await donationAPI.create(donationData);

        if (error) {
          toast.error(error);
        } else {
          toast.success("Blood inventory uploaded successfully!");
          setTimeout(() => {
            navigate("/dashboard/blood-bank");
          }, 1500);
        }
      } else {
        // For medicine, we would need a medicine inventory API
        // For now, show a message that this feature needs backend support
        toast.error("Medicine inventory upload requires additional backend setup");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <div className="container mx-auto max-w-3xl py-8 px-4">

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UploadIcon className={`h-6 w-6 ${type === "blood" ? "text-blood" : "text-medicine"}`} />
              Upload {type === "blood" ? "Blood" : "Medicine"} Stock
            </CardTitle>
            <CardDescription>
              Add new inventory to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Label htmlFor="units">Number of Units *</Label>
                      <Input
                        id="units"
                        type="number"
                        placeholder="5"
                        required
                        min="1"
                        max="10"
                        value={formData.units}
                        onChange={(e) => handleChange("units", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collection-date">Collection Date *</Label>
                      <Input
                        id="collection-date"
                        type="date"
                        required
                        value={formData.collectionDate}
                        onChange={(e) => handleChange("collectionDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Blood Bank Location"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donor-id">Donor ID (Optional)</Label>
                    <Input
                      id="donor-id"
                      placeholder="D-2024-0001"
                      value={formData.donorId}
                      onChange={(e) => handleChange("donorId", e.target.value)}
                    />
                  </div>
                </>
              )}

              {type === "medicine" && (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Medicine inventory management requires additional backend models and APIs.
                    Please contact the system administrator to set up medicine inventory tracking.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Storage conditions, special handling instructions..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className={`flex-1 ${type === "blood" ? "bg-blood hover:bg-blood/90" : "bg-medicine hover:bg-medicine/90"}`}
                  disabled={loading || type === "medicine"}
                >
                  {loading ? "Uploading..." : "Upload to Inventory"}
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

export default Upload;
