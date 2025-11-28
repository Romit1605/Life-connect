import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { volunteerRequestAPI, volunteerAPI } from "@/services/api";
import { toast } from "sonner";

const VolunteerOpportunities = () => {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            console.log("Fetching volunteer opportunities...");
            const { data, error } = await volunteerRequestAPI.getAll({ status: "open" });
            console.log("Opportunities response:", { data, error });

            if (!error && data) {
                setOpportunities(data as any[]);
                console.log("Set opportunities:", data);
            } else {
                console.error("Error fetching opportunities:", error);
                toast.error(error || "Failed to fetch opportunities");
            }
        } catch (error: any) {
            console.error("Fetch exception:", error);
            toast.error(error.message || "Failed to fetch opportunities");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (campId: string, requestId: string) => {
        setApplying(requestId);
        try {
            const { error } = await volunteerAPI.apply({
                campId,
                applicationMessage: "I would like to volunteer for this camp.",
            });

            if (!error) {
                toast.success("Application submitted successfully!");
                fetchOpportunities();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application");
        } finally {
            setApplying(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            open: "bg-green-100 text-green-800",
            closed: "bg-gray-100 text-gray-800",
            fulfilled: "bg-blue-100 text-blue-800",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || styles.open}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <DashboardLayout title="Volunteer Opportunities" role={user?.user?.role || "Volunteer"} roleColor="volunteer">
            <div className="max-w-6xl mx-auto">
                <Card className="mb-8 border-volunteer/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-volunteer/10">
                                <Users className="h-6 w-6 text-volunteer" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Volunteer Opportunities</CardTitle>
                                <CardDescription>
                                    Browse and apply for volunteer positions at upcoming camps
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-volunteer" />
                    </div>
                ) : opportunities.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No volunteer opportunities available at the moment. Check back later!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {opportunities.map((opportunity) => (
                            <Card key={opportunity._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">
                                                {opportunity.camp?.name || "Camp"}
                                            </CardTitle>
                                            {getStatusBadge(opportunity.status)}
                                        </div>
                                        <Badge variant="outline" className="ml-2">
                                            {opportunity.volunteersNeeded} Needed
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(opportunity.camp?.date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{opportunity.camp?.location}</span>
                                        </div>

                                        {opportunity.deadline && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Apply by: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t">
                                            <p className="text-sm mb-2">
                                                <strong>Description:</strong>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {opportunity.description}
                                            </p>
                                        </div>

                                        {opportunity.requiredSkills && (
                                            <div>
                                                <p className="text-sm mb-1">
                                                    <strong>Required Skills:</strong>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {opportunity.requiredSkills}
                                                </p>
                                            </div>
                                        )}

                                        {opportunity.responsibilities && (
                                            <div>
                                                <p className="text-sm mb-1">
                                                    <strong>Responsibilities:</strong>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {opportunity.responsibilities}
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <Button
                                                onClick={() => handleApply(opportunity.camp._id, opportunity._id)}
                                                disabled={applying === opportunity._id}
                                                className="w-full bg-volunteer hover:bg-volunteer/90"
                                            >
                                                {applying === opportunity._id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Applying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Apply Now
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VolunteerOpportunities;
