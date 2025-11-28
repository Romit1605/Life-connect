import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, CheckCircle, XCircle, Clock, Award, Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { volunteerAPI, certificateAPI } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ManageVolunteers = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
    const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);
    const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
    const [hoursWorked, setHoursWorked] = useState("");
    const [certificateData, setCertificateData] = useState({
        campType: "blood",
        programDirector: "",
        medicalCoordinator: "",
    });
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data, error } = await volunteerAPI.getApplications();
            if (!error && data) {
                setApplications(data as any[]);
            } else {
                toast.error(error || "Failed to fetch applications");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId: string) => {
        setProcessing(true);
        try {
            const { error } = await volunteerAPI.approve(applicationId);
            if (!error) {
                toast.success("Volunteer application approved!");
                fetchApplications();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to approve application");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (applicationId: string) => {
        const reason = prompt("Please provide a reason for rejection:");
        if (reason === null) return;

        setProcessing(true);
        try {
            const { error } = await volunteerAPI.reject(applicationId, reason);
            if (!error) {
                toast.success("Volunteer application rejected");
                fetchApplications();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to reject application");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateHours = async () => {
        if (!selectedApplication || !hoursWorked) {
            toast.error("Please enter hours worked");
            return;
        }

        setProcessing(true);
        try {
            const { error } = await volunteerAPI.updateHours(selectedApplication._id, parseInt(hoursWorked));
            if (!error) {
                toast.success("Hours updated successfully!");
                setIsHoursDialogOpen(false);
                setHoursWorked("");
                fetchApplications();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update hours");
        } finally {
            setProcessing(false);
        }
    };

    const handleGenerateCertificate = async () => {
        if (!selectedApplication) return;

        setProcessing(true);
        try {
            const { error } = await certificateAPI.generate({
                volunteerId: selectedApplication.volunteer._id,
                campId: selectedApplication.camp._id,
                campType: certificateData.campType,
                programDirector: certificateData.programDirector || "Program Director",
                medicalCoordinator: certificateData.medicalCoordinator || "Medical Coordinator",
            });

            if (!error) {
                toast.success("Certificate generated successfully!");
                setIsCertificateDialogOpen(false);
                setCertificateData({
                    campType: "blood",
                    programDirector: "",
                    medicalCoordinator: "",
                });
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to generate certificate");
        } finally {
            setProcessing(false);
        }
    };

    const getFilteredApplications = (status: string) => {
        return applications.filter(app => app.status === status);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-500">Approved</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <DashboardLayout title="Manage Volunteers" role={user?.user?.role || "NGO"} roleColor="ngo">
            <div className="max-w-6xl mx-auto">
                <Card className="mb-8 border-ngo/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                                <Users className="h-6 w-6 text-ngo" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Volunteer Management</CardTitle>
                                <CardDescription>
                                    Review and manage volunteer applications for your camps
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-ngo" />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="pending" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending ({getFilteredApplications("pending").length})
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Approved ({getFilteredApplications("approved").length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Rejected ({getFilteredApplications("rejected").length})
                            </TabsTrigger>
                        </TabsList>

                        {["pending", "approved", "rejected"].map((status) => (
                            <TabsContent key={status} value={status}>
                                <div className="space-y-4">
                                    {status === "approved" && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-3">
                                            <div className="mt-1">
                                                <Info className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-blue-800">Certificate Generation Workflow</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    To generate a certificate:
                                                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                                                        <li>Wait for the camp to be completed.</li>
                                                        <li>Click <strong>Update Hours</strong> to record volunteer's service time.</li>
                                                        <li>Click <strong>Generate Certificate</strong> once hours are logged.</li>
                                                    </ol>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {getFilteredApplications(status).length === 0 ? (
                                        <Card>
                                            <CardContent className="py-12 text-center text-muted-foreground">
                                                No {status} applications found
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        getFilteredApplications(status).map((application) => {
                                            const isCampCompleted = application.camp?.status === "completed" || new Date(application.camp?.date) < new Date();
                                            const isHoursMarked = application.attendanceMarked;
                                            const canGenerateCertificate = isCampCompleted && isHoursMarked;

                                            return (
                                                <Card key={application._id}>
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="font-semibold text-lg">
                                                                        {application.volunteer?.full_name || "Unknown Volunteer"}
                                                                    </h3>
                                                                    {getStatusBadge(application.status)}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    <strong>Camp:</strong> {application.camp?.name || "Unknown Camp"}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    <strong>Date:</strong> {new Date(application.camp?.date).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    <strong>Location:</strong> {application.camp?.location}
                                                                </p>
                                                                {application.skills && (
                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                        <strong>Skills:</strong> {application.skills}
                                                                    </p>
                                                                )}
                                                                {application.applicationMessage && (
                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                        <strong>Message:</strong> {application.applicationMessage}
                                                                    </p>
                                                                )}
                                                                {application.status === "approved" && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        <strong>Hours Worked:</strong> {application.hoursWorked || 0} hours
                                                                        {application.attendanceMarked && " ✓"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {application.status === "pending" && (
                                                                    <>
                                                                        <Button
                                                                            onClick={() => handleApprove(application._id)}
                                                                            disabled={processing}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleReject(application._id)}
                                                                            disabled={processing}
                                                                            variant="destructive"
                                                                        >
                                                                            <XCircle className="h-4 w-4 mr-2" />
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {application.status === "approved" && (
                                                                    <>
                                                                        <Button
                                                                            onClick={() => {
                                                                                setSelectedApplication(application);
                                                                                setHoursWorked(application.hoursWorked?.toString() || "");
                                                                                setIsHoursDialogOpen(true);
                                                                            }}
                                                                            variant="outline"
                                                                            disabled={!isCampCompleted}
                                                                            title={!isCampCompleted ? "Camp must be completed first" : "Update hours worked"}
                                                                        >
                                                                            <Clock className="h-4 w-4 mr-2" />
                                                                            Update Hours
                                                                        </Button>

                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span tabIndex={0} className="w-full">
                                                                                        <Button
                                                                                            onClick={() => {
                                                                                                setSelectedApplication(application);
                                                                                                setIsCertificateDialogOpen(true);
                                                                                            }}
                                                                                            className="bg-ngo hover:bg-ngo/90 w-full"
                                                                                            disabled={!canGenerateCertificate}
                                                                                        >
                                                                                            <Award className="h-4 w-4 mr-2" />
                                                                                            Generate Certificate
                                                                                        </Button>
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                {!canGenerateCertificate && (
                                                                                    <TooltipContent>
                                                                                        <p>
                                                                                            {!isCampCompleted
                                                                                                ? "Camp must be completed first"
                                                                                                : "Update hours and mark attendance first"}
                                                                                        </p>
                                                                                    </TooltipContent>
                                                                                )}
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}

                <div className="mt-6 flex justify-end">
                    <Button onClick={() => navigate("/ngo/certificates")} variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        View All Certificates
                    </Button>
                </div>
            </div>

            {/* Update Hours Dialog */}
            <Dialog open={isHoursDialogOpen} onOpenChange={setIsHoursDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Volunteer Hours</DialogTitle>
                        <DialogDescription>
                            Enter the total hours worked by {selectedApplication?.volunteer?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="hours">Hours Worked</Label>
                            <Input
                                id="hours"
                                type="number"
                                value={hoursWorked}
                                onChange={(e) => setHoursWorked(e.target.value)}
                                placeholder="Enter hours"
                                min="0"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsHoursDialogOpen(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateHours} disabled={processing} className="bg-ngo hover:bg-ngo/90">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Hours
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Generate Certificate Dialog */}
            <Dialog open={isCertificateDialogOpen} onOpenChange={setIsCertificateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Certificate</DialogTitle>
                        <DialogDescription>
                            Generate a certificate for {selectedApplication?.volunteer?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="campType">Camp Type</Label>
                            <select
                                id="campType"
                                value={certificateData.campType}
                                onChange={(e) => setCertificateData({ ...certificateData, campType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ngo focus:border-transparent"
                            >
                                <option value="blood">Blood Donation Camp</option>
                                <option value="pharmacy">Pharmacy Camp</option>
                                <option value="both">Blood Donation & Pharmacy Camp</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="programDirector">Program Director (Optional)</Label>
                            <Input
                                id="programDirector"
                                value={certificateData.programDirector}
                                onChange={(e) => setCertificateData({ ...certificateData, programDirector: e.target.value })}
                                placeholder="Program Director"
                            />
                        </div>
                        <div>
                            <Label htmlFor="medicalCoordinator">Medical Coordinator (Optional)</Label>
                            <Input
                                id="medicalCoordinator"
                                value={certificateData.medicalCoordinator}
                                onChange={(e) => setCertificateData({ ...certificateData, medicalCoordinator: e.target.value })}
                                placeholder="Medical Coordinator"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsCertificateDialogOpen(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleGenerateCertificate} disabled={processing} className="bg-ngo hover:bg-ngo/90">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Generate Certificate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default ManageVolunteers;
