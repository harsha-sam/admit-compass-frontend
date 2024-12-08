"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Trash2 } from 'lucide-react'
import { RuleBuilderDialog } from "@/components/attribute-rule-builder-dialog"

const attributeTypes = [
  { value: "singleLineText", label: "Single Line Text", icon: "🔤" },
  { value: "multiLineText", label: "Multi Line Text", icon: "🔤" },
  { value: "number", label: "Number", icon: "🔢" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "dropdown", label: "Dropdown", icon: "🔽" },
  { value: "multiselect", label: "Multi-select", icon: "☑️" },
  // { value: "file", label: "File Upload", icon: "📁" },
]

const formSchema = z.object({
  attributeId: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  categoryId: z.union([z.string(), z.number()]).optional(),
  type: z.enum(attributeTypes.map(t => t.value) as [string, ...string[]]),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    rule: z.object({
      action: z.string(),
      logicOperator: z.string(),
      conditions: z.array(z.object({
        conditionId: z.union([z.string(), z.number()]),
        evaluatedAttributeId: z.union([z.string(), z.number()]),
        operator: z.string(),
        value1: z.string(),
      })),
    }).optional(),
  })).optional(),
  variant:z.string().optional(),
  validationRule: z.object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  rule: z.object({
    action: z.string(),
    logicOperator: z.string(),
    conditions: z.array(z.object({
      conditionId: z.union([z.string(), z.number()]),
      evaluatedAttributeId: z.union([z.string(), z.number()]),
      operator: z.string(),
      value1: z.string(),
    })),
  }).optional(),
})

export type AttributeFormData = z.infer<typeof formSchema>

interface AttributeFormProps {
  initialData?: any
  onSubmit: (data: AttributeFormData) => void
  onCancel: () => void
  isEdit: boolean
  categories: { categoryId: number; name: string }[]
  attributes: { attributeId: number; name: string; type: string }[]
}

export function AttributeForm({ initialData, onSubmit, onCancel, categories, attributes, isEdit }: AttributeFormProps) {
  const [selectedType, setSelectedType] = useState(initialData?.type || "singleLineText")

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      attributeId: "",
      name: "",
      displayName: "",
      description: "",
      categoryId: initialData?.categoryId || '',
      type: "singleLineText",
      options: [{ label: "", value: "", rule: { action: "SHOW", logicOperator: "AND", conditions: [] } }],
      validationRule: {
        required: false,
      },
      rule: initialData?.rules?.[0] || {
        action: "SHOW",
        logicOperator: "AND",
        conditions: [],
      },
    },
  })

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: "options",
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        categoryId: initialData?.categoryId || '',
        rule: initialData.rules ?
          initialData.rules[0]
          :
          {
          action: "SHOW",
          logicOperator: "AND",
          conditions: [],
          }
      })
    }
  }, [initialData, form])

  const handleAttributeRuleChange = (rule: any) => {
    form.setValue("rule", rule)
  }

  // const handleOptionRuleChange = (index: number, rule: any) => {
  //   const updatedOptions = [...form.getValues("options")]
  //   // updatedOptions[index].rule = rule
  //   form.setValue("options", updatedOptions)
  // }
  
  const onInvalid = (data: any) => {
    console.log(data, form.getValues())
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 w-full max-w-3xl mx-auto">
          <RuleBuilderDialog
            rule={form.watch("rule") || { action: "SHOW", logicOperator: "AND", conditions: [] }}
            onChange={handleAttributeRuleChange}
            attributes={attributes.filter(attr => attr.attributeId.toString() != form.getValues('attributeId'))}
            isOptionLevel={false}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field}
                     onChange={(e) => {
                       field.onChange(e);
                       if (!isEdit) {
                         const snakeCase = e.target.value.toLowerCase().replace(/\s+/g, '_');
                         form.setValue('name', snakeCase, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                         form.trigger()
                       }
                      }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <small className="text-muted-foreground">Internal Name or Key: {form.watch("name")}</small>


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value)
                  setSelectedType(value)
                }} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {attributeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === "number" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="validationRule.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Value (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validationRule.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Value (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {(selectedType === "dropdown" || selectedType === "multiselect") && (
          <div>
            <FormLabel>Options</FormLabel>
            {optionFields.map((field, index) => (
              <div key={field.id} className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`options.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="Option label" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="Option value" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {/* <RuleBuilderDialog
                    rule={form.getValues(`options.${index}.rule`) || { action: "SHOW", logicOperator: "AND", conditions: [] }}
                    onChange={(rule) => handleOptionRuleChange(index, rule)}
                    attributes={attributes.filter(attr => attr.attributeId.toString() !== form.getValues('attributeId'))}
                    isOptionLevel={true}
                  /> */}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendOption({
                label: "", value: "",
                rule: { action: "SHOW", logicOperator: "AND", conditions: [] }
              })}
            >
              Add Option
            </Button>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{initialData ? "Update" : "Create"} Attribute</Button>
        </div>
      </form>
    </Form>
  )
}
