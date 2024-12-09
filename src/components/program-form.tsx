"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  programCategory: z.string(),
  programType: z.string(),
  umbcLink: z.string().url({
    message: "Please enter a valid URL.",
  }),
  rulesetId: z.string().optional(),
})

export type ProgramFormData = z.infer<typeof formSchema>

interface ProgramFormProps {
  initialData?: ProgramFormData
  onSubmit: (data: ProgramFormData) => void
  onCancel: () => void
  rulesets: { rulesetId: string; name: string }[]
}

export function ProgramForm({ initialData, onSubmit, onCancel, rulesets }: ProgramFormProps) {
  const form = useForm<ProgramFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      programCategory: "",
      programType: "",
      umbcLink: "",
      rulesetId: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        rulesetId: initialData.rulesetId?.toString()
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter program name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter program description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="programCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BACHELOR">Bachelor</SelectItem>
                  <SelectItem value="MASTER">Master</SelectItem>
                  <SelectItem value="PHD">PhD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="programType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., B.S., M.S., Ph.D." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="umbcLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UMBC Link</FormLabel>
              <FormControl>
                <Input placeholder="https://catalog.umbc.edu/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rulesetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruleset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ruleset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rulesets.map((ruleset) => (
                    <SelectItem key={ruleset.rulesetId} value={ruleset.rulesetId.toString()}>
                      {ruleset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{initialData ? "Update" : "Create"} Program</Button>
        </div>
      </form>
    </Form>
  )
}

