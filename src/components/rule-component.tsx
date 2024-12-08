import React, { useCallback, memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Trash2, Copy, GripVertical } from 'lucide-react'
import { Rule, Attribute, Ruleset, Group } from './types'

interface RuleComponentProps {
  rule: Rule
  attributes: Attribute[]
  updateRuleset: (ruleset: Ruleset) => void
  ruleset: Ruleset
}

const RuleComponent: React.FC<RuleComponentProps> = memo(({
  rule,
  attributes,
  updateRuleset,
  ruleset,
}) => {
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: rule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const attribute = attributes.find((a) => a.attributeId.toString() == rule.attributeId)
  const conditions = getConditions(attribute?.type || '')

  const updateRule = useCallback((ruleId: string, updates: Partial<Rule>) => {
    const newRootGroup = updateRuleInGroup(ruleset.rootGroup, ruleId, updates)
    if (JSON.stringify(newRootGroup) !== JSON.stringify(ruleset.rootGroup)) {
      updateRuleset({ ...ruleset, rootGroup: newRootGroup })
    }
  }, [ruleset, updateRuleset])

  const removeRule = useCallback((ruleId: string) => {
    const newRootGroup = removeRuleFromGroup(ruleset.rootGroup, ruleId)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const cloneRule = useCallback((rule: Rule) => {
    const clonedRule = { ...rule, id: `rule-${Math.random().toString(36).substr(2, 9)}` }
    const newRootGroup = addRuleToGroup(ruleset.rootGroup, ruleset.rootGroup.id, clonedRule)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-1 bg-gray-700 p-1 rounded border border-gray-600"
    >
      <div {...listeners} {...sortableAttributes}>
        <GripVertical className="text-gray-400 h-4 w-4 cursor-move" />
      </div>
      <Select
        value={rule.attributeId.toString()}
        onValueChange={(value) => updateRule(rule.id, { attributeId: value })}
      >
        <SelectTrigger className="w-[150px] h-8 text-sm bg-gray-600 text-white">
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
        value={rule.condition}
        onValueChange={(value) => updateRule(rule.id, { condition: value })}
      >
        <SelectTrigger className="w-[120px] h-8 text-sm bg-gray-600 text-white">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          {conditions.map((condition) => (
            <SelectItem key={condition} value={condition}>
              {condition.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="text"
        value={rule.value}
        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        placeholder="Value"
        className="w-[100px] h-8 text-sm bg-gray-600 text-white"
      />
      <Select
        value={rule.operation}
        onValueChange={(value) => updateRule(rule.id, { operation: value as "add" | "subtract" | "multiply" | "divide" })}
      >
        <SelectTrigger className="w-[150px] h-8 text-sm bg-gray-600 text-white">
          <SelectValue placeholder="Select operation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="add">Increase score by</SelectItem>
          <SelectItem value="subtract">Decrease score by</SelectItem>
          <SelectItem value="multiply">Multiply score by</SelectItem>
          <SelectItem value="divide">Divide score by</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        value={rule.points}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value) || 0
          if (rule.operation === "divide" && newValue === 0) {
            alert("Cannot divide by zero. Please enter a non-zero value.")
            return
          }
          updateRule(rule.id, { points: newValue })
        }}
        placeholder="Points"
        className="w-[80px] h-8 text-sm bg-gray-600 text-white"
      />
      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeRule(rule.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => cloneRule(rule)}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
})

RuleComponent.displayName = "RuleComponent"
export default RuleComponent

// Helper functions
const getConditions = (attributeType: string) => {
  switch (attributeType) {
    case 'singleLineText':
    case 'multiLineText':
      return ['equals', 'not_equals', 'contains', 'not_contains']
    case 'dropdown':
    case 'multiselect':
      return ['equals', 'not_equals', 'contains', 'not_contains']
    case 'number':
    case 'date':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal']
    default:
      return ['equals', 'not_equals']
  }
}

const updateRuleInGroup = (group: Group, ruleId: string, updates: Partial<Rule>): Group => {
  return {
    ...group,
    rules: group.rules.map((item) => {
      if (isGroup(item)) {
        return updateRuleInGroup(item, ruleId, updates)
      }
      if (item.id === ruleId) {
        return { ...item, ...updates }
      }
      return item
    }),
  }
}

const removeRuleFromGroup = (group: Group, ruleId: string): Group => {
  return {
    ...group,
    rules: group.rules
      .filter((item) => {
        if (isGroup(item)) {
          return true; // Keep all groups
        }
        return item.id !== ruleId; // Remove only the specific rule
      })
      .map((item) => isGroup(item) ? removeRuleFromGroup(item, ruleId) : item),
  }
}

const addRuleToGroup = (group: Group, groupId: string, rule: Rule): Group => {
  if (group.id === groupId) {
    return { ...group, rules: [...group.rules, rule] }
  }
  return {
    ...group,
    rules: group.rules.map((item) =>
      isGroup(item) ? addRuleToGroup(item, groupId, rule) : item
    ),
  }
}

const isGroup = (item: Rule | Group): item is Group => {
  return (item as Group).combinator !== undefined && (item as Group).combinator !== null
}

