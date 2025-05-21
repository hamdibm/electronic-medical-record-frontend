"use client"
import { newSocket, SOCKET_SERVER_URL, } from "@/lib/socket";

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  FileText,
  Clock,
  
  Settings,
  User,
  Folder,
  ClipboardList,
  Send,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CloseCollaborationDialog } from "./close-collaboration-dialog"
import { RightSidebar } from "./right-sidebar"
import { CommentThread } from "./comment-thread"
import { NotificationsDropdown } from "./notifications-dropdown"
import { CaseExplorer } from "./case-explorer"
import { PatientRecords } from "./patient-records"
import { PatientRecordDetail } from "./patient-record-details"
import {toast} from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getDecodedToken, UserRole } from "@/lib/jwtUtils"
import { getCasesByDoctor } from "@/assets/data/cases"
import { Case, CaseStatus } from "@/types"
import {  Doctor, getDoctorById } from "@/assets/data/doctors"
const token=getDecodedToken(UserRole.DOCTOR);
const doctorId=token?.userId;
if(!doctorId) {
  console.log("Doctor ID not found in token")
}
let doctor:Doctor |null=null;
if(doctorId){
  doctor = await getDoctorById(doctorId);

}
export default function CollaborationCase() {
  const [cases, setCases] = useState<Case[]>([])
  const [caseCount, setCaseCount] = useState<number>(0)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [activeView, setActiveView] = useState<
    "case-detail" | "my-cases" | "patient-records" | "patient-detail" | "settings"
  >("patient-records")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCase, setActiveCase] = useState<(typeof cases)[0] | null>(null)
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [currentRoom, setCurrentRoom] = useState<string>('');
 const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const handleCaseCountChange = (count: number) => {
    setCaseCount(count)
  }
  useEffect(() => {
    if (!newSocket.connected) {
      newSocket.connect();
    }

    const handleUpdateOnlineUsers = (users: string[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    };

    if (doctorId) {
      console.log("Emitting register_user with doctorId:", doctorId);
      newSocket.emit("register_user", doctorId);
    }

    newSocket.on("update_online_users", handleUpdateOnlineUsers);

    return () => {
      newSocket.off("update_online_users", handleUpdateOnlineUsers);
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom) return;

    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${SOCKET_SERVER_URL}/api/threads/rooms/${currentRoom}/comments`
        );
        const data: Comment[] = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();

    console.log(`Joining room: ${currentRoom}`);
    newSocket.emit("join_room", currentRoom);

    return () => {
      console.log(`Leaving room: ${currentRoom}`);
      newSocket.emit("leave_room", currentRoom);
    };
  }, [currentRoom]);
  
  console.log("online users:", onlineUsers);
  useEffect(() => {
    if (doctorId) {
      getCasesByDoctor(doctorId)
      .then((data) => {
        if (data) {
          setCases(data)
        } else {
          console.error("No cases found for the doctor.")
        }
      })
      .catch((error) => {
        console.error("Error fetching cases:", error)
      })
    }
  }, [])
  
  
  interface Comment {
    id: string
    author: {
      name: string
      avatar: string
      specialty: string
    }
    content: string
    timestamp: string
    likes: number
    userLiked: boolean
    replies: Comment[]
  }


  // Load case details when selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId) {
      const caseData = cases.find((c) => c.id === selectedCaseId)
      if (caseData) {
        setActiveCase(caseData)
      }
    } else {
      setActiveCase(null)
    }
  }, [selectedCaseId, cases])

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    setActiveView("case-detail")
    setCurrentRoom(caseId)
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setSelectedCaseId(null)
    setActiveView("patient-detail")
  }

  const handleBackFromCase = () => {
    if (selectedPatientId) {
      setActiveView("patient-detail")
    } else {
      setActiveView("patient-records")
    }
    setSelectedCaseId(null)
    setCurrentRoom('')
  }

  const handlePostComment = () => {
    if (!newComment.trim()) return

    // Add the new comment to the comments array
    const newCommentObj:Comment = {
      id: `comment-${Date.now()}`,
      author: {
        name: doctor?.name || "unkown doctor", 
        avatar: doctor?.avatar||"/placeholder.svg?height=40&width=40",
        specialty: doctor?.specialty || "unkown specialty",
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      userLiked: false,
      replies: [],
    }
    if (newSocket) {
      newSocket.emit("new_comment", {roomId:selectedCaseId,comment:newCommentObj}); 
    }

    setComments((prevComments) => [...prevComments, newCommentObj]);
    setNewComment("")

    // Show success toast
    toast.success(
      
       "Your comment has been added to the discussion.",
    )
  }

  const handleBackToPatientList = () => {
    setCurrentRoom('');
    setSelectedCaseId(null)
    setActiveView("patient-records")
    setSelectedPatientId(null)
  }

  const handleCloseCase = () => {

    setIsCloseDialogOpen(true)
  }

  const handleShareCase = () => {
    toast.success(
       
       "Collaboration invitation sent to the selected team members.",
    )
  }

  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast(`Showing results for "${searchQuery}"`,
    )
  }

  const handleQuickFilterSelect = (filter: string) => {
    setQuickFilter(filter)
    toast(
       `Showing ${filter.toLowerCase()}`,
    )
  }

  const handleSettingsClick = () => {
    setActiveView("settings")
  }

  return (
    <div className="flex h-screen w-full">
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg">MedCollab</span>
          </div>
          <form className="relative flex-1 max-w-md" onSubmit={handleSearch}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases or patients..."
              className="w-full bg-gray-50 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="ml-auto flex items-center gap-4">
            {/* Notifications Dropdown */}
            <NotificationsDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="Dr. Sarah Johnson"
                  />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1">
          {/* Left sidebar - Navigation */}
          <div className="w-56 border-r bg-gray-50 flex flex-col">
            <nav className="flex-1 p-3 space-y-1">
              <div
                className={`flex items-center justify-between rounded-md px-3 py-2 ${
                  activeView === "my-cases"
                    ? "bg-indigo-100 text-indigo-900"
                    : "hover:bg-gray-100 cursor-pointer"
                }`}
                onClick={() => {
                  setActiveView("my-cases");
                  setSelectedPatientId(null);
                  setSelectedCaseId(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="text-sm font-medium">My Cases</span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {cases.length}
                </Badge>
              </div>

              <div
                className={`flex items-center justify-between rounded-md px-3 py-2 ${
                  activeView === "patient-records" ||
                  activeView === "patient-detail"
                    ? "bg-indigo-100 text-indigo-900"
                    : "hover:bg-gray-100 cursor-pointer"
                }`}
                onClick={() => {
                  setActiveView("patient-records");
                  setSelectedPatientId(null);
                  setSelectedCaseId(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-sm font-medium">Patient Records</span>
                </div>
              </div>

              <div
                className={`flex items-center justify-between rounded-md px-3 py-2 ${
                  activeView === "settings"
                    ? "bg-indigo-100 text-indigo-900"
                    : "hover:bg-gray-100 cursor-pointer"
                }`}
                onClick={handleSettingsClick}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </div>
            </nav>

            <div className="p-3 border-t">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                QUICK FILTERS
              </h3>
              <div className="space-y-1">
                <div
                  className={`flex items-center justify-between px-3 py-1 text-sm ${
                    quickFilter === "All Cases"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-100"
                  } rounded cursor-pointer`}
                  onClick={() => handleQuickFilterSelect("All Cases")}
                >
                  <span>All Cases</span>
                  <span className="text-gray-500">45</span>
                </div>
                <div
                  className={`flex items-center justify-between px-3 py-1 text-sm ${
                    quickFilter === "Pending Review"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-100"
                  } rounded cursor-pointer`}
                  onClick={() => handleQuickFilterSelect("Pending Review")}
                >
                  <span>Pending Review</span>
                  <span className="text-gray-500">8</span>
                </div>
                <div
                  className={`flex items-center justify-between px-3 py-1 text-sm ${
                    quickFilter === "Recently Updated"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-100"
                  } rounded cursor-pointer`}
                  onClick={() => handleQuickFilterSelect("Recently Updated")}
                >
                  <span>Recently Updated</span>
                  <span className="text-gray-500">12</span>
                </div>
                <div
                  className={`flex items-center justify-between px-3 py-1 text-sm ${
                    quickFilter === "Closed Cases"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-100"
                  } rounded cursor-pointer`}
                  onClick={() => handleQuickFilterSelect("Closed Cases")}
                >
                  <span>Closed Cases</span>
                  <span className="text-gray-500">156</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {activeView === "case-detail" && activeCase ? (
              <div className="mx-auto max-w-4xl p-6">
                {/* Add back button at the top */}
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={handleBackFromCase}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to{" "}
                    {selectedPatientId ? "Patient Record" : "Patient Records"}
                  </Button>
                </div>

                {/* GitHub-like title section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <span>Case ID: #{activeCase.id}</span>
                    <Badge
                      className={
                        activeCase.status === "Open"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-600 text-white"
                      }
                    >
                      {activeCase.status}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold">{activeCase.title}</h1>

                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>
                        {activeCase.participants.length} Participating Doctors
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Created{" "}
                        {new Date(activeCase.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Initial Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{activeCase.description}</p>
                        <div className="mt-4 flex gap-2">
                          {activeCase.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={
                                tag === "Urgent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100"
                              }
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Days Active</span>
                            <span className="font-medium">{activeCase.status === "Open" && Math.floor((Date.now() - new Date(activeCase.createdAt).getTime()) / (1000 * 60 * 60 * 24))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Participating Doctors
                            </span>
                            <span className="font-medium">
                              {activeCase.participants.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Comments</span>
                            <span className="font-medium">
                              {comments.reduce((total, comment) => {
                                const countReplies = (
                                  replies: Comment[]=[]
                                ): number => {
                                  return replies.reduce(
                                    (count, reply) =>
                                      count + 1 + countReplies(reply.replies||[]),
                                    0
                                  );
                                };
                                return (
                                  total + 1 + countReplies(comment.replies || [])
                                );
                              }, 0)}
                            </span>
                          </div>
                          
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Discussion Thread</h2>
                </div>

                {/* Comment Thread Component */}
                <div className="mb-6">
                  <CommentThread
                    initialComments={comments}
                    roomId={activeCase.id}
                  />
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <Textarea
                    placeholder="Add your medical opinion..."
                    className="min-h-24 resize-none border-0 focus-visible:ring-0 p-0"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                    <div className="mt-4 flex justify-end">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                      disabled={!newComment.trim()}
                      onClick={handlePostComment}
                    >
                      <Send className="h-4 w-4" />
                      Post Comment
                    </Button>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCloseCase}
                      disabled={activeCase.status === "Closed"}
                    >
                      Close Case
                    </Button>
                    <Button variant="outline" onClick={handleShareCase}>
                      Share with Team
                    </Button>
                  </div>
                </div>
              </div>
            ) : activeView === "my-cases" ? (
              <CaseExplorer onCaseSelect={handleCaseSelect} />
            ) : activeView === "patient-records" ? (
              <PatientRecords
                onPatientSelect={handlePatientSelect}
                numberOfCases={caseCount}
              />
            ) : activeView === "settings" ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            defaultValue="Dr. Sarah Johnson"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            defaultValue="sarah.johnson@medcollab.com"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Specialty</label>
                        <Input defaultValue="Cardiology" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Notification Preferences
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="email-notif"
                              className="mr-2"
                              defaultChecked
                            />
                            <label htmlFor="email-notif" className="text-sm">
                              Email notifications
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="case-notif"
                              className="mr-2"
                              defaultChecked
                            />
                            <label htmlFor="case-notif" className="text-sm">
                              Case updates
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mention-notif"
                              className="mr-2"
                              defaultChecked
                            />
                            <label htmlFor="mention-notif" className="text-sm">
                              Mentions
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            toast.success(
                              "Your account settings have been updated successfully."
                            );
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <PatientRecordDetail
                patientId={selectedPatientId!}
                onBack={handleBackToPatientList}
                onCaseSelect={handleCaseSelect}
                onCaseCountChange={handleCaseCountChange}
              />
            )}
          </div>

          {/* Right sidebar with tabs for Doctors and Related Cases */}
          {activeView === "case-detail" && <RightSidebar recordId={selectedPatientId || selectedCaseId|| "nothing"} doctorId={doctorId?doctorId:""} onLineDoctors={onlineUsers} />}
        </div>
      </div>

      {/* Close case dialog */}
      <CloseCollaborationDialog
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onCaseClosed={() => {
          if (activeCase) {
            // Update the case status
            const updatedCase = {
              ...activeCase,
              status: "Closed" as CaseStatus,
            };
            setActiveCase(updatedCase);

            toast.success(
              "The collaboration case has been closed successfully."
            );
          }
        }}
      />
    </div>
  );
}
