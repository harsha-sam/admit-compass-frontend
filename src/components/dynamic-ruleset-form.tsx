"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Attribute } from '@/components/types'

interface DynamicRulesetFormProps {
  attributes: Attribute[]
  formOrder: number[]
  onSubmit?: (data: any) => void
}

export function DynamicRulesetForm({ attributes, formOrder, onSubmit }: DynamicRulesetFormProps) {
  const [formState, setFormState] = useState<Record<number, any>>({})
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    // Reset form state when attributes or formOrder changes
    setFormState({})
    setRenderKey(prev => prev + 1)
  }, [attributes, formOrder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formState)
    }
  }

  const updateFormState = (id:number , value: any) => {
    setFormState(prev => ({ ...prev, [id]: value }))
  }

  const isVisible = (attribute: Attribute) => {
    if (!attribute || !attribute.rules || attribute.rules.length === 0) return true

    const rule = attribute.rules[0]

    const conditionResults = rule.conditions.map((condition: any) => {
        const fieldValue = formState[condition.evaluatedAttributeId]
        const conditionValue = condition.value1

        if (fieldValue === undefined || fieldValue === null) return false

        switch (condition.operator) {
          case 'equals':
            return fieldValue == conditionValue // Use loose equality for type coercion
          case 'not_equals':
            return fieldValue != conditionValue // Use loose inequality for type coercion
          case 'contains':
            if (Array.isArray(fieldValue)) {
              return fieldValue.includes(conditionValue)
            }
            else if (typeof fieldValue === "string") {
              return String(fieldValue).includes(String(conditionValue))
            }
            return conditionValue in fieldValue
          case 'not_contains':
            if (Array.isArray(fieldValue)) {
              return !fieldValue.includes(conditionValue)
            }
            else if (typeof fieldValue === "string") {
              return !String(fieldValue).includes(String(conditionValue))
            }
            return !(conditionValue in fieldValue)
          case 'greater_than':
            return Number(fieldValue) > Number(conditionValue)
          case 'less_than':
            return Number(fieldValue) < Number(conditionValue)
          case 'greater_than_or_equal':
            return Number(fieldValue) >= Number(conditionValue)
          case 'less_than_or_equal':
            return Number(fieldValue) <= Number(conditionValue)
          default:
            return true
        }
      })

    const isRuleTrue = rule.logicOperator === 'AND'
        ? conditionResults.every(Boolean)
      : conditionResults.some(Boolean)
    
    if (rule.action === "HIDE") {
      return !isRuleTrue
    }
    return rule.action === "SHOW" && isRuleTrue
  }

  const renderFormElement = (attribute: Attribute) => {
    switch (attribute.type) {
      case 'singleLineText':
        return (
          <Input
            id={attribute.attributeId.toString()}
            value={formState[attribute.attributeId] || ''}
            onChange={(e) => updateFormState(attribute.attributeId, e.target.value)}
            placeholder={`Enter ${attribute.displayName}`}
          />
        )
      case 'multiLineText':
        return (
          <Textarea
            id={attribute.attributeId.toString()}
            value={formState[attribute.attributeId] || ''}
            onChange={(e) => updateFormState(attribute.attributeId, e.target.value)}
            placeholder={`Enter ${attribute.displayName}`}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            id={attribute.attributeId.toString()}
            value={formState[attribute.attributeId] || ''}
            onChange={(e) => updateFormState(attribute.attributeId, parseFloat(e.target.value) || '')}
            placeholder={`Enter ${attribute.displayName}`}
            min={attribute.validationRule?.min}
            max={attribute.validationRule?.max}
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            id={attribute.attributeId.toString()}
            value={formState[attribute.attributeId] || ''}
            onChange={(e) => updateFormState(attribute.attributeId, e.target.value)}
          />
        )
      case 'dropdown':
        return (
          <Select
            value={formState[attribute.attributeId] || ''}
            onValueChange={(value) => updateFormState(attribute.attributeId, value)}
          >            
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attribute.displayName}`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option: any, index: any) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'multiselect':
        return (
          <div className="space-y-2">
            {attribute.options?.map((option: any, index: any) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute.attributeId}-${index}`}
                  checked={formState[attribute.attributeId]?.[option.value] || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formState[attribute.attributeId] || {}
                    updateFormState(attribute.attributeId, {
                      ...currentValues,
                      [option.value]: checked
                    })
                  }}
                />
                <Label htmlFor={`${attribute.name}-${index}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )
      default:
        return (
          <Input
            id={attribute.attributeId.toString()}
            value={formState[attribute.attributeId] || ''}
            onChange={(e) => updateFormState(attribute.attributeId, e.target.value)}
            placeholder={`Enter ${attribute.displayName}`}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" key={renderKey}>
      {formOrder.map((index) => {
        const attribute = attributes[index]
        if (!isVisible(attribute)) return null

        return (
          <Card key={attribute.attributeId} className="p-4">
            <div className="space-y-2 mb-4">
              <Label htmlFor={attribute.name}>{attribute.displayName}</Label>
              {renderFormElement(attribute)}
              {attribute.description && (
                <p className="text-sm text-muted-foreground">{attribute.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Current value: {JSON.stringify(formState[attribute.attributeId])}
              </p>
            </div>
          </Card>
        )
      })}
    </form>
  )
}

