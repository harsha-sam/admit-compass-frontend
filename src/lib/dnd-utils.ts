import { UniqueIdentifier } from "@dnd-kit/core";
import { Group, Rule } from "@/components/types";

export const findItemById = (
  items: (Group | Rule)[],
  id: UniqueIdentifier
): { item: Group | Rule; path: number[] } | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === id) {
      return { item, path: [i] };
    }
    if ('rules' in item) {
      const result = findItemById(item.rules, id);
      if (result) {
        return { item: result.item, path: [i, ...result.path] };
      }
    }
  }
  return null;
};

export const removeItem = (items: (Group | Rule)[], path: number[]): (Group | Rule)[] => {
  const newItems = [...items];
  let current = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    if ('rules' in current[path[i]]) {
      current = (current[path[i]] as Group).rules;
    } else {
      throw new Error("Invalid path");
    }
  }
  current.splice(path[path.length - 1], 1);
  return newItems;
};

export const insertItem = (
  items: (Group | Rule)[],
  item: Group | Rule,
  path: number[]
): (Group | Rule)[] => {
  const newItems = [...items];
  let current = newItems;
  for (let i = 0; i < path.length - 1; i++) {
    if ('rules' in current[path[i]]) {
      current = (current[path[i]] as Group).rules;
    } else {
      throw new Error("Invalid path");
    }
  }
  current.splice(path[path.length - 1], 0, item);
  return newItems;
};

export const canDropItem = (
  draggingItem: Group | Rule,
  targetItem: Group | Rule
): boolean => {
  // Prevent dropping a group into itself or its descendants
  if ('rules' in draggingItem) {
    let current = targetItem;
    while ('rules' in current) {
      if (current.id === draggingItem.id) {
        return false;
      }
      current = current.rules[0] as Group;
    }
  }
  return true;
};

