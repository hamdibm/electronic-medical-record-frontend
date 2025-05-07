"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
  Loader2,
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
import { createCase, getCasesByDoctor, updateCase } from "@/assets/data/cases"
import { getDecodedToken } from "@/lib/jwtUtils"

import {  Doctor, getDoctorById } from "@/assets/data/doctors"

const token=getDecodedToken();
const doctorId=token?.userId;

interface CaseExplorerProps {
  onCaseSelect?: (caseId: string) => void
}

export function CaseExplorer({ onCaseSelect }: CaseExplorerProps) {
  
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [cases, setCases] = useState<Case[]>()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doctorCreator, setDoctorCreator] = useState<Doctor | null>(null)
  useEffect(() => {
    const fetchDoctorCreator = async () => {
      try {
        const doctorCreator = await getDoctorById(doctorId as string);
        console.log("Doctor Creatoooooooooor:", doctorCreator);
        if (doctorCreator) {
          setDoctorCreator(doctorCreator);
        }
      } catch (error) {
        console.error("Error fetching doctor creator:", error);
      }
    };

    if (doctorId) {
      fetchDoctorCreator();
    }
  }, []);

  console.log("Doctor Creator:", doctorCreator);
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        const myCases = await getCasesByDoctor(doctorId as string)
        setCases(myCases)
        setError(null);
      } catch (error) {
        console.error("Error fetching cases:", error)
      }finally {
        setIsLoading(false)
      }
    }
    if (doctorId) {
      fetchCases();
    } else {
      setError("Doctor ID is not available.");
      setIsLoading(false);
    }
  }
  , [])

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
  const casesICreated = cases?.filter((c) => c.createdBy.id === doctorId) 

  // Filter cases I've joined
  const casesIJoined = cases?.filter((c) => c.createdBy.id !== doctorId && c.participants.some((p) => p.id === doctorId))

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

  const handleToggleStar = async (caseId: string) => {
    try {
      const caseToUpdate = cases?.find((c) => c.id === caseId)
      if (!caseToUpdate) {
        toast.error("Case not found.")
        return
      }
      const newStarredState = !caseToUpdate.isStarred
      setCases(
        cases?.map((c) => {
          if (c.id === caseId) {
            return { ...c, isStarred: newStarredState };
          }
          return c;
        }),
      );
      const updatedCase = await updateCase(caseId, { isStarred: !caseToUpdate?.isStarred })
      setCases((prevCases) =>
        prevCases?.map((c) => (c.id === caseId ? { ...c, isStarred: updatedCase.isStarred } : c)),
      )
      toast.success(`Case ${newStarredState ? "starred" : "unstarred"} successfully.`)
  }catch (error) {
      console.error("Error toggling star:", error)
      toast.error("Error toggling star.")
      setCases(prevCases => prevCases?.map(c => c.id === caseId ? {...c, isStarred: !c.isStarred} : c));    
    }
      
  
  }
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter)
    toast( `Showing ${filter.toLowerCase()}`,)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }
  
  const handleCaseCreated = async (newCase: { 
    
    title?: string; 
    description?: string; 
    type?: CaseType;             
    status?: CaseStatus;         
    patient?: { id: string; name: string }; 
    doctors?: { id: string; name: string; avatar: string; specialty: string }[]; 
    tags?: string[]; 
  }) => {
    try {
      setIsLoading(true);
      
      
  
      // Create the case object to send to the backend
      const caseData: Case = {
         // Generate a unique ID for the case
        id: Array.from({ length: 6 }, () => 
          String.fromCharCode(97 + Math.floor(Math.random() * 26))
        ).join(''),
        title: newCase.title || "",
        description: newCase.description || "",
        type: newCase.type || "Consultation",     // Use type directly
        status: newCase.status || "Open",         // Use provided status or default to "Open"
        createdBy: {
          id: doctorId as string,
          name: doctorCreator?.name as string,
          avatar: doctorCreator?.avatar as string,
          specialty: doctorCreator?.specialty as string,
        },
        patientName: newCase.patient?.name || "",
        patientId: newCase.patient?.id || "",
        participants: newCase.doctors || [],
        tags: newCase.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachmentCount: 0,
        commentCount: 0,
        isStarred: false,
      };
      
      await createCase(caseData)
        .then((response) => {
          console.log("Case created successfully:", response);
          setCases((prevCases) => [...(prevCases || []), response]);
        })
        .catch((error) => {
          console.error("Error creating case:", error);
          toast.error("Failed to create case. Please try again.");
        });
      
      const casesResponse = await getCasesByDoctor(doctorId as string).then((response) => {
        return response;
      }).catch((error) => {
        console.error("Error fetching cases:", error);
        throw error;
      });
      setCases(casesResponse);
      
      toast.success("Your new collaboration case has been created successfully.");
    } catch (err) {
      console.error("Error creating new case:", err);
      toast.error("Failed to create new case. Please try again.");
    } finally {
      setIsLoading(false);
      setIsNewCaseDialogOpen(false);
    }
  }
  // Render grid view of cases
  const renderGridView = (cases: Case[]) => {
    const filteredCases = filterCases(cases);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading cases...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
            Retry
          </Button>
        </div>
      );
    }

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
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(caseItem.id);
                  }}
                >
                  {caseItem.isStarred ? (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ) : (
                    <Star className="h-4 w-4 text-gray-300" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onCaseSelect && onCaseSelect(caseItem.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Render list view of cases
  const renderListView = (cases: Case[]) => {
    const filteredCases = filterCases(cases);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading cases...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
            Retry
          </Button>
        </div>
      );
    }

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
            onClick={() => onCaseSelect && onCaseSelect(caseItem.id)}
          >
            <div className="mr-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 p-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStar(caseItem.id);
                }}
              >
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCaseSelect) {
                    onCaseSelect(caseItem.id);
                  }
                }}
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
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 gap-1" 
            onClick={() => setIsNewCaseDialogOpen(true)}
            disabled={isLoading}
          >
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
              disabled={isLoading}
            />
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1" disabled={isLoading}>
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
              disabled={isLoading}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 rounded-none ${viewMode === "list" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
              onClick={() => setViewMode("list")}
              disabled={isLoading}
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
                disabled={isLoading}
              >
                All Cases
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
                disabled={isLoading}
              >
                Active Cases
              </TabsTrigger>
              <TabsTrigger
                value="created"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
                disabled={isLoading}
              >
                Created by Me
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none h-10"
                disabled={isLoading}
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