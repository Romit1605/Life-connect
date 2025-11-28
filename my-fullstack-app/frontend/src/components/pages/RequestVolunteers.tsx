import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { volunteerRequestAPI, campAPI } from "@/services/api";
import { toast } from "sonner";

const RequestVolunteers = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [camps, setCamps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        campId: "",
        volunteersNeeded: "",
        description: "",
        requiredSkills: "",
        responsibilities: "",
        deadline: "",
    });

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("=== FETCHING DATA ===");
            const [requestsResponse, campsResponse] = await Promise.all([
                volunteerRequestAPI.getMyRequests(),
                campAPI.getAll(),
            ]);

            console.log("Requests response:", requestsResponse);
            console.log("Camps response:", campsResponse);

            if (!requestsResponse.error && requestsResponse.data) {
                setRequests(requestsResponse.data as any[]);
            }

            if (!campsResponse.error && campsResponse.data) {
                const allCampsData = campsResponse.data as any[];
                console.log("Total camps from API:", allCampsData.length);
                console.log("All camps data:", allCampsData);

                const currentUser = user?.user?._id || user?._id;
                console.log("Current user ID:", currentUser);
                console.log("User object:", user);

                // Filter camps organized by current user
                const myCamps = allCampsData.filter((camp: any) => {
                    const organizerId = camp.organizer?._id || camp.organizer;
                    console.log(`Camp: ${camp.name}, Organizer ID: ${organizerId}, Match: ${String(organizerId) === String(currentUser)}`);
                    return String(organizerId) === String(currentUser);
                });

                console.log("Filtered my camps:", myCamps.length);
                console.log("My camps data:", myCamps);

                setCamps(myCamps);

                if (myCamps.length === 0) {
                    toast.info(`No camps found for user ${currentUser}. Total camps in DB: ${allCampsData.length}`);
                } else {
                    toast.success(`Found ${myCamps.length} camp(s)`);
                }
            } else {
                console.error("Camps error:", campsResponse.error);
                toast.error(campsResponse.error || "Failed to fetch camps");
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast.error(error.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.campId || !formData.volunteersNeeded || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setProcessing(true);
        try {
            const { error } = await volunteerRequestAPI.create({
                ...formData,
                volunteersNeeded: parseInt(formData.volunteersNeeded),
            });

            if (!error) {
                toast.success("Volunteer request posted successfully!");
                setIsDialogOpen(false);
                resetForm();
                fetchData();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create request");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (requestId: string) => {
        if (!confirm("Are you sure you want to delete this volunteer request?")) return;

        try {
            const { error } = await volunteerRequestAPI.delete(requestId);
            if (!error) {
                toast.success("Request deleted successfully");
                fetchData();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete request");
        }
    };

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        try {
            const { error } = await volunteerRequestAPI.update(requestId, { status: newStatus });
            if (!error) {
                toast.success(`Request marked as ${newStatus}`);
                fetchData();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const resetForm = () => {
        setFormData({
            campId: "",
            volunteersNeeded: "",
            description: "",
            requiredSkills: "",
            responsibilities: "",
            deadline: "",
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            open: "bg-green-100 text-green-800",
            closed: "bg-gray-100 text-gray-800",
            fulfilled: "bg-blue-100 text-blue-800",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.open}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <DashboardLayout title="Request Volunteers" role={user?.user?.role || "NGO"} roleColor="ngo">
            <div className="max-w-6xl mx-auto">
                <Card className="mb-8 border-ngo/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                                    <Users className="h-6 w-6 text-ngo" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Volunteer Requests</CardTitle>
                                    <CardDescription>
                                        Post volunteer opportunities for your upcoming camps
                                    </CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-ngo hover:bg-ngo/90">
                                <Plus className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-ngo" />
                    </div>
                ) : requests.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No volunteer requests yet. Create one to get started!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <Card key={request._id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {request.camp?.name || "Unknown Camp"}
                                                </h3>
                                                {getStatusBadge(request.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <strong>Volunteers Needed:</strong> {request.volunteersNeeded}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <strong>Camp Date:</strong> {new Date(request.camp?.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <strong>Location:</strong> {request.camp?.location}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <strong>Description:</strong> {request.description}
                                            </p>
                                            {request.requiredSkills && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    <strong>Required Skills:</strong> {request.requiredSkills}
                                                </p>
                                            )}
                                            {request.responsibilities && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    <strong>Responsibilities:</strong> {request.responsibilities}
                                                </p>
                                            )}
                                            {request.deadline && (
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Deadline:</strong> {new Date(request.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {request.status === "open" && (
                                                <>
                                                    <Button
                                                        onClick={() => handleStatusChange(request._id, "fulfilled")}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Mark Fulfilled
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStatusChange(request._id, "closed")}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Close
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                onClick={() => handleDelete(request._id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Request Volunteers</DialogTitle>
                        <DialogDescription>
                            Post a volunteer opportunity for one of your upcoming camps
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="campId">Select Camp *</Label>
                            <select
                                id="campId"
                                value={formData.campId}
                                onChange={(e) => setFormData({ ...formData, campId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ngo focus:border-transparent"
                            >
                                <option value="">Select a camp</option>
                                {camps.map((camp) => (
                                    <option key={camp._id} value={camp._id}>
                                        {camp.name} - {new Date(camp.date).toLocaleDateString()} - {camp.location}
                                    </option>
                                ))}
                            </select>
                            {camps.length === 0 && (
                                <p className="text-sm text-red-500 mt-2">
                                    No camps available. Please create a camp first or check browser console for debugging info.
                                </p>
                            )}
                        </div>

                        {/* Selected Camp Details */}
                        {formData.campId && camps.find(c => c._id === formData.campId) && (
                            <div className="p-4 bg-ngo/5 border border-ngo/20 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm">Selected Camp Details:</h4>
                                {(() => {
                                    const selectedCamp = camps.find(c => c._id === formData.campId);
                                    return (
                                        <div className="text-sm space-y-1">
                                            <p><strong>Name:</strong> {selectedCamp?.name}</p>
                                            <p><strong>Date:</strong> {new Date(selectedCamp?.date).toLocaleDateString()}</p>
                                            <p><strong>Location:</strong> {selectedCamp?.location}</p>
                                            <p><strong>Status:</strong> {selectedCamp?.status}</p>
                                            {selectedCamp?.description && (
                                                <p><strong>Description:</strong> {selectedCamp?.description}</p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="volunteersNeeded">Number of Volunteers Needed *</Label>
                            <Input
                                id="volunteersNeeded"
                                type="number"
                                value={formData.volunteersNeeded}
                                onChange={(e) => setFormData({ ...formData, volunteersNeeded: e.target.value })}
                                placeholder="e.g., 10"
                                min="1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the volunteer opportunity..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="requiredSkills">Required Skills (Optional)</Label>
                            <Textarea
                                id="requiredSkills"
                                value={formData.requiredSkills}
                                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                                placeholder="List any required skills..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="responsibilities">Responsibilities (Optional)</Label>
                            <Textarea
                                id="responsibilities"
                                value={formData.responsibilities}
                                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                placeholder="Describe volunteer responsibilities..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="deadline">Application Deadline (Optional)</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button onClick={() => { setIsDialogOpen(false); resetForm(); }} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing} className="bg-ngo hover:bg-ngo/90">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Post Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default RequestVolunteers;
