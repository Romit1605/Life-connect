import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Info,
  X
} from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = {
    all: [
      {
        id: 1,
        type: "alert",
        title: "Critical Blood Stock Alert",
        message: "O- blood type reaching critical levels (< 5 units)",
        time: "5 min ago",
        read: false,
        severity: "high"
      },
      {
        id: 2,
        type: "approval",
        title: "Camp Request Approved",
        message: "Your medical camp request for Downtown has been approved by the government",
        time: "1 hour ago",
        read: false,
        severity: "medium"
      },
      {
        id: 3,
        type: "expiry",
        title: "Medicine Expiry Warning",
        message: "15 medicine batches expiring within 30 days",
        time: "2 hours ago",
        read: true,
        severity: "medium"
      },
      {
        id: 4,
        type: "request",
        title: "New Blood Request",
        message: "Emergency request for A+ blood from City Hospital",
        time: "3 hours ago",
        read: true,
        severity: "high"
      },
      {
        id: 5,
        type: "info",
        title: "System Update",
        message: "New features added to the dashboard",
        time: "1 day ago",
        read: true,
        severity: "low"
      }
    ],
    alerts: [],
    requests: [],
    approvals: []
  };

  // Filter notifications by category
  notifications.alerts = notifications.all.filter(n => n.type === "alert" || n.type === "expiry");
  notifications.requests = notifications.all.filter(n => n.type === "request");
  notifications.approvals = notifications.all.filter(n => n.type === "approval");

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
      case "expiry":
        return <AlertTriangle className="h-5 w-5 text-alertOrange" />;
      case "approval":
        return <CheckCircle className="h-5 w-5 text-ngo" />;
      case "request":
        return <Clock className="h-5 w-5 text-medicine" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-alertRed/10 border-alertRed/20";
      case "medium":
        return "bg-alertOrange/10 border-alertOrange/20";
      default:
        return "bg-alertYellow/10 border-alertYellow/20";
    }
  };

  const handleDismiss = (id: number) => {
    toast.success("Notification dismissed");
  };

  const handleMarkAllRead = () => {
    toast.success("All notifications marked as read");
  };

  const NotificationList = ({ items }: { items: typeof notifications.all }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications in this category</p>
          </CardContent>
        </Card>
      ) : (
        items.map((notification) => (
          <Card 
            key={notification.id} 
            className={`border transition-all ${
              notification.read ? "border-border/50" : getSeverityColor(notification.severity)
            }`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 pt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => handleDismiss(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with alerts and requests</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All ({notifications.all.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts ({notifications.alerts.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({notifications.requests.length})
            </TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals ({notifications.approvals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationList items={notifications.all} />
          </TabsContent>

          <TabsContent value="alerts">
            <NotificationList items={notifications.alerts} />
          </TabsContent>

          <TabsContent value="requests">
            <NotificationList items={notifications.requests} />
          </TabsContent>

          <TabsContent value="approvals">
            <NotificationList items={notifications.approvals} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
