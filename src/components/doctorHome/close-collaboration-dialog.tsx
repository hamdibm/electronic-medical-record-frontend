"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X } from "lucide-react"

interface CloseCollaborationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaseClosed?: () => void
}

export function CloseCollaborationDialog({ open, onOpenChange, onCaseClosed }: CloseCollaborationDialogProps) {
  const [finalDecision, setFinalDecision] = useState("")
  const [notes, setNotes] = useState("")
  const [prescriptions, setPrescriptions] = useState([{ medication: "", dosage: "", instructions: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: "", dosage: "", instructions: "" }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: string, value: string) => {
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions[index] = { ...updatedPrescriptions[index], [field]: value }
    setPrescriptions(updatedPrescriptions)
  }

  const handleSubmit = () => {
    // Simulate API call
    setIsSubmitting(true)

    setTimeout(() => {
      // Here you would handle the submission of the final decision, notes, and prescriptions
      console.log({ finalDecision, notes, prescriptions })

      // Reset form
      setFinalDecision("")
      setNotes("")
      setPrescriptions([{ medication: "", dosage: "", instructions: "" }])
      setIsSubmitting(false)

      // Close dialog
      onOpenChange(false)

      // Notify parent component
      if (onCaseClosed) {
        onCaseClosed()
      }
    }, 1000)
  }

  const isFormValid = finalDecision.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Close Collaboration Case</DialogTitle>
          <DialogDescription>
            Provide a final decision, notes, and prescriptions for the patient's record. This information will be
            visible to the patient.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="decision" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="decision">Final Decision</TabsTrigger>
            <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(70vh - 180px)" }}>
            <TabsContent value="decision" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="final-decision">Final Diagnosis & Treatment Plan</Label>
                  <Textarea
                    id="final-decision"
                    placeholder="Enter the final diagnosis and treatment plan..."
                    className="min-h-32"
                    value={finalDecision}
                    onChange={(e) => setFinalDecision(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clinical-notes">Additional Clinical Notes</Label>
                  <Textarea
                    id="clinical-notes"
                    placeholder="Enter additional clinical notes for the patient..."
                    className="min-h-32"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-0">
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="rounded-md border p-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6"
                      onClick={() => removePrescription(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`medication-${index}`}>Medication</Label>
                          <Input
                            id={`medication-${index}`}
                            placeholder="Medication name"
                            value={prescription.medication}
                            onChange={(e) => updatePrescription(index, "medication", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                          <Input
                            id={`dosage-${index}`}
                            placeholder="Dosage (e.g., 10mg)"
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                        <Textarea
                          id={`instructions-${index}`}
                          placeholder="Instructions for taking this medication"
                          value={prescription.instructions}
                          onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={addPrescription}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prescription
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? "Saving..." : "Close Case & Save Records"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
