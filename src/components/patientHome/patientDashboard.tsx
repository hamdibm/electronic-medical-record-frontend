"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Bell,
  Calendar,
  FileText,
  Heart,
  LinkIcon,
  Plus,
  TestTube,
  User,
  Users,
  Activity,
  Brain,
  TreesIcon as Lungs,
  X,
  MessageSquare,
} from "lucide-react"
import { fetchPatientDashboardData, grantAccessToDoctor, revokeAccessFromDoctor } from "../../services/fabricApi"
import { toast } from "sonner"

interface MedicalRecord {
  type: string
  speciality: string
  doctorID: string
  id?: string
  notes?: string
}

interface PatientDashboardData {
  patientId: string
  patientName: string
  age: string
  gender: string
  phoneNumber: string
  data: MedicalRecord[]
  accessList: string[]
  recordIds?: string[]
}

interface JwtPayload {
  userId: string
  role: string
  exp: number
  iat: number
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading: boolean
}

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  description: string
  time: string
  read: boolean
}

// Composant de dialogue de confirmation
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, isLoading }: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Yes, Revoke Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Icônes pour les différentes spécialités
const specialtyIcons: Record<string, React.ReactNode> = {
  Cardiology: <Heart className="h-4 w-4 text-rose-500" />,
  Endocrinology: <Activity className="h-4 w-4 text-green-500" />,
  "Internal Medicine": <FileText className="h-4 w-4 text-blue-500" />,
  Neurology: <Brain className="h-4 w-4 text-purple-500" />,
  Pulmonology: <Lungs className="h-4 w-4 text-cyan-500" />,
  General: <FileText className="h-4 w-4 text-gray-500" />,
}

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false)
  const [showRevokeDoctorForm, setShowRevokeDoctorForm] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [doctorId, setDoctorId] = useState("")
  const [recordId, setRecordId] = useState("")
  const [doctorToRevoke, setDoctorToRevoke] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [pendingRevokeData, setPendingRevokeData] = useState<{ recordId: string; doctorId: string } | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All Specialties")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const decoded: any = jwtDecode(token)

        const patientId = decoded.userId

        if (decoded.role !== "patient") throw new Error("Unauthorized role")

        const response = await fetchPatientDashboardData(patientId)

        // S'assurer que patientId est défini dans la réponse
        if (response) {
          // Si patientId n'est pas défini ou est un tableau vide, utiliser l'ID du token
          if (!response.patientId || (Array.isArray(response.patientId) && response.patientId.length === 0)) {
            response.patientId = patientId
          } else if (Array.isArray(response.patientId)) {
            // Si c'est un tableau, prendre le premier élément
            response.patientId = response.patientId[0]
          }
        }

        setDashboardData(response)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const refreshDashboard = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const decoded: any = jwtDecode(token)
      const patientId = decoded.userId

      const response = await fetchPatientDashboardData(patientId)

      // S'assurer que patientId est défini dans la réponse
      if (response) {
        // Si patientId n'est pas défini ou est un tableau vide, utiliser l'ID du token
        if (!response.patientId || (Array.isArray(response.patientId) && response.patientId.length === 0)) {
          response.patientId = patientId
        } else if (Array.isArray(response.patientId)) {
          // Si c'est un tableau, prendre le premier élément
          response.patientId = response.patientId[0]
        }
      }

      setDashboardData(response)
    } catch (err: any) {
      console.error("Error refreshing dashboard data:", err)
      toast.error("Failed to refresh dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Appel à la fonction grantAccess du smart contract via l'API
      await grantAccessToDoctor(recordId, doctorId)

      // Afficher un message de succès
      toast.success(`Doctor ${doctorId} now has access to record ${recordId}`)

      // Réinitialiser le formulaire
      setDoctorId("")
      setRecordId("")
      setShowAddDoctorForm(false)

      // Rafraîchir les données du tableau de bord
      await refreshDashboard()
    } catch (error: any) {
      console.error("Error granting access:", error)
      toast.error(error.message || "Failed to grant access to doctor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openRevokeDialog = (doctorId: string) => {
    setDoctorToRevoke(doctorId)
    setRecordId("") // Réinitialiser le recordId
    setShowRevokeDoctorForm(true)
  }

  // Fonction pour préparer la révocation et afficher la confirmation
  const prepareRevokeAccess = (e: React.FormEvent) => {
    e.preventDefault()

    // Stocker les données de révocation en attente
    setPendingRevokeData({
      recordId: recordId,
      doctorId: doctorToRevoke,
    })

    // Fermer le formulaire de révocation et ouvrir la confirmation
    setShowRevokeDoctorForm(false)
    setShowConfirmationDialog(true)
  }

  // Fonction pour annuler la confirmation
  const cancelConfirmation = () => {
    setShowConfirmationDialog(false)
    setPendingRevokeData(null)
    // Réouvrir le formulaire de révocation si nécessaire
    // setShowRevokeDoctorForm(true)
  }

  // Fonction pour effectuer la révocation après confirmation
  const confirmRevokeAccess = async () => {
    if (!pendingRevokeData) return

    setIsRevoking(true)

    try {
      // Appel à la fonction revokeAccess du smart contract via l'API
      await revokeAccessFromDoctor(pendingRevokeData.recordId, pendingRevokeData.doctorId)

      // Afficher un message de succès
      toast.success(`Doctor ${pendingRevokeData.doctorId} no longer has access to record ${pendingRevokeData.recordId}`)

      // Réinitialiser les états
      setRecordId("")
      setDoctorToRevoke("")
      setPendingRevokeData(null)
      setShowConfirmationDialog(false)

      // Rafraîchir les données du tableau de bord
      await refreshDashboard()
    } catch (error: any) {
      console.error("Error revoking access:", error)
      toast.error(error.message || "Failed to revoke access from doctor")
    } finally {
      setIsRevoking(false)
    }
  }

  // Fonction pour obtenir les spécialités uniques à partir des données
  const getUniqueSpecialties = (): string[] => {
    if (!dashboardData || !dashboardData.data) return []

    const specialties = dashboardData.data.map((record) => record.speciality)
    return [...new Set(specialties)].filter(Boolean)
  }

  // Fonction pour obtenir toutes les spécialités, y compris les fixes
  const getAllSpecialties = (): string[] => {
    const fixedSpecialties = ["Cardiology", "Endocrinology", "Internal Medicine", "Neurology", "Pulmonology"]
    const dataSpecialties = getUniqueSpecialties()

    // Combiner les spécialités fixes avec celles des données
    return [...new Set([...fixedSpecialties, ...dataSpecialties])]
  }

  // Fonction pour filtrer les dossiers médicaux par spécialité
  const getFilteredRecords = (): MedicalRecord[] => {
    if (!dashboardData || !dashboardData.data) return []

    if (selectedSpecialty === "All Specialties") {
      return dashboardData.data
    }

    return dashboardData.data.filter((record) => record.speciality === selectedSpecialty)
  }

  // Fonction pour obtenir l'icône d'une spécialité
  const getSpecialtyIcon = (specialty: string): React.ReactNode => {
    return specialtyIcons[specialty] || specialtyIcons["General"]
  }

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  // Fonction pour marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Fonction pour obtenir le nombre de notifications non lues
  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length
  }

  // Fonction pour obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      case "info":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "success":
        return <FileText className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Fonction pour obtenir la couleur de fond en fonction du type de notification
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50"
      case "info":
        return "bg-blue-50"
      case "success":
        return "bg-green-50"
      case "warning":
        return "bg-amber-50"
      default:
        return "bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) return <div className="text-red-500 p-6">{error}</div>
  if (!dashboardData) return <div className="p-6">No data found</div>

  // Calculate summary numbers
  const upcomingAppointments = 0 // You can add this to your API response
  const activePrescriptions = 0 // You can add this to your API response
  const recentLabResults = 0 // You can add this to your API response

  // Obtenir les spécialités uniques
  const uniqueSpecialties = getUniqueSpecialties()

  // Obtenir les dossiers filtrés
  const filteredRecords = getFilteredRecords()

  // Obtenir le nombre de notifications non lues
  const unreadCount = getUnreadCount()

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-l-4 ${
                        notification.type === "error"
                          ? "border-red-500"
                          : notification.type === "info"
                            ? "border-blue-500"
                            : notification.type === "success"
                              ? "border-green-500"
                              : "border-amber-500"
                      } ${getNotificationBgColor(notification.type)} p-4 relative`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Upcoming Appointments Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Upcoming Appointments</p>
                <h2 className="text-3xl font-bold mt-2">{upcomingAppointments}</h2>
                <p className="text-sm text-muted-foreground mt-1">No upcoming appointments</p>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Active Prescriptions Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Active Prescriptions</p>
                <h2 className="text-3xl font-bold mt-2">{activePrescriptions}</h2>
                <p className="text-sm text-muted-foreground mt-1">No active prescriptions</p>
              </div>
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Lab Results Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Recent Lab Results</p>
                <h2 className="text-3xl font-bold mt-2">{recentLabResults}</h2>
                <p className="text-sm text-muted-foreground mt-1">No recent lab results</p>
              </div>
              <TestTube className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="medical-records" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="medical-records" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical Records
              </TabsTrigger>
              <TabsTrigger value="patient-info" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Info
              </TabsTrigger>
              <TabsTrigger value="lab-results" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Lab Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="medical-records">
              <Card>
                <CardContent className="pt-6">
                  {selectedRecord ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                          {selectedRecord.type} - {selectedRecord.speciality}
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                          Back to Records
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Speciality</p>
                            <p>{selectedRecord.speciality}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Doctor ID</p>
                            <p>{selectedRecord.doctorID}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Type</p>
                          <p className="mt-1">{selectedRecord.type}</p>
                        </div>
                        {selectedRecord.notes && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="mt-1 bg-gray-50 p-3 rounded">{selectedRecord.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Your Medical Records</h3>
                      </div>

                      {/* Barre de navigation des spécialités */}
                      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
                        <Button
                          variant={selectedSpecialty === "All Specialties" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("All Specialties")}
                          className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          All Specialties
                        </Button>

                        <Button
                          variant={selectedSpecialty === "Cardiology" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("Cardiology")}
                          className="rounded-full flex items-center gap-1"
                        >
                          <Heart className="h-4 w-4 text-rose-500" />
                          Cardiology
                        </Button>

                        <Button
                          variant={selectedSpecialty === "Endocrinology" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("Endocrinology")}
                          className="rounded-full flex items-center gap-1"
                        >
                          <Activity className="h-4 w-4 text-green-500" />
                          Endocrinology
                        </Button>

                        <Button
                          variant={selectedSpecialty === "Internal Medicine" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("Internal Medicine")}
                          className="rounded-full flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4 text-blue-500" />
                          Internal Medicine
                        </Button>

                        <Button
                          variant={selectedSpecialty === "Neurology" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("Neurology")}
                          className="rounded-full flex items-center gap-1"
                        >
                          <Brain className="h-4 w-4 text-purple-500" />
                          Neurology
                        </Button>

                        <Button
                          variant={selectedSpecialty === "Pulmonology" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSpecialty("Pulmonology")}
                          className="rounded-full flex items-center gap-1"
                        >
                          <Lungs className="h-4 w-4 text-cyan-500" />
                          Pulmonology
                        </Button>
                      </div>

                      {/* Affichage des dossiers médicaux par spécialité */}
                      <div className="space-y-6">
                        {selectedSpecialty !== "All Specialties" && (
                          <div className="flex items-center gap-2 mb-2">
                            {getSpecialtyIcon(selectedSpecialty)}
                            <h4 className="text-lg font-medium">{selectedSpecialty}</h4>
                          </div>
                        )}

                        {filteredRecords.length > 0 ? (
                          <div className="space-y-4">
                            {filteredRecords.map((record, idx) => (
                              <MedicalRecordItem key={idx} record={record} onView={() => handleViewRecord(record)} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-muted-foreground">
                            No medical records found for{" "}
                            {selectedSpecialty === "All Specialties" ? "any specialty" : selectedSpecialty}.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patient-info">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold">Your Information</h3>
                  <p className="text-sm text-muted-foreground mb-6">Personal details and information</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="font-medium">{dashboardData.patientName}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <p className="text-sm font-medium text-muted-foreground">Age</p>
                      <p className="font-medium">{dashboardData.age}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="font-medium">{dashboardData.gender}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{dashboardData.phoneNumber}</p>
                    </div>
                    <div className="border rounded-md p-4 bg-gray-50">
                      <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                      <p className="font-medium font-mono break-all">{dashboardData.patientId}</p>
                    </div>

                    {/* Affichage des Record IDs */}
                    {dashboardData.recordIds && dashboardData.recordIds.length > 0 && (
                      <div className="border rounded-md p-4 md:col-span-3">
                        <p className="text-sm font-medium text-muted-foreground">Your Record IDs</p>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {dashboardData.recordIds.map((id, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                              {id}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab-results">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold">Your Lab Results</h3>
                  <p className="text-sm text-muted-foreground mb-6">View your recent lab test results</p>

                  <div className="text-center py-8 text-muted-foreground">No lab results available at this time.</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`${getNotificationBgColor(notification.type)} p-3 rounded-md border-l-4 ${
                        notification.type === "error"
                          ? "border-red-500"
                          : notification.type === "info"
                            ? "border-blue-500"
                            : notification.type === "success"
                              ? "border-green-500"
                              : "border-amber-500"
                      } relative`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowNotifications(true)}
                    >
                      View all notifications
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">You have no new notifications.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Doctor Access
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowAddDoctorForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.accessList.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.accessList.map((doctor, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="font-medium">Doctor ID: {doctor}</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => openRevokeDialog(doctor)}>
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No doctors have access yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Doctor Access Dialog */}
      <Dialog open={showAddDoctorForm} onOpenChange={setShowAddDoctorForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Doctor Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recordId">Record ID</Label>
              <Input
                id="recordId"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="Enter record ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor ID</Label>
              <Input
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Enter doctor ID"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDoctorForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Access"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Doctor Access Dialog */}
      <Dialog open={showRevokeDoctorForm} onOpenChange={setShowRevokeDoctorForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Doctor Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={prepareRevokeAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recordIdRevoke">Record ID</Label>
              <Input
                id="recordIdRevoke"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="Enter record ID to revoke access from"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorIdRevoke">Doctor ID</Label>
              <Input id="doctorIdRevoke" value={doctorToRevoke} readOnly className="bg-gray-50" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRevokeDoctorForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Continue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={cancelConfirmation}
        onConfirm={confirmRevokeAccess}
        title="Confirm Access Revocation"
        description={`Are you sure you want to revoke access for Doctor ${pendingRevokeData?.doctorId || ""} to Record ${
          pendingRevokeData?.recordId || ""
        }? This action cannot be undone.`}
        isLoading={isRevoking}
      />
    </div>
  )
}

interface MedicalRecordItemProps {
  record: MedicalRecord
  onView: () => void
}

function MedicalRecordItem({ record, onView }: MedicalRecordItemProps) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{record.type}</h4>
          <p className="text-sm text-muted-foreground">
            {record.speciality} - Doctor ID: {record.doctorID}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
      </div>
    </div>
  )
}

export default PatientDashboard
