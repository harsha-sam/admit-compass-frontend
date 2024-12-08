"use client"

import React, { useState, useCallback } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { Group, Rule, Attribute, Ruleset } from './types'
import GroupComponent from './group-component'

interface RulesBuilderProps {
  attributes: Attribute[]
  initialRuleset: Ruleset
  onChange: (ruleset: Ruleset) => void
}

const RulesBuilder: React.FC<RulesBuilderProps> = ({ attributes, initialRuleset, onChange }) => {
  const [ruleset, setRuleset] = useState<Ruleset>(initialRuleset)

  const updateRuleset = useCallback((newRuleset: Ruleset) => {
    setRuleset(newRuleset)
    onChange(newRuleset)
  }, [onChange])

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    const newRuleset = { ...ruleset }
    const sourceGroup = findGroup(newRuleset.rootGroup, source.droppableId)
    const destGroup = findGroup(newRuleset.rootGroup, destination.droppableId)

    if (!sourceGroup || !destGroup) return

    if (type === 'GROUP') {
      const [movedGroup] = sourceGroup.rules.splice(source.index, 1) as [Group]
      destGroup.rules.splice(destination.index, 0, movedGroup)
    } else {
      const [movedItem] = sourceGroup.rules.splice(source.index, 1)
      destGroup.rules.splice(destination.index, 0, movedItem)
    }

    updateRuleset(newRuleset)
  }, [ruleset, updateRuleset])

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="root" type="GROUP">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <GroupComponent
              group={ruleset.rootGroup}
              attributes={attributes}
              isRoot={true}
              updateRuleset={updateRuleset}
              ruleset={ruleset}
              index={0}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default RulesBuilder

// Helper function
const findGroup = (group: Group, id: string): Group | null => {
  if (group.id === id) {
    return group
  }
  for (const rule of group.rules) {
    if (isGroup(rule)) {
      const found = findGroup(rule, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

const isGroup = (item: Rule | Group): item is Group => {
  return (item as Group).combinator !== undefined
}

