import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
interface InputWithLabelProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    }

export default function InputWithLabel ({id,label,type,placeholder}:InputWithLabelProps) {
  return (
    <div className="grid w-full  items-center gap-1.5">
      <Label htmlFor={id} >{label}</Label>
      <Input type={type || "text"} id={id} placeholder={placeholder} />
    </div>
  )
}
