import React, { useState, useCallback } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Group, Rule, Attribute, Ruleset } from './types'
import GroupComponent from './group-component'
import RuleComponent from './rule-component'
import { findItemById, removeItem, insertItem, canDropItem } from '../lib/dnd-utils'

interface RulesBuilderProps {
  attributes: Attribute[]
  initialRuleset: Ruleset
  onChange: (ruleset: Ruleset) => void
}

const RulesBuilder: React.FC<RulesBuilderProps> = ({ attributes, initialRuleset, onChange }) => {
  const [ruleset, setRuleset] = useState<Ruleset>(initialRuleset)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const updateRuleset = useCallback((newRuleset: Ruleset) => {
    setRuleset(newRuleset)
    onChange(newRuleset)
  }, [onChange])

  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const activeItem = findItemById(ruleset.rootGroup.rules, active.id)
      const overItem = findItemById(ruleset.rootGroup.rules, over.id)

      if (activeItem && overItem) {
        if (canDropItem(activeItem.item, overItem.item)) {
          const newRules = removeItem(ruleset.rootGroup.rules, activeItem.path)
          const updatedRules = insertItem(newRules, activeItem.item, overItem.path)

          // Only update if the rules have actually changed
          if (JSON.stringify(updatedRules) !== JSON.stringify(ruleset.rootGroup.rules)) {
            updateRuleset({
              ...ruleset,
              rootGroup: {
                ...ruleset.rootGroup,
                rules: updatedRules,
              },
            })
          }
        }
      }
    }

    setActiveId(null)
  }

  // Removed handleDragOver function

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ruleset.rootGroup.rules.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <GroupComponent
          group={ruleset.rootGroup}
          attributes={attributes}
          isRoot={true}
          updateRuleset={updateRuleset}
          ruleset={ruleset}
        />
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50">
            {findItemById(ruleset.rootGroup.rules, activeId)?.item.id.startsWith('group') ? (
              <GroupComponent
                group={findItemById(ruleset.rootGroup.rules, activeId)?.item as Group}
                attributes={attributes}
                isRoot={false}
                updateRuleset={updateRuleset}
                ruleset={ruleset}
              />
            ) : (
              <RuleComponent
                rule={findItemById(ruleset.rootGroup.rules, activeId)?.item as Rule}
                attributes={attributes}
                updateRuleset={updateRuleset}
                ruleset={ruleset}
              />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default RulesBuilder
