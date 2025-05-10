"use client"
import { useEffect, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RelatedCases } from "@/components/doctorHome/related-cases"

import { Doctor, getDoctorsByCaseId, getDoctorsByRecordId } from "@/assets/data/doctors"


interface RightSidebarProps {
  recordId: string,
  doctorId: string,
  onLineDoctors:string[]
}
// const doctors: Doctor[] = [
//   {
//     id: "1",
//     name: "Dr. Sarah Chen",
//     specialty: "Pulmonologist",
//     avatar: "/placeholder.svg?height=40&width=40",
//     isOnline: true,
//   },
//   {
//     id: "2",
//     name: "Dr. Michael Roberts",
//     specialty: "Cardiologist",
//     avatar: "/placeholder.svg?height=40&width=40",
//     isOnline: true,
//   },
//   {
//     id: "3",
//     name: "Dr. Emily Rodriguez",
//     specialty: "Internal Medicine",
//     avatar: "/placeholder.svg?height=40&width=40",
//     isOnline: true,
//   },
//   {
//     id: "4",
//     name: "Dr. James Wilson",
//     specialty: "Cardiologist",
//     avatar: "/placeholder.svg?height=40&width=40",
//     isOnline: false,
//   },
// ]

export function RightSidebar({recordId,doctorId,onLineDoctors}: RightSidebarProps) {
  console.log("Record ID in RightSidebar:", recordId)
  const [searchQuery, setSearchQuery] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const isRecordId=recordId.startsWith("TN");
  const isCaseId=!isRecordId;
  useEffect(() => {
    if(isRecordId){
    const fetchDoctors = async () => {
      try {
        const fetchedDoctors = await getDoctorsByRecordId(recordId).then((doctors) => {
          return doctors.map((doctor) => ({
            ...doctor,
            isOnline: onLineDoctors.includes(doctor.id),
          }))
        })
        console.log("Fetched doctors for side bar:", fetchedDoctors)
        setDoctors(fetchedDoctors)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      }
    }
    fetchDoctors()}
  }, [recordId, isRecordId, onLineDoctors])
  useEffect(() => {
    if(isCaseId){
      const fetchDoctors = async () => {
        try {
          const fetchedDoctors = await getDoctorsByCaseId(recordId).then((doctors) => {
            return doctors.map((doctor) => ({
              ...doctor,
              isOnline: onLineDoctors.includes(doctor.id),
            }))
          })
          console.log("Fetched doctors for side bar:", fetchedDoctors)
          setDoctors(fetchedDoctors)
        } catch (error) {
          console.error("Error fetching doctors:", error)
        }
      }
      fetchDoctors()
    }
  }, [recordId, isCaseId, onLineDoctors])
  console.log("Doctors in RightSidebar:", doctors)
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-72 border-l bg-gray-50 flex flex-col">
      <Tabs defaultValue="doctors" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-none border-b">
          <TabsTrigger value="doctors" className="text-xs">
            Doctors
          </TabsTrigger>
          <TabsTrigger value="related" className="text-xs">
            Related Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="doctors"
          className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex data-[state=inactive]:hidden"
        >
          <div className="p-3 border-b">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search doctors..."
                className="w-full pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Participating Doctors</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={doctor.name} />
                      <AvatarFallback>
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        
                      </AvatarFallback>
                    </Avatar>
                    {doctor.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doctor.id===doctorId? doctor.name+" (Me)":doctor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="related"
          className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex data-[state=inactive]:hidden"
        >
          <RelatedCases />
        </TabsContent>
      </Tabs>
    </div>
  )
}
