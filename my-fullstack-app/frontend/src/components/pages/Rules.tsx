import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Building2, Heart, Users, FileText, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { policyAPI } from "@/services/api";
import { toast } from "sonner";

interface PolicyItem {
    _id: string;
    role: string;
    sectionTitle: string;
    sectionNumber: number;
    policyItems: string[];
    version: number;
    lastUpdatedBy: any;
}

const Rules = () => {
    const [policies, setPolicies] = useState<PolicyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
    const [currentRole, setCurrentRole] = useState("pharmacy");
    const [saving, setSaving] = useState(false);

    // Form state
    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionNumber, setSectionNumber] = useState(1);
    const [policyItems, setPolicyItems] = useState<string[]>([""]);

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isGovernment = user?.user?.role === "government";

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const { data, error } = await policyAPI.getAll();
            if (!error) {
                setPolicies(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch policies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPolicy = (role: string) => {
        setCurrentRole(role);
        setEditingPolicy(null);
        setSectionTitle("");
        const rolePolicies = policies.filter(p => p.role === role);
        setSectionNumber(rolePolicies.length + 1);
        setPolicyItems([""]);
        setIsEditorOpen(true);
    };

    const handleEditPolicy = (policy: PolicyItem) => {
        setCurrentRole(policy.role);
        setEditingPolicy(policy);
        setSectionTitle(policy.sectionTitle);
        setSectionNumber(policy.sectionNumber);
        setPolicyItems([...policy.policyItems]);
        setIsEditorOpen(true);
    };

    const handleSavePolicy = async () => {
        if (!sectionTitle.trim() || policyItems.filter(item => item.trim()).length === 0) {
            toast.error("Please provide section title and at least one policy item");
            return;
        }

        setSaving(true);
        try {
            const policyData = {
                role: currentRole,
                sectionTitle: sectionTitle.trim(),
                sectionNumber,
                policyItems: policyItems.filter(item => item.trim()),
            };

            if (editingPolicy) {
                const { error } = await policyAPI.update(editingPolicy._id, policyData);
                if (error) {
                    toast.error(error);
                } else {
                    toast.success("Policy updated successfully!");
                    setIsEditorOpen(false);
                    fetchPolicies();
                }
            } else {
                const { error } = await policyAPI.create(policyData);
                if (error) {
                    toast.error(error);
                } else {
                    toast.success("Policy created successfully!");
                    setIsEditorOpen(false);
                    fetchPolicies();
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save policy");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePolicy = async (policyId: string, sectionTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${sectionTitle}"?`)) return;

        try {
            const { error } = await policyAPI.delete(policyId);
            if (error) {
                toast.error(error);
            } else {
                toast.success("Policy deleted successfully!");
                fetchPolicies();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete policy");
        }
    };

    const addPolicyItem = () => {
        setPolicyItems([...policyItems, ""]);
    };

    const removePolicyItem = (index: number) => {
        setPolicyItems(policyItems.filter((_, i) => i !== index));
    };

    const updatePolicyItem = (index: number, value: string) => {
        const newItems = [...policyItems];
        newItems[index] = value;
        setPolicyItems(newItems);
    };

    const getRolePolicies = (role: string) => {
        return policies.filter(p => p.role === role).sort((a, b) => a.sectionNumber - b.sectionNumber);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "pharmacy": return <Building2 className="h-5 w-5 text-medicine" />;
            case "blood_bank": return <Heart className="h-5 w-5 text-blood" />;
            case "hospital": return <Building2 className="h-5 w-5 text-hospital" />;
            case "ngo": return <Users className="h-5 w-5 text-ngo" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const getRoleDisplayName = (role: string) => {
        return role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <DashboardLayout title="Policy & Rules" role={user?.user?.role || "User"} roleColor="government">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <Card className="mb-8 border-government/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-government/10">
                                <Shield className="h-6 w-6 text-government" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Healthcare System Policies & Guidelines</CardTitle>
                                <CardDescription>
                                    Official policies and operational guidelines for all healthcare stakeholders
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-government" />
                    </div>
                ) : (
                    <Tabs defaultValue="pharmacy" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="pharmacy" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Pharmacy
                            </TabsTrigger>
                            <TabsTrigger value="blood_bank" className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Blood Bank
                            </TabsTrigger>
                            <TabsTrigger value="hospital" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Hospital
                            </TabsTrigger>
                            <TabsTrigger value="ngo" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                NGO
                            </TabsTrigger>
                        </TabsList>

                        {["pharmacy", "blood_bank", "hospital", "ngo"].map((role) => (
                            <TabsContent key={role} value={role}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getRoleIcon(role)}
                                                <CardTitle>{getRoleDisplayName(role)} Operations & Guidelines</CardTitle>
                                            </div>
                                            {isGovernment && (
                                                <Button onClick={() => handleAddPolicy(role)} size="sm" className="bg-government hover:bg-government/90">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add New Policy
                                                </Button>
                                            )}
                                        </div>
                                        <CardDescription>Guidelines for {getRoleDisplayName(role).toLowerCase()} operations</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {getRolePolicies(role).length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No policies defined yet.</p>
                                        ) : (
                                            getRolePolicies(role).map((policy) => (
                                                <div key={policy._id}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                                            <Badge variant="outline">Section {policy.sectionNumber}</Badge>
                                                            {policy.sectionTitle}
                                                        </h3>
                                                        {isGovernment && (
                                                            <div className="flex gap-2">
                                                                <Button onClick={() => handleEditPolicy(policy)} size="sm" variant="outline">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button onClick={() => handleDeletePolicy(policy._id, policy.sectionTitle)} size="sm" variant="destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                                                        {policy.policyItems.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-government mt-1">•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}

                {/* Footer */}
                <Card className="mt-8 border-government/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <FileText className="h-5 w-5 text-government" />
                            <p>
                                <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString()} |
                                <span className="font-semibold ml-2">Version:</span> 2.0 |
                                <span className="font-semibold ml-2">Effective Date:</span> January 1, 2024
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            For questions or clarifications regarding these policies, please contact the Government Health Department.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Policy Editor Modal */}
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? "Edit Policy" : "Add New Policy"}</DialogTitle>
                        <DialogDescription>
                            {editingPolicy ? "Update the policy section" : "Create a new policy section"} for {getRoleDisplayName(currentRole)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="sectionTitle">Section Title</Label>
                            <Input
                                id="sectionTitle"
                                value={sectionTitle}
                                onChange={(e) => setSectionTitle(e.target.value)}
                                placeholder="e.g., Medicine Inventory Management"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sectionNumber">Section Number</Label>
                            <Input
                                id="sectionNumber"
                                type="number"
                                value={sectionNumber}
                                onChange={(e) => setSectionNumber(parseInt(e.target.value))}
                                min={1}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Policy Items</Label>
                                <Button onClick={addPolicyItem} size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {policyItems.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => updatePolicyItem(index, e.target.value)}
                                            placeholder="Enter policy item..."
                                        />
                                        {policyItems.length > 1 && (
                                            <Button onClick={() => removePolicyItem(index)} size="sm" variant="destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button onClick={() => setIsEditorOpen(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleSavePolicy} disabled={saving} className="bg-government hover:bg-government/90">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Policy"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Rules;
