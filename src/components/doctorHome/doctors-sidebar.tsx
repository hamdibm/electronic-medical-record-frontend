"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

type Doctor = {
  id: string
  name: string
  specialty: string
  avatar: string
  isOnline: boolean
}

const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    specialty: "Pulmonologist",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "2",
    name: "Dr. Michael Roberts",
    specialty: "Cardiologist",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Internal Medicine",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Cardiologist",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
]

export function DoctorsSidebar() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-64 border-l bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Participating Doctors</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-130px)]">
        <div className="p-4 space-y-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={doctor.name} />
                  <AvatarFallback>
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {doctor.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doctor.name}</p>
                <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
