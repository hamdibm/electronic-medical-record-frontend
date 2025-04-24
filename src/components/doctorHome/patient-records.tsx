"use client"

import { useState } from "react"
import { Search, Filter, Plus, FileText, Activity, Clipboard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { findRecordByID, findRecordsForSpecificDoctor, grantAccessForDoctor } from "@/assets/data/records"
import  AddPatientDialog  from "./add-patient-dialog"
import { CompletePatientInfoDialog } from "./complete-patient-info-dialog"
import { toast } from "sonner"
import { getDecodedToken } from "@/lib/jwtUtils"

const token = getDecodedToken()
const doctorId = token?.userId

const records = await findRecordsForSpecificDoctor(doctorId as string)
  .then((res) => {
    return res
  })
  .catch((err) => {
    console.error("Error fetching patients:", err)
    return []
  })

interface PatientRecordsProps {
  onPatientSelect: (recordId: string) => void
}

export function PatientRecords({ onPatientSelect }: PatientRecordsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [isCompleteInfoDialogOpen, setIsCompleteInfoDialogOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  // Filter patients based on search query
  let filteredPatients = records
  if (records) {
    filteredPatients = searchQuery
      ? records.filter((record) => {
          return (
            record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (record.basicInfo?.conditions &&
              record.basicInfo.conditions.length > 0 &&
              record.basicInfo.conditions.some((condition: string) =>
                condition.toLowerCase().includes(searchQuery.toLowerCase()),
              ))
          )
        })
      : records
  }

  const handlePatientAdded = async (recordId: string) => {
    try {
      const RecordOnSearch = await findRecordByID(recordId)
        .then((res) => {
          return res
        })
        .catch((err) => {
          console.log("Error finding patient:", err)
          return null
        })

      console.log("Record found in the system:", RecordOnSearch)

      if (!RecordOnSearch) {
        console.error("Patient not found in the system")
        toast.error("Patient record not found in the system")
        return
      }

      // Grant access for the doctor to the patient record
      await grantAccessForDoctor(recordId, doctorId as string)
        .then(() => {
          toast.success(`Access granted to ${RecordOnSearch.patientName}.`)

          // Check if patient has missing information
          const hasMissingInfo =
            !RecordOnSearch.basicInfo?.insuranceProvider ||
            !RecordOnSearch.basicInfo.insuranceNumber ||
            !RecordOnSearch.basicInfo.bloodType ||
            !RecordOnSearch.basicInfo.allergies ||
            RecordOnSearch.basicInfo.allergies.length === 0 ||
            !RecordOnSearch.basicInfo.conditions ||
            RecordOnSearch.basicInfo.conditions.length === 0

          if (hasMissingInfo) {
            // Show dialog to complete information
            setSelectedRecordId(recordId)
            setIsCompleteInfoDialogOpen(true)
          }

          // Refresh the records list to include the new patient
          window.location.reload() // Force refresh to get updated records
        })
        .catch((err) => {
          console.error("Error granting access:", err)
          toast.error("Failed to grant access. Please try again.")
        })
    } catch (err) {
      console.error("Error finding patient:", err)
      return
    }
  }

  const handleInfoCompleted = () => {
    try {
      if (!records) {
        console.error("Error finding records")
        return
      }
      const record = records.find((r: { id: string }) => r.id === selectedRecordId)
      if (record) {
        toast(`${record.patientName}'s information has been successfully updated.`)
      }
      setSelectedRecordId(null)
    } catch (err) {
      console.error("Error finding record:", err)
      return
    }
  }

  // Render grid view of patients
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients?.map((record) => (
          <Card
            key={record.id}
            className="overflow-hidden hover:border-indigo-200 transition-colors cursor-pointer"
            onClick={() => onPatientSelect(record.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={"/placeholder.svg"} alt={record.patientName} />
                  <AvatarFallback>
                    {record.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{record.patientName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{record.id}</span>
                    <span>•</span>
                    <span>
                      {record.age} years, {record.gender}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-2">
              <div className="grid grid-cols-1 text-sm mb-3">
                {" "}
                {/* <div className="grid grid-cols-2 gap-2 text-sm mb-3">}
                {/* <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div> */}
                <div className="flex items-center gap-1 text-gray-500">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{record.collabs.length} cases</span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex items-start gap-1">
                  <Activity className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">Conditions: </span>
                    <span className="text-xs">{record.basicInfo?.conditions?.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <Clipboard className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">Medications: </span>
                    <span className="text-xs">{record.basicInfo?.medications?.map((med) => med.name).join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {record.basicInfo?.allergies?.map((allergy, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t bg-gray-50 flex items-center justify-between">
              <Badge
                variant="outline"
                className={`${
                  record.status === "Active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {(record.status = "active")}
              </Badge>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                View Record
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Render list view of patients
  const renderListView = () => {
    return (
      <div className="space-y-2">
        {filteredPatients?.map((record) => (
          <div
            key={record.id}
            className="flex items-center border rounded-md p-3 hover:border-indigo-200 hover:bg-indigo-50/10 transition-colors cursor-pointer"
            onClick={() => onPatientSelect(record.id)}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={ "/placeholder.svg"} alt={record.patientName} />
              <AvatarFallback>
                {record.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium">{record.patientName}</h3>
                <span className="text-xs text-gray-500">
                  {record.age} years, {record.gender}
                </span>
                <Badge
                  variant="outline"
                  className={`${
                    record.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {(record.status = "active")}
                </Badge>
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-3">{record.id}</span>
                {/* <span className="flex items-center mr-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last visit: {new Date(record.lastVisit).toLocaleDateString()}
                </span> */}
                <span className="flex items-center mr-3">
                  <Activity className="h-3 w-3 mr-1" />
                  {record.basicInfo?.conditions?.join(", ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  {record.collabs.length} cases
                </span>
              </div>

              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                View Record
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Update the return statement to include the new dialogs and button click handler
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Patient Records</h1>
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-1" onClick={() => setIsAddPatientDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Patient
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients by name, ID, or condition..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Patients</DropdownMenuItem>
              <DropdownMenuItem>Recent Visits</DropdownMenuItem>
              <DropdownMenuItem>Active Cases</DropdownMenuItem>
              <DropdownMenuItem>By Condition</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 rounded-none ${viewMode === "grid" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 rounded-none ${viewMode === "list" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="recent">Recent Visits</TabsTrigger>
            <TabsTrigger value="active">Active Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            {viewMode === "grid" ? renderGridView() : renderListView()}
          </TabsContent>
          <TabsContent value="recent" className="m-0">
            {viewMode === "grid" ? renderGridView() : renderListView()}
          </TabsContent>
          <TabsContent value="active" className="m-0">
            {viewMode === "grid" ? renderGridView() : renderListView()}
          </TabsContent>
        </Tabs>
      </ScrollArea>

      {/* Add the new dialogs */}
      <AddPatientDialog
        open={isAddPatientDialogOpen}
        onOpenChange={setIsAddPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
      />

      <CompletePatientInfoDialog
        open={isCompleteInfoDialogOpen}
        onOpenChange={setIsCompleteInfoDialogOpen}
        recordId={selectedRecordId}
        onInfoCompleted={handleInfoCompleted}
      />
    </div>
  )
}
