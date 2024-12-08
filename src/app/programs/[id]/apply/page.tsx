"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DynamicRulesetForm } from "@/components/dynamic-ruleset-form"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"


const formatProgramCategory = (category: string) => {
  switch (category.toUpperCase()) {
    case 'BACHELOR':
      return "Bachelor's";
    case 'MASTER':
      return "Master's";
    case 'PHD':
      return 'Ph.D.';
    default:
      return category;
  }
};

interface Attribute {
  attributeId: number
  name: string
  displayName: string
  type: string
  options?: { label: string; value: string }[]
  validationRule?: {
    required?: boolean
    min?: number
    max?: number
  }
}

interface Ruleset {
  id: number
  name: string
  description: string
  attributes: Attribute[]
  formOrder: number[]
}

interface Program {
  programId: number
  name: string
  description: string
  rulesetId: number
  programCategory: string;
  programType: string;
}

export default function ApplyPage() {
  const [program, setProgram] = useState<Program | null>(null)
  const [ruleset, setRuleset] = useState<Ruleset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProgramAndRuleset = async () => {
      try {
        // Fetch program data
        const programResponse = await fetch(`http://localhost:8000/api/programs/${id}`)
        if (!programResponse.ok) {
          throw new Error('Failed to fetch program')
        }
        const programData = await programResponse.json()
        setProgram(programData)

        // Fetch ruleset data
        const rulesetResponse = await fetch(`http://localhost:8000/api/rulesets/${programData.rulesetId}`)
        if (!rulesetResponse.ok) {
          throw new Error('Failed to fetch ruleset')
        }
        const rulesetData = await rulesetResponse.json()
        setRuleset(rulesetData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load application form. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgramAndRuleset()
  }, [id, toast])

  const handleSubmit = async (data: any) => {
    try {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', data)
      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!program || !ruleset) {
    return <div>Program or ruleset not found.</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{formatProgramCategory(program.programCategory)} in {program.name} Application</CardTitle>
          <CardDescription>
            Degree Type: {program.programType}
          </CardDescription>
          <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
        </CardHeader>
        <CardContent>
          <DynamicRulesetForm
            attributes={ruleset.attributes}
            formOrder={ruleset.formOrder}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

