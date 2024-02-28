import { Input } from "./ui/input";
import { Label } from "./ui/label";

type InputWithLabelProps = {
    label: string
    id: string
    placeholder?: string
    type?: string
} & React.ComponentProps<typeof Input>

export function InputWithLabel({ id, label, placeholder, type, ...props }: InputWithLabelProps) {
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input type={type ?? "text"} id={id} placeholder={placeholder} {...props} />
        </div>
    )
}