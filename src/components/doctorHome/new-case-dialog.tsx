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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {findRecordsForSpecificDoctor} from "../../assets/data/records"
import {  CaseStatus, CaseType } from "../../types"
import { getDecodedToken } from "@/lib/jwtUtils"
import { Record } from "../../types"
import { Doctor, getDoctorsByRecordId} from "@/assets/data/doctors"


interface NewCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaseCreated?: (newCase: {
    
    title?: string
    description?: string
    type?: CaseType        
    status?: CaseStatus     
    patient?: { id: string; name: string }
    doctors?: { id: string; name: string; avatar: string; specialty: string }[] 
    tags?: string[]
  }) => void
  preselectedPatient?: Record
}
const token=getDecodedToken();
const doctorId=token?.userId;

const records= await findRecordsForSpecificDoctor(doctorId as string).then((res) => {
  return res;
}).catch((err) => {
  console.error("Error fetching patients:", err);
  return [];
})
console.log("Fetched zzzzzzzzzz records:", records)
// Sample data for doctors
export function NewCaseDialog({ open, onOpenChange, preselectedPatient,onCaseCreated }: NewCaseDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [caseType, setCaseType] = useState("")
  const [status, setStatus] = useState<string>("Open")
  const [patientSearch, setPatientSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<(Record) | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  console.log("selectedPatient:", selectedPatient)
  // Set preselected patient when dialog opens
  useEffect(() => {
    if (open && preselectedPatient) {                                                  
      setSelectedPatient(preselectedPatient)

      // Pre-fill tags based on patient conditions
      if (preselectedPatient.basicInfo?.conditions && preselectedPatient.basicInfo?.conditions.length > 0) {
        setTags(preselectedPatient.basicInfo?.conditions)
      }
    }
    
  }, [open, preselectedPatient])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  // Filter patients based on search
  const filteredPatients = patientSearch
    ? records?.filter(
        (record: typeof records[number]) =>
          record.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
          record.id.toLowerCase().includes(patientSearch.toLowerCase()),
      )
    : records

  // doctors who can collaborate on this case
  useEffect(() => {
    if (selectedPatient) {
      const fetchedoctors = getDoctorsByRecordId(selectedPatient.id)
      fetchedoctors.then((data) => {
        setDoctors(data)
      })
    }
  }, [selectedPatient])
  console.log("Doctors with access fetched:", doctors)
        
        
  
  
  
 

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }


  const handleSubmit = async() => {
    // Here you would handle the submission of the new case
    const newCaseData = {
       
      title,
      description,
      type: caseType as CaseType,        
      status: status as CaseStatus,       
      patient: selectedPatient
        ? {
            id: selectedPatient.id,
            name: selectedPatient.patientName,
          }
        : undefined,
      doctors: Array.isArray(doctors) ? doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name, 
        avatar: doctor.avatar || "/placeholder.svg",
        specialty: doctor.specialty,
      })) : [],
      tags,
    }
    
    if (onCaseCreated) {
      onCaseCreated(newCaseData)
    }
  }
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCaseType("")
    setStatus("Open")
    setSelectedPatient(null)
    setTags([])
    setCurrentTag("")
    setPatientSearch("")
    setDoctors([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Collaboration Case</DialogTitle>
          <DialogDescription>
            Create a new medical case for collaboration with other doctors. Select a patient record and add relevant
            details.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-2 flex-1" style={{ maxHeight: "calc(80vh - 180px)" }}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Case Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for the case"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the case, symptoms, and initial observations"
                className="min-h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="case-type">Case Type</Label>
                <Select value={caseType} onValueChange={setCaseType}>
                  <SelectTrigger id="case-type">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Case Types</SelectLabel>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Patient Record</Label>
              {selectedPatient ? (
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Avatar>
                    <AvatarImage src={"/placeholder.svg"} alt={selectedPatient.patientName} />
                    <AvatarFallback>
                      {selectedPatient.patientName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedPatient.patientName}</span>
                      <span className="text-xs text-gray-500">
                        {selectedPatient.age} years, {selectedPatient.gender}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{selectedPatient.id}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedPatient(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search patients by name or ID..."
                        className="pl-8"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="p-1">
                      {filteredPatients?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <p className="text-sm text-gray-500">No patients found</p>
                        </div>
                      ) : (
                        filteredPatients?.map((record) => (
                          <div
                            key={record.id }
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedPatient(record)}
                          >
                            <Avatar>
                              <AvatarImage src={ "/placeholder.svg"} alt={record.patientName} />
                              <AvatarFallback>
                                {record.patientName 
                                  .split(" ")
                                  .map((n : string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{record.patientName}</span>
                                <span className="text-xs text-gray-500">
                                  {record.age} years, {record.gender}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{record.id}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <span>{tag}</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags (e.g., Cardiology, ECG, Urgent)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} disabled={!currentTag}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !caseType || !selectedPatient}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
