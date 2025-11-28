import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { medicineAPI } from "@/services/api";
import { useAuth } from "@/components/contexts/AuthContext";

const UploadMedicine = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role !== "pharmacy") {
            toast.error("Access denied. Pharmacy only.");
            navigate(`/dashboard/${user.role}`);
        }
    }, [user, navigate]);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        batchNumber: "",
        quantity: "",
        expiryDate: "",
        manufactureDate: "",
        manufacturer: "",
        notes: ""
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please log in to upload medicine");
            navigate("/login");
            return;
        }

        if (user.role !== "pharmacy") {
            toast.error("Access denied. Pharmacy only.");
            return;
        }

        if (!formData.name || !formData.batchNumber || !formData.quantity || !formData.expiryDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const medicineData = {
                name: formData.name,
                batchNumber: formData.batchNumber,
                quantity: parseInt(formData.quantity),
                expiryDate: formData.expiryDate,
                manufactureDate: formData.manufactureDate || undefined,
                manufacturer: formData.manufacturer || undefined,
                notes: formData.notes || undefined
            };

            const { data, error } = await medicineAPI.add(medicineData);

            if (error) {
                toast.error(error);
            } else {
                toast.success("Medicine uploaded successfully!");
                setTimeout(() => {
                    navigate("/dashboard/pharmacy");
                }, 1500);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to upload medicine");
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
                            <UploadIcon className="h-6 w-6 text-medicine" />
                            Upload Medicine Stock
                        </CardTitle>
                        <CardDescription>
                            Add new medicine inventory to the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Medicine Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Paracetamol 500mg"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="batch">Batch Number *</Label>
                                    <Input
                                        id="batch"
                                        placeholder="e.g. BATCH-2024-001"
                                        required
                                        value={formData.batchNumber}
                                        onChange={(e) => handleChange("batchNumber", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity (Units) *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="1000"
                                        required
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange("quantity", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manufacturer">Manufacturer</Label>
                                    <Input
                                        id="manufacturer"
                                        placeholder="e.g. PharmaCorp Inc."
                                        value={formData.manufacturer}
                                        onChange={(e) => handleChange("manufacturer", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date *</Label>
                                    <Input
                                        id="expiry"
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => handleChange("expiryDate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manufacture">Manufacture Date</Label>
                                    <Input
                                        id="manufacture"
                                        type="date"
                                        value={formData.manufactureDate}
                                        onChange={(e) => handleChange("manufactureDate", e.target.value)}
                                    />
                                </div>
                            </div>

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
                                    className="flex-1 bg-medicine hover:bg-medicine/90"
                                    disabled={loading}
                                >
                                    {loading ? "Uploading..." : "Upload to Inventory"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/dashboard/pharmacy")}
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

export default UploadMedicine;
