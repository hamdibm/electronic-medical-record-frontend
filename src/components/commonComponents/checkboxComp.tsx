import { Checkbox } from "../ui/checkbox";
interface CheckProps {
  prop: string;
}

const  Check=({prop} : CheckProps) =>{
  return (
    <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <label
      htmlFor="terms"
      className="text-xs font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {prop}
    </label>
  </div>
  )
}
export default Check;