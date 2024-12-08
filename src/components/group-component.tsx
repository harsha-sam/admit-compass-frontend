import React, { useCallback, memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Copy, Plus, GripVertical } from 'lucide-react'
import { Group, Rule, Attribute, Ruleset } from './types'
import RuleComponent from './rule-component'

interface GroupComponentProps {
  group: Group
  attributes: Attribute[]
  isRoot: boolean
  updateRuleset: (ruleset: Ruleset) => void
  ruleset: Ruleset
}

const GroupComponent: React.FC<GroupComponentProps> = memo(({
  group,
  attributes,
  isRoot,
  updateRuleset,
  ruleset,
}) => {
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({ id: group.id })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: group.id,
  })

  const setRef = (el: HTMLElement | null) => {
    setSortableRef(el)
    setDroppableRef(el)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const updateGroup = useCallback((groupId: string, updates: Partial<Group>) => {
    const newRootGroup = updateGroupInGroup(ruleset.rootGroup, groupId, updates)
    if (JSON.stringify(newRootGroup) !== JSON.stringify(ruleset.rootGroup)) {
      updateRuleset({ ...ruleset, rootGroup: newRootGroup })
    }
  }, [ruleset, updateRuleset])

  const addRule = useCallback((groupId: string) => {
    const newRule: Rule = {
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      attributeId: attributes[0]?.attributeId.toString() || '',
      condition: "equals",
      value: "",
      operation: "add",
      points: 0,
    }
    const newRootGroup = addRuleToGroup(ruleset.rootGroup, groupId, newRule)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [attributes, ruleset, updateRuleset])

  const addGroup = useCallback((parentGroupId: string) => {
    const newGroup: Group = {
      id: `group-${Math.random().toString(36).substr(2, 9)}`,
      combinator: "AND",
      rules: [],
    }
    const newRootGroup = addGroupToGroup(ruleset.rootGroup, parentGroupId, newGroup)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const removeGroup = useCallback((groupId: string) => {
    const newRootGroup = removeGroupFromGroup(ruleset.rootGroup, groupId)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const cloneGroup = useCallback((group: Group) => {
    const cloneGroupRecursive = (g: Group): Group => ({
      ...g,
      id: `group-${Math.random().toString(36).substr(2, 9)}`,
      rules: g.rules.map(item => 
        isGroup(item) ? cloneGroupRecursive(item) : { ...item, id: `rule-${Math.random().toString(36).substr(2, 9)}` }
      ),
    })
    const clonedGroup = cloneGroupRecursive(group)
    const newRootGroup = addGroupToGroup(ruleset.rootGroup, ruleset.rootGroup.id, clonedGroup)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const renderGroupContent = () => (
    <Card className="p-4 mb-4 bg-gray-800 text-white">
      <CardContent>
        <div className="flex items-center mb-4">
          {!isRoot && (
            <div {...listeners} {...sortableAttributes}>
              <GripVertical className="text-gray-400 mr-2 cursor-move" />
            </div>
          )}
          <Select
            value={group.combinator}
            onValueChange={(value) => updateGroup(group.id, { combinator: value as "AND" | "OR" })}
          >
            <SelectTrigger className="w-[100px] bg-gray-700 text-white">
              <SelectValue placeholder="Combinator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
          {!isRoot && (
            <Button variant="destructive" size="icon" className="ml-2" onClick={() => removeGroup(group.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" size="icon" className="ml-2" onClick={() => cloneGroup(group)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {group.rules.map((rule) => (
            <React.Fragment key={rule.id}>
              {isGroup(rule) ? (
                <GroupComponent
                  group={rule}
                  attributes={attributes}
                  isRoot={false}
                  updateRuleset={updateRuleset}
                  ruleset={ruleset}
                />
              ) : (
                <RuleComponent
                  rule={rule}
                  attributes={attributes}
                  updateRuleset={updateRuleset}
                  ruleset={ruleset}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 space-x-2">
          <Button variant="secondary" size="sm" onClick={() => addRule(group.id)}>
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
          <Button variant="secondary" size="sm" onClick={() => addGroup(group.id)}>
            <Plus className="h-4 w-4 mr-2" /> Add Group
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (isRoot) {
    return renderGroupContent()
  }

  return (
    <div ref={setRef} style={style}>
      {renderGroupContent()}
    </div>
  )
})

GroupComponent.displayName = "GroupComponent"
export default GroupComponent

// Helper functions
const updateGroupInGroup = (group: Group, groupId: string, updates: Partial<Group>): Group => {
  if (group.id === groupId) {
    return { ...group, ...updates }
  }
  return {
    ...group,
    rules: group.rules.map((item) =>
      isGroup(item) ? updateGroupInGroup(item, groupId, updates) : item
    ),
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

const addGroupToGroup = (parentGroup: Group, groupId: string, newGroup: Group): Group => {
  if (parentGroup.id === groupId) {
    return { ...parentGroup, rules: [...parentGroup.rules, newGroup] }
  }
  return {
    ...parentGroup,
    rules: parentGroup.rules.map((item) =>
      isGroup(item) ? addGroupToGroup(item, groupId, newGroup) : item
    ),
  }
}

const removeGroupFromGroup = (group: Group, groupId: string): Group => {
  return {
    ...group,
    rules: group.rules
      .filter((item) => !isGroup(item) || item.id !== groupId)
      .map((item) => isGroup(item) ? removeGroupFromGroup(item, groupId) : item),
  }
}

const isGroup = (item: Rule | Group): item is Group => {
  return ((item as Group).combinator !== undefined && (item as Group).combinator != null)
}

