"use client"

import type React from "react"

import { useState } from "react"
import {
  Search,
  Filter,
  FolderOpen,
  Users,
  Clock,
  ChevronRight,
  FileText,
  Star,
  Plus,
  MessageSquare,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewCaseDialog } from "./new-case-dialog"
import { toast } from "sonner"
import { Case, CaseStatus, CaseType } from "../../types"
import { getCasesByDoctor } from "@/assets/data/cases"
import { getDecodedToken } from "@/lib/jwtUtils"
const token=getDecodedToken();
const doctorId=token?.userId;
const myCases = await getCasesByDoctor(doctorId as string).then((res) => {
  return res;
}).catch((err) => {
  console.error("Error fetching cases:", err);
  return [];
})

interface CaseExplorerProps {
  onCaseSelect?: (caseId: string) => void
}

export function CaseExplorer({ onCaseSelect }: CaseExplorerProps) {
  
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [cases, setCases] = useState(myCases)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Filter cases based on search query
  const filterCases = (cases: Case[]) => {
    if (!searchQuery) return cases

    const query = searchQuery.toLowerCase()
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.patientName.toLowerCase().includes(query) ||
        c.patientId.toLowerCase().includes(query) ||
        c.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // Filter active cases
  const activeCases = cases?.filter((c) => c.status === "Open" || c.status === "Urgent")

  // Filter cases I've created
  const casesICreated = cases?.filter((c) => c.createdBy.id === "1") // Assuming current user is Dr. Sarah Johnson

  // Filter cases I've joined
  const casesIJoined = cases?.filter((c) => c.createdBy.id !== "1" && c.participants.some((p) => p.id === "1"))

  // Get status badge color
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Closed":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "Urgent":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Get type badge color
  const getTypeColor = (type: CaseType) => {
    switch (type) {
      case "Consultation":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Diagnosis":
        return "bg-green-50 text-green-700 border-green-200"
      case "Treatment":
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
      case "Follow-up":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const handleToggleStar = (caseId: string) => {
    setCases(
      cases?.map((c) => {
        if (c.id === caseId) {
          const newStarredState = !c.isStarred
          
          return { ...c, isStarred: newStarredState }
        }
        return c
      }),
    )
  }

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter)
    toast( `Showing ${filter.toLowerCase()}`,)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCaseCreated = (newCase: { 
    title?: string; 
    description?: string; 
    caseType?: CaseType; 
    patient?: { id: string; name: string }; 
    doctors?: { id: string; name: string; avatar: string; specialty: string }[]; 
    tags?: string[]; 
  }) => {
    // In a real app, this would be the actual case data returned from the API
    const createdCase: Case = {
      id: `MED-2023-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newCase.title || "New Case",
      patientName: newCase.patient?.name || "Unknown Patient",
      patientId: newCase.patient?.id || "Unknown ID",
      description: newCase.description || "No description provided",
      status: "Open",
      type: (newCase.caseType as CaseType) || "Consultation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: "1",
        name: "Dr. Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        specialty: "Cardiologist",
      },
      participants:
        newCase.doctors?.map((doctor) => ({
          id: doctor.id,
          name: doctor.name,
          avatar: doctor.avatar,
          specialty: doctor.specialty,
        })) || [],
      tags: newCase.tags || [],
      commentCount: 0,
      attachmentCount: 0,
      isStarred: false,
    }

    setCases([createdCase, ...(cases || [])])
    toast.success( "Your new collaboration case has been created successfully.",
    )
  }

  // Render grid view of cases
  const renderGridView = (cases: Case[]) => {
    const filteredCases = filterCases(cases)

    if (filteredCases.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No cases found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <Button onClick={() => setIsNewCaseDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
            <Plus className="h-4 w-4" />
            Create New Case
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="overflow-hidden hover:border-indigo-200 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={`${getStatusColor(caseItem.status)}`}>
                  {caseItem.status}
                </Badge>
                <Badge variant="outline" className={`${getTypeColor(caseItem.type)}`}>
                  {caseItem.type}
                </Badge>
              </div>
              <CardTitle className="text-base">{caseItem.title}</CardTitle>
              <CardDescription className="line-clamp-2">{caseItem.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-2">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FolderOpen className="h-3.5 w-3.5 mr-1" />
                <span className="mr-3">{caseItem.id}</span>
                <Users className="h-3.5 w-3.5 mr-1" />
                <span>{caseItem.participants.length + 1}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {caseItem.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-gray-50">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Updated {formatDate(caseItem.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {caseItem.attachmentCount}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {caseItem.commentCount}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t bg-gray-50 flex items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={caseItem.createdBy.avatar || "/placeholder.svg"} alt={caseItem.createdBy.name} />
                  <AvatarFallback>
                    {caseItem.createdBy.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <span className="text-gray-700">{caseItem.patientName}</span>
                  <p className="text-gray-500">{caseItem.patientId}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2"
                onClick={() => onCaseSelect && onCaseSelect(caseItem.id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Render list view of cases
  const renderListView = (cases: Case[]) => {
    const filteredCases = filterCases(cases)

    if (filteredCases.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No cases found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <Button onClick={() => setIsNewCaseDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
            <Plus className="h-4 w-4" />
            Create New Case
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {filteredCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex items-center border rounded-md p-3 hover:border-indigo-200 hover:bg-indigo-50/10 transition-colors cursor-pointer"
          >
            <div className="mr-3">
              <Button variant="ghost" size="icon" className="h-7 w-7 p-0" onClick={() => handleToggleStar(caseItem.id)}>
                {caseItem.isStarred ? (
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                ) : (
                  <Star className="h-5 w-5 text-gray-300" />
                )}
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium truncate">{caseItem.title}</h3>
                <Badge variant="outline" className={`${getStatusColor(caseItem.status)}`}>
                  {caseItem.status}
                </Badge>
                <Badge variant="outline" className={`${getTypeColor(caseItem.type)}`}>
                  {caseItem.type}
                </Badge>
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-3">{caseItem.id}</span>
                <span className="mr-3">Patient: {caseItem.patientName}</span>
                <span className="flex items-center mr-3">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated {formatDate(caseItem.updatedAt)}
                </span>
                <span className="flex items-center mr-3">
                  <Users className="h-3 w-3 mr-1" />
                  {caseItem.participants.length + 1}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <div className="flex -space-x-2">
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={caseItem.createdBy.avatar || "/placeholder.svg"} alt={caseItem.createdBy.name} />
                  <AvatarFallback>
                    {caseItem.createdBy.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {caseItem.participants.slice(0, 2).map((participant) => (
                  <Avatar key={participant.id} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                    <AvatarFallback>
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {caseItem.participants.length > 2 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs">
                    +{caseItem.participants.length - 2}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <span className="flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  {caseItem.attachmentCount}
                </span>
                <span className="flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  {caseItem.commentCount}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onCaseSelect && onCaseSelect(caseItem.id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">My Cases</h1>
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-1" onClick={() => setIsNewCaseDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <form className="relative flex-1" onSubmit={handleSearch}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                {activeFilter || "Filter"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterSelect("All Cases")}>All Cases</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("Open Cases")}>Open Cases</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("Urgent Cases")}>Urgent Cases</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("Recently Updated")}>
                Recently Updated
              </DropdownMenuItem>
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

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList className="bg-transparent p-0 h-10">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                All Cases
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Active Cases
              </TabsTrigger>
              <TabsTrigger
                value="created"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Created by Me
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
              >
                Joined
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="all" className="m-0 h-full">
              {viewMode === "grid" ? renderGridView(cases as Case[]) : renderListView(cases as Case[])}
            </TabsContent>
            <TabsContent value="active" className="m-0 h-full">
              {viewMode === "grid" ? renderGridView(activeCases as Case[]) : renderListView(activeCases as Case[])}
            </TabsContent>
            <TabsContent value="created" className="m-0 h-full">
              {viewMode === "grid" ? renderGridView(casesICreated as Case[]) : renderListView(casesICreated as Case[])}
            </TabsContent>
            <TabsContent value="joined" className="m-0 h-full">
              {viewMode === "grid" ? renderGridView(casesIJoined as Case[]) : renderListView(casesIJoined as Case[])}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <NewCaseDialog
        open={isNewCaseDialogOpen}
        onOpenChange={setIsNewCaseDialogOpen}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  )
}
