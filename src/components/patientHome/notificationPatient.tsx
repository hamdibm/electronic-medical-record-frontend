"use client"

import { useEffect, useState } from "react"
import { Bell, X, MessageSquare, AlertCircle, CheckCircle, FileText, Calendar, Check, XCircle } from "lucide-react"
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
import { getDecodedToken, UserRole } from "@/lib/jwtUtils"
import { newSocket } from "@/lib/socket"
import { grantAccessForDoctor} from "@/assets/data/records"
import { toast } from "sonner"

export type NotificationType =
  | "error"
  | "warning"
  | "success"
  | "info"
  | "comment"
  | "appointment"
  | "document"
  | "request"

export type Notification = {
  id: string
  type: NotificationType
  message: string
  description?: string
  time: string
  read: boolean
  senderId?: string // ID de l'expéditeur (doctorId pour les demandes d'accès)
  receiverId?: string // ID du destinataire (patientId pour les demandes d'accès)
  actionRequired?: boolean // Indique si une action est requise (pour les demandes d'accès)
  recordId?: string // ID du dossier concerné (pour les demandes d'accès)
}

// Fonction pour récupérer les notifications d'un utilisateur
const getNotificationsByUser = async (userId: string): Promise<Notification[]> => {
  try {
    // Remplacer par un appel API réel
    const response = await fetch(`/api/notifications/getNotifications${userId}`)

    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching notifications:", error)

    // Retourner un tableau vide en cas d'erreur
    return []
  }
}

export function NotificationsPatient() {
  const [open, setOpen] = useState(false)
  const [notificationsList, setNotificationsList] = useState<Notification[]>([])
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({}) // Pour suivre l'état de traitement par notification

  useEffect(() => {
    const token = getDecodedToken(UserRole.PATIENT)
    const patientId = token?.userId

    if (!patientId) {
      console.error("Patient ID not found in token")
      return
    }

    if (!newSocket.connected) {
      console.warn("WebSocket is not connected. Reconnecting...")
      newSocket.connect()
    }

    const fetchNotifications = async () => {
      try {
        const notifications = await getNotificationsByUser(patientId)
        setNotificationsList(notifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Écouter les nouvelles notifications pour le patient
    newSocket.on("notify-patient", (data) => {
      try {
        console.log("Notification reçue:", data)
        handleNotificationUpdate(data.notif)
      } catch (error) {
        console.error("Error handling notify-patient event:", error)
      }
    })

    return () => {
      newSocket.off("notify-patient")
    }
  }, [])

  const handleNotificationUpdate = (notif: Notification) => {
    // Ajouter la nouvelle notification au début de la liste
    setNotificationsList((prevNotifications) => [notif, ...prevNotifications])

    // Si c'est une demande d'accès, afficher un toast
    if (notif.type === "request" && notif.actionRequired) {
      toast(`Nouvelle demande d'accès: ${notif.description}`)
    }
  }

  const unreadCount = notificationsList.filter((notification) => !notification.read).length

  const markAsRead = (id: string) => {
    setNotificationsList(
      notificationsList.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
    newSocket.emit("markAsRead", { notificationId: id })
  }

  const markAllAsRead = () => {
    const token = getDecodedToken(UserRole.PATIENT)
    const patientId = token?.userId

    if (!patientId) {
      console.error("Patient ID not found in token")
      return
    }

    setNotificationsList(notificationsList.map((notification) => ({ ...notification, read: true })))
    newSocket.emit("markAllAsRead", { userId: patientId })
  }

  // Fonction pour gérer l'acceptation d'une demande d'accès
  const handleAcceptRequest = async (notification: Notification) => {
    const token = getDecodedToken(UserRole.PATIENT)
    const patientId = token?.userId

    if (!patientId) {
      console.error("Patient ID not found in token")
      return
    }

    if (!notification.senderId || !notification.recordId) {
      toast("Information manquante pour traiter cette demande")
      return
    }

    setIsProcessing({ ...isProcessing, [notification.id]: true })

    try {
      // 1. Envoyer la réponse au serveur via Socket.io
      newSocket.emit("patient-response", {
        patientId: patientId,
        doctorId: notification.senderId,
        accepted: true,
      })

      // 2. Accorder l'accès au médecin via l'API
      await grantAccessForDoctor(notification.recordId, notification.senderId)

      // 3. Mettre à jour la notification
      setNotificationsList(
        notificationsList.map((notif) =>
          notif.id === notification.id
            ? {
                ...notif,
                read: true,
                actionRequired: false,
                type: "success",
                description: `Vous avez accordé l'accès au Dr. ${notification.senderId} pour le dossier ${notification.recordId}.`,
              }
            : notif,
        ),
      )

      toast(`Accès accordé au Dr. ${notification.senderId}`)
    } catch (error) {
      console.error("Error accepting access request:", error)
      toast("Erreur lors de l'acceptation de la demande d'accès")
    } finally {
      setIsProcessing({ ...isProcessing, [notification.id]: false })
    }
  }

  // Fonction pour gérer le rejet d'une demande d'accès
  const handleRejectRequest = async (notification: Notification) => {
    const token = getDecodedToken(UserRole.PATIENT)
    const patientId = token?.userId

    if (!patientId) {
      console.error("Patient ID not found in token")
      return
    }

    if (!notification.senderId) {
      toast("Information manquante pour traiter cette demande")
      return
    }

    setIsProcessing({ ...isProcessing, [notification.id]: true })

    try {
      // Envoyer la réponse au serveur via Socket.io
      newSocket.emit("patient-response", {
        patientId: patientId,
        doctorId: notification.senderId,
        accepted: false,
      })

      // Mettre à jour la notification
      setNotificationsList(
        notificationsList.map((notif) =>
          notif.id === notification.id
            ? {
                ...notif,
                read: true,
                actionRequired: false,
                type: "error",
                description: `Vous avez refusé l'accès au Dr. ${notification.senderId}.`,
              }
            : notif,
        ),
      )

      toast(`Demande d'accès refusée`)
    } catch (error) {
      console.error("Error rejecting access request:", error)
      toast("Erreur lors du rejet de la demande d'accès")
    } finally {
      setIsProcessing({ ...isProcessing, [notification.id]: false })
    }
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
      case "request":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
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
      case "request":
        return "bg-amber-50 border-amber-100"
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
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup>
            {notificationsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notificationsList.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-0 focus:bg-transparent ${
                    !notification.read && !notification.actionRequired ? "cursor-pointer" : ""
                  }`}
                  onSelect={notification.actionRequired ? undefined : () => markAsRead(notification.id)}
                >
                  <div
                    className={`w-full border-l-4 ${
                      !notification.read
                        ? `border-l-${notification.type === "error" ? "red" : notification.type === "comment" ? "indigo" : notification.type === "request" ? "amber" : "blue"}-500`
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

                        {/* Boutons d'action pour les demandes d'accès */}
                        {notification.actionRequired && notification.type === "request" && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 bg-white text-xs flex items-center gap-1"
                              onClick={() => handleRejectRequest(notification)}
                              disabled={isProcessing[notification.id]}
                            >
                              <XCircle className="h-3 w-3" />
                              Refuser
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs flex items-center gap-1"
                              onClick={() => handleAcceptRequest(notification)}
                              disabled={isProcessing[notification.id]}
                            >
                              <Check className="h-3 w-3" />
                              Accepter
                            </Button>
                          </div>
                        )}
                      </div>
                      {!notification.read && !notification.actionRequired && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
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
            Voir toutes les notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}