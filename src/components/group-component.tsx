import React, { useCallback } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
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
  index: number
}

const GroupComponent: React.FC<GroupComponentProps> = ({
  group,
  attributes,
  isRoot,
  updateRuleset,
  ruleset,
  index,
}) => {
  const updateGroup = useCallback((groupId: string, updates: Partial<Group>) => {
    const newRootGroup = updateGroupInGroup(ruleset.rootGroup, groupId, updates)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const addRule = useCallback((groupId: string) => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
      rules: g.rules.map(item => 
        isGroup(item) ? cloneGroupRecursive(item) : { ...item, id: Math.random().toString(36).substr(2, 9) }
      ),
    })
    const clonedGroup = cloneGroupRecursive(group)
    const newRootGroup = addGroupToGroup(ruleset.rootGroup, ruleset.rootGroup.id, clonedGroup)
    updateRuleset({ ...ruleset, rootGroup: newRootGroup })
  }, [ruleset, updateRuleset])

  const renderGroupContent = (dragHandleProps?: any) => (
    <Card className="p-4 mb-4 bg-gray-800 text-white">
      <CardContent>
        <div className="flex items-center mb-4">
          {!isRoot && (
            <div {...dragHandleProps}>
              <GripVertical className="text-gray-400 mr-2" />
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
        <Droppable droppableId={group.id} type="RULE">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {group.rules.map((rule, index) => (
                <React.Fragment key={rule.id}>
                  {isGroup(rule) ? (
                    <GroupComponent
                      group={rule}
                      attributes={attributes}
                      isRoot={false}
                      updateRuleset={updateRuleset}
                      ruleset={ruleset}
                      index={index}
                    />
                  ) : (
                    <RuleComponent
                      rule={rule}
                      attributes={attributes}
                      updateRuleset={updateRuleset}
                      ruleset={ruleset}
                      index={index}
                    />
                  )}
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
    <Draggable draggableId={group.id} index={index} type="GROUP">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          {renderGroupContent(provided.dragHandleProps)}
        </div>
      )}
    </Draggable>
  )
}

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

