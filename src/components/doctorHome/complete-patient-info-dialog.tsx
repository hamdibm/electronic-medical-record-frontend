"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateRecord, findRecordByID } from "../../assets/data/records"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDecodedToken } from "@/lib/jwtUtils"
import type { Record } from "../../types"
import { toast } from "sonner"

const token = getDecodedToken()
const doctorId = token?.userId

interface CompletePatientInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordId: string | null
  onInfoCompleted: () => void
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function CompletePatientInfoDialog({
  open,
  onOpenChange,
  recordId,
  onInfoCompleted,
}: CompletePatientInfoDialogProps) {
  const [patient, setPatient] = useState<Record | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])

  // Form state
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [insuranceNumber, setInsuranceNumber] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [currentAllergy, setCurrentAllergy] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [currentCondition, setCurrentCondition] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && recordId) {
      findRecordByID(recordId)
        .then((foundPatient) => {
          if (foundPatient) {
            setPatient(foundPatient)

            // Check for missing information
            const missing: string[] = []
            if (!foundPatient.basicInfo?.insuranceProvider) missing.push("Insurance Provider")
            if (!foundPatient.basicInfo?.insuranceNumber) missing.push("Insurance Number")
            if (!foundPatient.basicInfo?.bloodType) missing.push("Blood Type")
            if (!foundPatient.basicInfo?.allergies || foundPatient.basicInfo?.allergies.length === 0)
              missing.push("Allergies")
            if (!foundPatient.basicInfo?.conditions || foundPatient.basicInfo?.conditions.length === 0)
              missing.push("Conditions")

            setMissingFields(missing)

            // Initialize form with existing data
            setInsuranceProvider(foundPatient.basicInfo?.insuranceProvider || "")
            setInsuranceNumber(foundPatient.basicInfo?.insuranceNumber || "")
            setBloodType(foundPatient.basicInfo?.bloodType || "")
            setAllergies(foundPatient.basicInfo?.allergies || [])
            setConditions(foundPatient.basicInfo?.conditions || [])
          } else {
            console.error("Patient not found with ID:", recordId)
            toast.error("Could not find patient record")
          }
        })
        .catch((err) => {
          console.error("Error fetching patient:", err)
          toast.error("Error loading patient information")
        })
    }
  }, [open, recordId])

  const handleAddAllergy = () => {
    if (currentAllergy && !allergies.includes(currentAllergy)) {
      setAllergies([...allergies, currentAllergy])
      setCurrentAllergy("")
    }
  }

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter((allergy) => allergy !== allergyToRemove))
  }

  const handleAddCondition = () => {
    if (currentCondition && !conditions.includes(currentCondition)) {
      setConditions([...conditions, currentCondition])
      setCurrentCondition("")
    }
  }

  const handleRemoveCondition = (conditionToRemove: string) => {
    setConditions(conditions.filter((condition) => condition !== conditionToRemove))
  }

  const handleSubmit = async () => {
    if (!patient || !recordId || !doctorId) return

    setIsSubmitting(true)

    try {
      // Create a deep copy of the patient's basicInfo to create an updated version
      const updatedBasicInfo = {
        ...(patient.basicInfo || {}),
        insuranceProvider,
        insuranceNumber,
        bloodType,
        allergies,
        conditions,
      }

      const basicInfoUpdate = JSON.stringify({
        ...updatedBasicInfo,
      })

      await updateRecord(
        patient.id, // recordId
        doctorId as string, // doctorID
        "General", // speciality (using a default value)
        "", // phoneNumber (not updating)
        "", // address (not updating)
        "null", // prescriptions (not updating)
        "null", // notes (not updating)
        "null", // document (not updating)
        basicInfoUpdate, // updated basicInfo
        "null", //collab (not updating)
      )

      toast.success("Patient information updated successfully")
      onInfoCompleted()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating patient record:", error)
      toast.error("Failed to update patient information")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Complete Patient Information</DialogTitle>
          <DialogDescription>
            The following information is missing for {patient.patientName}. Please complete it to improve patient care.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-2 flex-1" style={{ maxHeight: "calc(80vh - 180px)" }}>
          <div className="flex items-center gap-3 p-3 border rounded-md mb-4">
            <Avatar>
              <AvatarImage src={"/placeholder.svg"} alt={patient.patientName} />
              <AvatarFallback>
                {patient.patientName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{patient.patientName}</span>
                <span className="text-xs text-gray-500">
                  {patient.age} years, {patient.gender}
                </span>
              </div>
              <p className="text-xs text-gray-500">{patient.id}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Missing Information</h3>
            <div className="flex flex-wrap gap-1 mb-4">
              {missingFields.map((field) => (
                <Badge key={field} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {field}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {missingFields.includes("Insurance Provider") && (
              <div className="grid gap-2">
                <Label htmlFor="insurance-provider">Insurance Provider</Label>
                <Input
                  id="insurance-provider"
                  placeholder="e.g., Blue Cross, Aetna"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                />
              </div>
            )}

            {missingFields.includes("Insurance Number") && (
              <div className="grid gap-2">
                <Label htmlFor="insurance-number">Insurance Policy Number</Label>
                <Input
                  id="insurance-number"
                  placeholder="e.g., BC-12345678"
                  value={insuranceNumber}
                  onChange={(e) => setInsuranceNumber(e.target.value)}
                />
              </div>
            )}

            {missingFields.includes("Blood Type") && (
              <div className="grid gap-2">
                <Label htmlFor="blood-type">Blood Type</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger id="blood-type">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {missingFields.includes("Allergies") && (
              <div className="grid gap-2">
                <Label htmlFor="allergies">Allergies</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergies.length === 0 ? (
                    <span className="text-sm text-gray-500">No allergies added yet</span>
                  ) : (
                    allergies.map((allergy, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <span>{allergy}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleRemoveAllergy(allergy)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="allergies"
                    placeholder="e.g., Penicillin, Peanuts"
                    value={currentAllergy}
                    onChange={(e) => setCurrentAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddAllergy()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddAllergy}
                    disabled={!currentAllergy}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter "None" if the patient has no known allergies</p>
              </div>
            )}

            {missingFields.includes("Conditions") && (
              <div className="grid gap-2">
                <Label htmlFor="conditions">Medical Conditions</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {conditions.length === 0 ? (
                    <span className="text-sm text-gray-500">No conditions added yet</span>
                  ) : (
                    conditions.map((condition, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <span>{condition}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleRemoveCondition(condition)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="conditions"
                    placeholder="e.g., Hypertension, Diabetes"
                    value={currentCondition}
                    onChange={(e) => setCurrentCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddCondition()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCondition}
                    disabled={!currentCondition}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for Now
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting ? "Saving..." : "Save Information"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
