"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPatientAdded: (recordId: string) => void
  records?: { id: string }[]
}

const AddPatientDialog = ({ open, onOpenChange, onPatientAdded, records }: AddPatientDialogProps) => {
  const [recordId, setRecordId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!recordId.trim()) {
      setError("Please enter a record ID")
      return
    }
    setIsSubmitting(true)

    // Check if the patient is already in the doctor's records
    const existingPatient = records?.find((r) => r.id === recordId)

    if (existingPatient) {
      setError("Patient already exists in your records.")
      setIsSubmitting(false)
      return
    }

    setError(null)
    onPatientAdded(recordId)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Add Patient</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Patient</AlertDialogTitle>
          <AlertDialogDescription>Enter the patient's record ID to add them to your records.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recordId" className="text-right">
              Record ID
            </Label>
            <Input
              type="text"
              id="recordId"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Adding..." : "Add"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddPatientDialog
