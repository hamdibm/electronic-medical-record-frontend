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
import { AlertTriangle,Calendar,FileText,Heart,LinkIcon,Plus,TestTube, User,Users,Activity,Brain,TreesIcon as Lungs} from "lucide-react"
import { fetchPatientDashboardData, grantAccessForDoctor, revokeAccessFromDoctor } from "@/assets/data/records"
import { toast } from "sonner"
import { NotificationsPatient } from "./notificationPatient"
import {  Record, RecordEntry } from "@/types"




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

const specialtyIcons = {
  "Cardiology": <Heart className="h-4 w-4 text-rose-500" />,
  "Endocrinology": <Activity className="h-4 w-4 text-green-500" />,
  "Internal Medicine": <FileText className="h-4 w-4 text-blue-500" />,
  "Neurology": <Brain className="h-4 w-4 text-purple-500" />,
  "Pulmonology": <Lungs className="h-4 w-4 text-cyan-500" />,
  "General": <FileText className="h-4 w-4 text-gray-500" />,
}

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<Record | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<RecordEntry | null>(null)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("patientAccessToken")
        console.log("Token:", token)
        if (!token) throw new Error("No token found")

        const decoded :JwtPayload= jwtDecode(token)

        const patientId = decoded.userId

        const response :Record= await fetchPatientDashboardData(patientId)

        if (response) {
          if (!response.owner || (Array.isArray(response.owner) && response.owner.length === 0)) {
            response.owner = patientId
          } else if (Array.isArray(response.owner)) {
            response.owner = response.owner[0]
          }
        }

        setDashboardData(response)
      } catch (err) {
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
      const token = localStorage.getItem("patientAccessToken")
      if (!token) throw new Error("No token found")

      const decoded: JwtPayload= jwtDecode(token)
      const patientId = decoded.userId

      const response = await fetchPatientDashboardData(patientId)

      if (response) {
        if (!response.patientId || (Array.isArray(response.patientId) && response.patientId.length === 0)) {
          response.patientId = patientId
        } else if (Array.isArray(response.patientId)) {
          response.patientId = response.patientId[0]
        }
      }

      setDashboardData(response)
    } catch (err) {
      console.error("Error refreshing dashboard data:", err)
      toast.error("Failed to refresh dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecord = (record: RecordEntry) => {
    setSelectedRecord(record)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await grantAccessForDoctor(recordId, doctorId)

      toast.success(`Doctor ${doctorId} now has access to record ${recordId}`)

      setDoctorId("")
      setRecordId("")
      setShowAddDoctorForm(false)

      await refreshDashboard()
    } catch (error) {
      console.error("Error granting access:", error)
      toast.error( "Failed to grant access to doctor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openRevokeDialog = (doctorId: string) => {
    setDoctorToRevoke(doctorId)
    setRecordId("") 
    setShowRevokeDoctorForm(true)
  }

  const prepareRevokeAccess = (e: React.FormEvent) => {
    e.preventDefault()

    setPendingRevokeData({
      recordId: recordId,
      doctorId: doctorToRevoke,
    })

    setShowRevokeDoctorForm(false)
    setShowConfirmationDialog(true)
  }

  const cancelConfirmation = () => {
    setShowConfirmationDialog(false)
    setPendingRevokeData(null)
    
  }

  const confirmRevokeAccess = async () => {
    if (!pendingRevokeData) return

    setIsRevoking(true)

    try {
      await revokeAccessFromDoctor(pendingRevokeData.recordId, pendingRevokeData.doctorId)

      toast.success(`Doctor ${pendingRevokeData.doctorId} no longer has access to record ${pendingRevokeData.recordId}`)

      setRecordId("")
      setDoctorToRevoke("")
      setPendingRevokeData(null)
      setShowConfirmationDialog(false)

      await refreshDashboard()
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error( "Failed to revoke access from doctor")
    } finally {
      setIsRevoking(false)
    }
  }



  const getFilteredRecordData = () => {
    if (!dashboardData || !dashboardData.data) return []

    const sortedData = [...dashboardData.data].sort((a, b) => {
      if (a.specialty < b.specialty) return -1
      if (a.specialty > b.specialty) return 1
      return 0
    })

    if (selectedSpecialty === "All Specialties") {
      return sortedData
    }

    return sortedData.filter((data) => data.specialty === selectedSpecialty)
  }

  const getSpecialtyIcon = (specialty: keyof typeof specialtyIcons): React.ReactNode => {
    return specialtyIcons[specialty] || specialtyIcons["General"]
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

  const upcomingAppointments = 0 
  const activePrescriptions = 0 
  const recentLabResults = 0

  

  const filteredRecords = getFilteredRecordData()


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        {/* Composant de notifications */}
        <NotificationsPatient />
        {/* Notification Bell with Dropdown */}
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
                          {selectedRecord.type} - {selectedRecord.specialty}
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                          Back to Records
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Speciality</p>
                            <p>{selectedRecord.specialty}</p>
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
                        {selectedRecord.type === "ClinicalNote" && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title</p>
                            <p>{selectedRecord.title}</p>
                            <p className="text-sm font-medium text-muted-foreground">Note Type</p>
                            <p>{selectedRecord.NoteType}</p>
                            <p className="text-sm font-medium text-muted-foreground">Content</p>
                            <p>{selectedRecord.NoteContent}</p>
                            <p className="text-sm font-medium text-muted-foreground">Tags</p>
                            <p>{selectedRecord.tags.join(", ")}</p>
                          </div>
                        )}

                        {selectedRecord.type === "Prescription" && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Medication Name</p>
                            <p>{selectedRecord.MedicationName}</p>
                            <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                            <p>{selectedRecord.Dosage}</p>
                            <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                            <p>{selectedRecord.Frequency}</p>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p>{selectedRecord.Duration}</p>
                            <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                            <p>{selectedRecord.quantity}</p>
                            {selectedRecord.instructions && (
                              <>
                                <p className="text-sm font-medium text-muted-foreground">Instructions</p>
                                <p>{selectedRecord.instructions}</p>
                              </>
                            )}
                            {selectedRecord.AdditionalNotes && (
                              <>
                                <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                                <p>{selectedRecord.AdditionalNotes}</p>
                              </>
                            )}
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p>{selectedRecord.status}</p>
                          </div>
                        )}

                        {selectedRecord.type === "Document" && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title</p>
                            <p>{selectedRecord.title}</p>
                            <p className="text-sm font-medium text-muted-foreground">Document Type</p>
                            <p>{selectedRecord.documentType}</p>
                            {selectedRecord.Description && (
                              <>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p>{selectedRecord.Description}</p>
                              </>
                            )}
                            <p className="text-sm font-medium text-muted-foreground">Tags</p>
                            <p>{selectedRecord.tags.join(", ")}</p>
                            <p className="text-sm font-medium text-muted-foreground">Document URLs</p>
                            <ul>
                              {selectedRecord.documentUrls.map((url, index) => (
                                <li key={index}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
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
                            {getSpecialtyIcon(selectedSpecialty as keyof typeof specialtyIcons)}
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
                      <p className="font-medium font-mono break-all">{dashboardData.owner}</p>
                    </div>

                    
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
  record: RecordEntry
  onView: () => void
}

function MedicalRecordItem({ record, onView }: MedicalRecordItemProps) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{record.type}</h4>
          <p className="text-sm text-muted-foreground">
            {record.specialty} - Doctor ID: {record.doctorID}
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