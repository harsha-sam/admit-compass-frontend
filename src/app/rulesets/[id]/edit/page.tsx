"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Ruleset, Attribute } from '@/components/types'
import RulesBuilder from '@/components/rules-builder'
import { AttributeImporter } from '@/components/attribute-importer'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DynamicRulesetForm } from "@/components/dynamic-ruleset-form"

const transformToRulesetFormat = (data: any, parentRuleId: number | null = null) => {
  const transformRule = (rule: any): any => {
    const { combinator, rules, operation, points, ...conditions } = rule;
    const transformedConditions = rule.attributeId
      ? [{
          evaluatedAttributeId: rule.attributeId,
          operator: rule.condition,
          value1: rule.value || '',
          value2: null,
        }]
      : [];
    
    return {
      logicOperator: combinator || null,
      action: {
        operation: operation || null,
        points: points || 0,
      },
      conditions: transformedConditions,
      childRules: rules ? rules.map(transformRule) : [],
    };
  };

  return transformRule(data);
};

interface RuleCondition {
  conditionId: number;
  ruleId: number;
  evaluatedAttributeId: number;
  operator: string;
  value1: string;
  value2: string | null;
}

interface Rule {
  ruleId: number;
  parentRuleId: number | null;
  logicOperator: string | null;
  action?: {
    operation: string | null;
    points: number | null;
  };
  conditions: RuleCondition[];
  rules: Rule[]; // Nested rules
}

interface Group {
  id: string;
  combinator: string;
  rules: RuleComponentFormat[]; // Match RuleComponent format
}

interface RuleComponentFormat {
  id: string;
  combinator: string | null;
  rules: RuleComponentFormat[];
  attributeId: number | null;
  condition: string | null;
  value: string;
  operation: string | null;
  points: number;
}

const convertFlatRulesToRootGroup = (flatRules: Rule[]): Group => {
  // Create a map of rules by ruleId for quick lookup
  const ruleMap: Record<number, Rule> = {};
  flatRules.forEach((rule) => {
    ruleMap[rule.ruleId] = { ...rule, rules: [] }; // Initialize each rule with an empty rules array
  });

    // Build the hierarchical structure
  const rootGroup: { id: string; combinator: "AND" | "OR", rules: any[]} = {
    id: "root",
    combinator: "AND",
    rules: [],
  };

  flatRules.forEach((rule) => {
    if (rule.parentRuleId === null) {
      // Root-level rules go directly into rootGroup
      if (rule.ruleId in ruleMap) {        
        rootGroup.rules.push(ruleMap[rule.ruleId]);
      }
    } else {
      // Nest rules under their respective parents
      if (ruleMap[rule.parentRuleId]) {
        ruleMap[rule.parentRuleId].rules.push(ruleMap[rule.ruleId]);
      }
    }
  });

  // Transform to match the expected format for RuleComponent
  const transformRule = (rule: any) => {
    const firstCondition = rule.conditions?.[0]; // Take the first condition if available
    return {
      id: rule.ruleId.toString(),
      combinator: rule.logicOperator || null,
      rules: rule.rules.map(transformRule), // Recursively transform child rules
      attributeId: firstCondition?.evaluatedAttributeId || null,
      condition: firstCondition?.operator || null,
      value: firstCondition?.value1 || '',
      operation: rule.action?.operation || null,
      points: rule.action?.points || 0,
    };
  };


  rootGroup.rules = rootGroup.rules.map(transformRule);

  if (rootGroup.rules.length) {
    return rootGroup.rules[0];
  }
  return rootGroup
};

export default function EditRuleset({ params }: { params: { id: string } }) {
  const [ruleset, setRuleset] = useState<Ruleset>({
    name: '',
    description: '',
    baseWeight: 0,
    rootGroup: {
      id: "root",
      combinator: "AND",
      rules: [],
    },
  })
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [formOrder, setFormOrder] = useState<number[]>([])
  const [programs, setPrograms] = useState([])
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const router = useRouter()
  const methods = useForm()
  
  useEffect(() => {
    const fetchRuleset = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/api/rulesets/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch ruleset')
        }
        const data = await response.json()
        setRuleset({
          ...data,
          rootGroup: convertFlatRulesToRootGroup(data.rules)
        })
        setAttributes(data.attributes || [])
        setFormOrder(data.formOrder || [])
        setSelectedPrograms(data.selectedPrograms || [])
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching ruleset:', error)
        toast({
          title: "Error",
          description: "Failed to fetch ruleset. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchRuleset()
    fetchPrograms()
  }, [params.id, toast])

  const handleUpdateRuleset = async (formData: any) => {
    if (!ruleset.name) {
      toast({
        title: "Error",
        description: "Please enter a ruleset name",
        variant: "destructive",
      })
      return
    }

    if (attributes.length === 0) {
      toast({
        title: "Error",
        description: "Please import attributes to use in the ruleset",
        variant: "destructive",
      })
      return
    }

    const payload = {
      name: ruleset.name,
      baseWeight: ruleset.baseWeight,
      description: ruleset.description,
      attributes,
      formOrder,
      selectedPrograms,
      rules: [transformToRulesetFormat(ruleset.rootGroup)]
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/rulesets/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update ruleset')
      }

      toast({
        title: "Success",
        description: "Ruleset updated successfully",
      })
      router.push('/rulesets')
    } catch (error) {
      console.error('Error updating ruleset:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update ruleset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = (newAttribute: Attribute) => {
    setAttributes(prev => {
      if (prev.some((attr) => attr.attributeId === newAttribute.attributeId)) {
        return prev
      }
      const updatedAttributes = [...prev, newAttribute]
      setFormOrder(updatedAttributes.map((_, index) => index))
      return updatedAttributes
    })

    toast({
        title: "Success",
        description: `Imported ${newAttribute.displayName} and the attributes it depends on`
      })
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/programs`)
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.map((program: any) => ({ id: program.programId, name: program.name })))
      } else {
        throw new Error('Failed to fetch programs')
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch programs. Please try again later.",
        variant: "destructive",
      })
      setPrograms([])
    }
  }

  const handleRemove = (attributeId: number) => {
    setAttributes(prev => {
      const updatedAttributes = prev.filter(attr => attr.attributeId !== attributeId)
      setFormOrder(updatedAttributes.map((_, index) => index))
      return updatedAttributes
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-4xl font-bold">Edit Ruleset</h1>
      <Separator />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="ruleset-name" className="text-lg">Ruleset Name</Label>
            <Input
              id="ruleset-name"
              value={ruleset.name}
              onChange={(e) => setRuleset(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter ruleset name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ruleset-description" className="text-lg">Description</Label>
          <Textarea
            id="ruleset-description"
            value={ruleset.description}
            onChange={(e) => setRuleset(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter ruleset description"
            rows={4}
          />
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="attributes" className="w-full">
        <TabsList>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="rules">Rules Builder</TabsTrigger>
          <TabsTrigger value="preview">Form Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="attributes" className="mt-6">
          <AttributeImporter
            onImport={handleImport}
            onRemove={handleRemove}
            selectedAttributes={attributes}
          />
        </TabsContent>
        <TabsContent value="rules" className="mt-6">
          <RulesBuilder
            attributes={attributes}
            initialRuleset={ruleset}
            onChange={(updatedRuleset) => setRuleset(updatedRuleset)}
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-6">
          <DynamicRulesetForm
            attributes={attributes}
            formOrder={formOrder}
          />
        </TabsContent>
      </Tabs>
      <Button type="submit" onClick={(e) => {
        e.preventDefault();
        handleUpdateRuleset(ruleset)
      }}
      >Update Ruleset</Button>
    </div>
  )
}

