"use client"
import { newSocket } from "@/lib/socket"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react"
import { toast } from "sonner"
import { getDecodedToken, UserRole } from "@/lib/jwtUtils"
import { Doctor, getDoctorById } from "@/assets/data/doctors"

const token=getDecodedToken(UserRole.DOCTOR);
const doctorId=token?.userId;
if(!doctorId) {
  console.log("Doctor ID not found in token")
}
let doctor:Doctor |null=null;
if(doctorId){
  doctor = await getDoctorById(doctorId);

}
type Comment = {
  id: string
  author: {
    name: string
    avatar: string
    specialty?: string
  }
  content: string
  timestamp: string
  likes: number
  userLiked: boolean
  replies: Comment[]
}

interface CommentProps {
  comment: Comment
  level?: number
  maxLevel?: number
  onLike: (id: string) => void
  onReply: (id: string, content: string) => void
}

interface CommentThreadProps {
  initialComments?: Comment[],
  roomId:string
}

export function CommentThread({ initialComments = [],roomId }: CommentThreadProps) {
  useEffect(() => {
        newSocket.connect();
      return () => {
        newSocket.disconnect();
      };
    }, []);
  useEffect(() => {
    setComments(initialComments); 
  }, [initialComments]);
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const toggleLike = (commentId: string, commentList: Comment[] = comments): Comment[] => {
    return commentList.map((comment ) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          userLiked: !comment.userLiked,
          likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
          replies: comment.replies.map((reply) => reply),
        }
      }

      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: toggleLike(commentId, comment.replies),
        }
      }

      return comment
    })
  }

  const handleLike = (commentId: string) => {
    setComments(toggleLike(commentId))
    
  }

  const addReply = (commentId: string, content: string, commentList: Comment[] = comments): Comment[] => {
    return commentList.map((comment) => {
      if (comment.id === commentId) {
        const replyObj: Comment = {
          id: `reply-${Math.random().toString(36)}`, 
          author: {
            name: doctor?.name || "unknown doctor", 
            avatar: doctor?.avatar || "/placeholder.svg?height=40&width=40",
            specialty: doctor?.specialty || "unknown specialty",
          },
          content,
          timestamp: new Date().toLocaleString(),
          likes: 0,
          userLiked: false,
          replies: [],
        };
  
        newSocket.emit("new_reply", { roomId, parentId: commentId, reply: replyObj });
  
        return {
          ...comment,
          replies: [...comment.replies, replyObj],
        };
      }
  
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReply(commentId, content, comment.replies),
        };
      }
  
      return comment; 
    });
  };
  
 
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={handleLike}
          onReply={(commentId, content) => {
            setComments(addReply(commentId, content))
            toast( "Your reply has been added to the comment.")
          }}
        />
      ))}
    </div>
  )
}

function CommentItem({ comment, level = 0, maxLevel = 4, onLike, onReply }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  if (!comment || !comment.author) {
    toast.error("add a new comment instead for better readability.");
    return null; 
  }
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isNested = level > 0;
  if (hasReplies) {
    console.log("Comment ID:", comment.id);
    console.log("Reply IDs:", comment.replies.map((reply) => reply.id));
  }
  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;

    onReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  return (
    <div className={`${isNested ? "mt-4" : ""}`}>
      <div
        className={`flex gap-4 relative`}
        style={{
          paddingLeft: `${level * 24}px`, 
        }}
      >
       
        {isNested && (
          <>
           
            <div 
              className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-indigo-400" 
              style={{ 
                left: `${(level - 1) * 24 + 12}px`,
                opacity: 0.7,
              }} 
            />
            
            
          </>
        )}
        
        <Avatar>
          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.author.name}</span>
            {comment.author.specialty && <span className="text-xs text-gray-500">({comment.author.specialty})</span>}
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <button
              className={`flex items-center gap-1 ${
                comment.userLiked ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Agree {comment.likes > 0 && `(${comment.likes})`}</span>
            </button>
            <button
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
  
            {hasReplies && (
              <button
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Hide Replies</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Show Replies ({comment.replies.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
  
          {isReplying && (
            <div className="mt-3">
              <Textarea
                placeholder="Write a reply..."
                className="min-h-20 text-sm"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!replyContent.trim()}
                  onClick={handleReplySubmit}
                >
                  <Send className="h-3.5 w-3.5" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {hasReplies && showReplies && level < maxLevel && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              maxLevel={maxLevel}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );}