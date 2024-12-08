"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from 'lucide-react'

interface Condition {
  conditionId: string | number;
  evaluatedAttributeId: string | number
  operator: string
  value1: string
}

interface Rule {
  action: string
  logicOperator: string
  conditions: Condition[]
}

interface RuleBuilderDialogProps {
  rule: Rule
  onChange: (rule: Rule) => void
  attributes: { attributeId: number; name: string; displayName?: string; type: string }[]
  isOptionLevel?: boolean
}

export function RuleBuilderDialog({ rule, onChange, attributes, isOptionLevel = false }: RuleBuilderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localRule, setLocalRule] = useState<Rule>(rule)

  useEffect(() => {
    setLocalRule(rule);
  }, [rule])

  const addCondition = () => {
    setLocalRule({
      ...localRule,
      conditions: [...localRule.conditions, {
        conditionId: Date.now().toString(), evaluatedAttributeId: "",
        operator: "",
        value1: ""
      }]
    })
  }

  const updateCondition = (id: string, field: keyof Condition, value1: string) => {
    setLocalRule({
      ...localRule,
      conditions: localRule.conditions.map(condition =>
        condition.conditionId == id ?
          {
            ...condition,
            [field]: value1
          } : condition
      )
    })
  }

  const removeCondition = (id: string) => {
    setLocalRule({
      ...localRule,
      conditions: localRule.conditions.filter(condition => condition.conditionId != id)
    })
  }

  const handleSave = () => {
    onChange(localRule)
    setIsOpen(false)
  }

  const getOperators = (type: string) => {
    switch (type) {
      case 'singleLineText':
        return ['equals', 'not_equals', 'contains', 'not_contains']
      case 'multiLineText':
        return ['contains', 'not_contains']
      case 'dropdown':
        return ['equals', 'not_equals', 'contains', 'not_contains']
      case 'multiselect':
        return ['contains', 'not_contains']
      case 'number':
      case 'date':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal']
      default:
        return ['equals', 'not_equals']
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          {rule.conditions.length > 0 ? "Edit Attribute Rule" : "Create Attribute Rule"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Rules</DialogTitle>
          <DialogDescription>
            Define rules for this {isOptionLevel ? "option" : "attribute"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <Select
              value={localRule.action}
              onValueChange={(value) => setLocalRule({
                ...localRule, action: value
              })}

            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="SHOW">Show</SelectItem>
                  <SelectItem value="HIDE">Hide</SelectItem>
              </SelectContent>
            </Select>
            <p>{isOptionLevel ? 'this option if': 'this attribute if'}</p>
            <Select
              value={localRule.logicOperator}
              onValueChange={(value) => setLocalRule({ ...localRule, logicOperator: value })}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">All</SelectItem>
                <SelectItem value="OR">Any</SelectItem>
              </SelectContent>
            </Select>
            <p>of the following matches</p>
          </div>
          <div className="space-y-2">
            {localRule.conditions.map((condition) => (
              <div key={condition.conditionId} className="flex items-center space-x-2 p-2 border rounded-md">
                <Select
                  value={condition.evaluatedAttributeId.toString()}
                  onValueChange={(value) => updateCondition(condition.conditionId.toString(), 'evaluatedAttributeId', value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr.attributeId} value={attr.attributeId.toString()}>
                        {attr.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(condition.conditionId.toString(), 'operator', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperators(attributes.find(attr => attr.attributeId.toString() == condition.evaluatedAttributeId)?.type || '').map((op) => (
                      <SelectItem key={op} value={op}>
                        {op.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={condition.value1}
                  onChange={(e) => updateCondition(condition.conditionId.toString(), 'value1', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeCondition(condition.conditionId.toString())}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addCondition} className="w-1/2">
            <Plus className="mr-2 h-4 w-4" /> Add Condition
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setIsOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

