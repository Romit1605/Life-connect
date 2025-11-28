import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Heart, User, Download, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { certificateAPI } from "@/services/api";
import { toast } from "sonner";

const CertificatesList = () => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isNGO = user?.user?.role === "ngo";

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const { data, error } = isNGO
                ? await certificateAPI.getNGOCertificates()
                : await certificateAPI.getMyCertificates();

            if (!error && data) {
                setCertificates(data as any[]);
            } else {
                toast.error(error || "Failed to fetch certificates");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch certificates");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (certificateId: string) => {
        if (!confirm("Are you sure you want to delete this certificate?")) return;

        try {
            const { error } = await certificateAPI.delete(certificateId);
            if (!error) {
                toast.success("Certificate deleted successfully");
                fetchCertificates();
            } else {
                toast.error(error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete certificate");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getCampTitle = (campType: string) => {
        if (campType === 'blood') return 'Blood Donation Camp';
        if (campType === 'pharmacy') return 'Pharmacy Camp';
        return 'Blood Donation & Pharmacy Camp';
    };

    const CertificatePreview = ({ certificate }: { certificate: any }) => (
        <div className="bg-white rounded-lg shadow-2xl p-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 opacity-50 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200 to-red-200 opacity-50 rounded-full translate-x-16 translate-y-16"></div>

            {/* Border Design */}
            <div className="absolute inset-4 border-4 border-double border-blue-400 rounded-lg"></div>
            <div className="absolute inset-6 border-2 border-purple-300 rounded-lg"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                            <Award className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <h2 className="text-5xl font-bold text-gray-800 mb-2">
                        Certificate of Appreciation
                    </h2>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <Heart className="w-6 h-6" />
                            <span className="font-semibold">{getCampTitle(certificate.campType)}</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="text-center mb-8 px-8">
                    <p className="text-lg text-gray-700 mb-6">
                        This certificate is proudly presented to
                    </p>

                    <div className="mb-6">
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            {certificate.volunteerName}
                        </p>
                        <div className="h-1 w-64 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
                    </div>

                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
                        For their outstanding dedication and selfless service as a volunteer in our {getCampTitle(certificate.campType)}.
                        Their commitment to helping others and contributing <span className="font-bold text-blue-600">{certificate.hoursWorked} hours</span> of
                        volunteer service has made a significant impact on our community.
                    </p>

                    <div className="flex justify-center gap-8 text-gray-600 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span>{formatDate(certificate.startDate)}</span>
                        </div>
                        <span>to</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span>{formatDate(certificate.endDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end px-12 mt-12">
                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
                        <p className="font-semibold text-gray-700">{certificate.programDirector}</p>
                        <p className="text-sm text-gray-500">Health Services</p>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2">
                            {formatDate(certificate.issuedDate)}
                        </div>
                        <div className="w-24 h-24 border-4 border-blue-500 rounded-full flex items-center justify-center bg-blue-50">
                            <span className="text-xs font-bold text-blue-600">OFFICIAL<br />SEAL</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
                        <p className="font-semibold text-gray-700">{certificate.medicalCoordinator}</p>
                        <p className="text-sm text-gray-500">Camp Operations</p>
                    </div>
                </div>

                {/* Certificate ID */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-400">
                        Certificate ID: {certificate.certificateId}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout title="Certificates" role={user?.user?.role || "User"} roleColor={isNGO ? "ngo" : "donor"}>
            <div className="max-w-6xl mx-auto">
                <Card className="mb-8 border-ngo/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ngo/10">
                                <Award className="h-6 w-6 text-ngo" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">
                                    {isNGO ? "Generated Certificates" : "My Certificates"}
                                </CardTitle>
                                <CardDescription>
                                    {isNGO
                                        ? "View all certificates generated for volunteers"
                                        : "View all your volunteer certificates"
                                    }
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-ngo" />
                    </div>
                ) : certificates.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No certificates found
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {certificates.map((certificate) => (
                            <Card key={certificate._id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">
                                                {certificate.volunteerName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <strong>Camp:</strong> {certificate.campName}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <strong>Type:</strong> {getCampTitle(certificate.campType)}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <strong>Hours:</strong> {certificate.hoursWorked} hours
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <strong>Issued:</strong> {formatDate(certificate.issuedDate)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setSelectedCertificate(certificate)}
                                                variant="outline"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            {isNGO && (
                                                <Button
                                                    onClick={() => handleDelete(certificate._id)}
                                                    variant="destructive"
                                                    size="icon"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {selectedCertificate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-lg max-w-5xl w-full my-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Certificate Preview</h2>
                                <Button onClick={() => setSelectedCertificate(null)} variant="outline">
                                    Close
                                </Button>
                            </div>
                            <CertificatePreview certificate={selectedCertificate} />
                            <div className="text-center mt-6 text-gray-600">
                                <p className="text-sm">
                                    💡 Tip: Use your browser's print function (Ctrl+P / Cmd+P) to save or print this certificate.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CertificatesList;
