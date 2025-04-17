import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
interface InputWithLabelProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }

export default function InputWithLabel ({id,label,type,placeholder, value, onChange}:InputWithLabelProps) {
  return (
    <div className="grid w-full  items-center gap-1.5">
      <Label htmlFor={id} >{label}</Label>
      <Input type={type || "text"} id={id} placeholder={placeholder} value={value}
        onChange={onChange} />
    </div>
  )
}
