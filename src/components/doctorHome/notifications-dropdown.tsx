"use client"

import { useState } from "react"
import { Bell, X, MessageSquare, AlertCircle, CheckCircle, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

type NotificationType = "error" | "warning" | "success" | "info" | "comment" | "appointment" | "document"

type Notification = {
  id: string
  type: NotificationType
  message: string
  description?: string
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "error",
    message: "Patient John Smith rejected your request",
    description: "Consultation request for cardiac evaluation",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    message: "Dr. Sarah Chen added a comment to your case",
    description: "Case #MED-2023-1234: Unusual Cardiac Symptoms",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    message: "Lab results are now available",
    description: "Patient: Maria Garcia - Blood work results",
    time: "30 minutes ago",
    read: false,
  },
  {
    id: "4",
    type: "appointment",
    message: "Upcoming consultation in 1 hour",
    description: "With Dr. James Wilson - Cardiology Department",
    time: "45 minutes ago",
    read: true,
  },
  {
    id: "5",
    type: "document",
    message: "New medical record uploaded",
    description: "ECG Report for Patient: John Smith",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "6",
    type: "warning",
    message: "Medication interaction alert",
    description: "Patient: Robert Johnson - Potential adverse reaction",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "7",
    type: "info",
    message: "System maintenance scheduled",
    description: "MedCollab will be down for updates on Sunday, 2AM-4AM",
    time: "1 day ago",
    read: true,
  },
]

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [notificationsList, setNotificationsList] = useState<Notification[]>(notifications)

  const unreadCount = notificationsList.filter((notification) => !notification.read).length

  const markAsRead = (id: string) => {
    setNotificationsList(
      notificationsList.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "document":
        return <FileText className="h-4 w-4 text-cyan-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-100"
      case "warning":
        return "bg-amber-50 border-amber-100"
      case "success":
        return "bg-green-50 border-green-100"
      case "info":
        return "bg-blue-50 border-blue-100"
      case "comment":
        return "bg-indigo-50 border-indigo-100"
      case "appointment":
        return "bg-purple-50 border-purple-100"
      case "document":
        return "bg-cyan-50 border-cyan-100"
      default:
        return "bg-gray-50 border-gray-100"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup>
            {notificationsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notificationsList.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-0 focus:bg-transparent ${
                    !notification.read ? "cursor-pointer" : ""
                  }`}
                  onSelect={() => markAsRead(notification.id)}
                >
                  <div
                    className={`w-full border-l-4 ${
                      !notification.read
                        ? `border-l-${notification.type === "error" ? "red" : notification.type === "comment" ? "indigo" : "blue"}-500`
                        : "border-l-transparent"
                    } ${getNotificationColor(notification.type)} p-3 ${!notification.read ? "" : "opacity-70"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${!notification.read ? "" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                        {notification.description && (
                          <p className="mt-1 text-xs text-gray-500">{notification.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="h-[1px]" />
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}