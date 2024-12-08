export interface Attribute {
  attributeId: number
  name: string
  description?: string
  displayName: string
  type: string
  categoryId?: number | null
  category?: Category
  rules?: any
  options?: any
  dependsOn?: Attribute[]
  validationRule?: any
}

interface Category {
  categoryId: number
  name: string
}

export interface Rule {
  id: string;
  attributeId: string;
  condition: string;
  value: string;
  operation: string;
  points: number
}

export interface Group {
  id: string;
  combinator: "AND" | "OR";
  rules: (Rule | Group)[];
}

export interface Ruleset {
  id?: string;
  name: string;
  baseWeight: number;
  description: string;
  rootGroup: Group;
}

export interface ApiRuleset {
  rules: any[];
}

