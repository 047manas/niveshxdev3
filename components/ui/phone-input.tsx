"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

const countries = [
  { label: "India (+91)", value: "+91" },
  { label: "USA (+1)", value: "+1" },
  { label: "UK (+44)", value: "+44" },
  { label: "Australia (+61)", value: "+61" },
  { label: "Singapore (+65)", value: "+65" },
]

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [countryCode, setCountryCode] = React.useState("+91")
    const [open, setOpen] = React.useState(false)
    const phoneNumber = value.replace(countryCode, "").trim()

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const number = e.target.value
      onChange(`${countryCode} ${number}`)
    }

    return (
      <div className="relative flex">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[150px] justify-between rounded-r-none bg-[#0D1B2A] border-gray-600 text-white"
            >
              {countryCode
                ? countries.find((c) => c.value === countryCode)?.label
                : "Select country"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((c) => (
                    <CommandItem
                      key={c.value}
                      value={c.value}
                      onSelect={(currentValue) => {
                        setCountryCode(currentValue)
                        onChange(`${currentValue} ${phoneNumber}`)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          countryCode === c.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          ref={ref}
          type="tel"
          className={cn("rounded-l-none", className)}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          {...props}
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
