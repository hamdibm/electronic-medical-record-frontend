import { Badge } from "@/components/ui/badge"
import { Heart, TreesIcon as Lungs, Activity, Brain, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

type RelatedCase = {
  id: string
  title: string
  status: "Open" | "Closed" | "Pending"
  similarity: number
  tags: string[]
  icon: "heart" | "lungs" | "activity" | "brain"
}

const relatedCases: RelatedCase[] = [
  {
    id: "MED-2023-0785",
    title: "Similar Cardiac Symptoms Review",
    status: "Closed",
    similarity: 92,
    tags: ["Cardiology", "ECG"],
    icon: "heart",
  },
  {
    id: "MED-2023-0791",
    title: "Atypical ECG Pattern Analysis",
    status: "Open",
    similarity: 87,
    tags: ["Cardiology", "ECG"],
    icon: "activity",
  },
  {
    id: "MED-2023-0654",
    title: "Chest Pain with Normal Enzymes",
    status: "Open",
    similarity: 76,
    tags: ["Cardiology", "Pain Management"],
    icon: "heart",
  },
  {
    id: "MED-2023-0712",
    title: "Respiratory Complications Post-Surgery",
    status: "Closed",
    similarity: 68,
    tags: ["Pulmonology", "Post-Op"],
    icon: "lungs",
  },
  {
    id: "MED-2023-0823",
    title: "Cardiac Arrhythmia Investigation",
    status: "Pending",
    similarity: 65,
    tags: ["Cardiology", "Arrhythmia"],
    icon: "activity",
  },
]

export function RelatedCases() {
  // Function to get the appropriate icon component
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "heart":
        return <Heart className="h-4 w-4 text-red-500" />
      case "lungs":
        return <Lungs className="h-4 w-4 text-blue-500" />
      case "activity":
        return <Activity className="h-4 w-4 text-green-500" />
      case "brain":
        return <Brain className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Closed":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium">Related Cases</h3>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
            AI Matched
          </Badge>
        </div>
        <p className="text-xs text-gray-500">Cases with similar symptoms and diagnoses</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-3 space-y-3">
          {relatedCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-md border border-gray-200 overflow-hidden hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                      {getIcon(caseItem.icon)}
                    </div>
                    <span className="text-xs text-gray-500">{caseItem.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <h4 className="text-sm font-medium mb-2">{caseItem.title}</h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {caseItem.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-white border-gray-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700 border-none">{caseItem.similarity}% match</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
