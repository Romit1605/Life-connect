import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationAPI } from "@/services/api";
import { Notification } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NotificationsPopover = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await notificationAPI.getAll();
            if (error) {
                console.error("Failed to fetch notifications:", error);
            } else if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const { error } = await notificationAPI.markAsRead(id);
            if (error) {
                toast.error("Failed to mark as read");
            } else {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error("Error updating notification");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        setLoading(true);
        try {
            const { error } = await notificationAPI.markAllAsRead();
            if (error) {
                toast.error("Failed to mark all as read");
            } else {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, read: true }))
                );
                setUnreadCount(0);
                toast.success("All marked as read");
            }
        } catch (error) {
            toast.error("Error updating notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            onClick={handleMarkAllAsRead}
                            disabled={loading}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                                        !notification.read && "bg-muted/20"
                                    )}
                                    onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-1 h-2 w-2 rounded-full shrink-0",
                                            !notification.read ? "bg-primary" : "bg-transparent"
                                        )} />
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm", !notification.read && "font-medium")}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification._id);
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationsPopover;
