import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";

const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "blood";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${type === "blood" ? "Blood" : "Medicine"} inventory uploaded successfully!`);
    setTimeout(() => {
      navigate(type === "blood" ? "/dashboard/blood-bank" : "/dashboard/pharmacy");
    }, 1500);
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
                      <Label htmlFor="units">Number of Units *</Label>
                      <Input id="units" type="number" placeholder="5" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collection-date">Collection Date *</Label>
                      <Input id="collection-date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Expiry Date *</Label>
                      <Input id="expiry-date" type="date" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donor-id">Donor ID</Label>
                    <Input id="donor-id" placeholder="D-2024-0001" />
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
                      <Label htmlFor="batch-number">Batch Number *</Label>
                      <Input id="batch-number" placeholder="BATCH-2024-001" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input id="quantity" type="number" placeholder="1000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit Type *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablets">Tablets</SelectItem>
                          <SelectItem value="capsules">Capsules</SelectItem>
                          <SelectItem value="bottles">Bottles</SelectItem>
                          <SelectItem value="vials">Vials</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mfg-date">Manufacturing Date *</Label>
                      <Input id="mfg-date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-date">Expiry Date *</Label>
                      <Input id="exp-date" type="date" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input id="manufacturer" placeholder="Pharma Corp Ltd." />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Storage conditions, special handling instructions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className={`flex-1 ${type === "blood" ? "bg-blood hover:bg-blood/90" : "bg-medicine hover:bg-medicine/90"}`}
                >
                  Upload to Inventory
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

export default Upload;
