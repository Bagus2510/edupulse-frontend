"use client"

import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FieldGuideProps {
  title: string
  description: string
  tips?: string[]
}

export function FieldGuide({ title, description, tips }: FieldGuideProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center justify-center size-5 rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          />
        }
      >
        <InfoCircledIcon className="size-3" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-72 p-3"
      >
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="space-y-1 pt-1">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground/80">
                  <span className="shrink-0 size-1 rounded-full bg-pulse/60 mt-1.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
