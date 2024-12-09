"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {  Ruleset, Attribute } from '@/components/types'
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


export default function CreateRuleset() {
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
  
  const handleCreateRuleset = async (formData: any) => {
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
      // selectedPrograms,
      rules: [transformToRulesetFormat(ruleset.rootGroup)]
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/rulesets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create ruleset')
      }

      toast({
        title: "Success",
        description: "Ruleset created successfully",
      })
      router.push('/rulesets')
    } catch (error) {
      console.error('Error creating ruleset:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ruleset. Please try again.",
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

  useEffect(() => {
    fetchPrograms()
  }, [])


  const handleRemove = (attributeId: number) => {
    setAttributes(prev => {
      const updatedAttributes = prev.filter(attr => attr.attributeId !== attributeId)
      setFormOrder(updatedAttributes.map((_, index) => index))
      return updatedAttributes
    })
  }

  return <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-4xl font-bold">Create Ruleset</h1>
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
          {/* <div>
            <Label htmlFor="base-score" className="text-lg">Base Score</Label>
            <Input
              id="base-score"
              type="number"
              value={ruleset.baseWeight}
              onChange={(e) => setRuleset(prev => ({ ...prev, baseWeight: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter base score"
            />
          </div> */}
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
        {/* <div>
          <Label htmlFor="programs" className="text-lg">Associate to Programs</Label>
          {programs && programs.length > 0 ? (
            <MultiSelect
              options={programs && programs.map((program: any) => ({ label: program.name, value: program.id }))}
              onValueChange={setSelectedPrograms}
               defaultValue={selectedPrograms}
              placeholder="Select programs"
              variant="inverted"
            />
          ) : (
            <p>Loading programs...</p>
          )}
        </div> */}
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
              // Here you can handle the form data along with the ruleset data
              handleCreateRuleset(ruleset)
      }}
      >Create Ruleset</Button>
    </div>
    </div>
}

