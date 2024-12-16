"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DynamicRulesetForm } from "@/components/dynamic-ruleset-form"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

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

interface EvaluationResult {
  acceptance: number;
  recommendation: string;
}

export default function ApplyPage() {
  const [program, setProgram] = useState<Program | null>(null)
  const [ruleset, setRuleset] = useState<Ruleset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const { id } = useParams()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProgramAndRuleset = async () => {
      try {
        // Fetch program data
        const programResponse = await fetch(`${process.env.BASE_URL}/api/programs/${id}`)
        if (!programResponse.ok) {
          throw new Error('Failed to fetch program')
        }
        const programData = await programResponse.json()
        setProgram(programData)

        // Fetch ruleset data
        const rulesetResponse = await fetch(`${process.env.BASE_URL}/api/rulesets/${programData.rulesetId}`)
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
    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/programs/${id}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      const result = await response.json()
      setEvaluationResult(result)
      toast({
        title: "Success",
        description: "Your application has been evaluated successfully!",
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
            isSubmitting={isSubmitting}
          />
        </CardContent>
        {isSubmitting && (
          <CardFooter>
            <div className="w-full flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardFooter>
        )}
        {evaluationResult && (
          <CardFooter className="flex flex-col items-start">
            <h3 className="text-lg font-semibold mb-2">Evaluation Result</h3>
            <p>{`You have ${evaluationResult.acceptance}% chance of admission`}</p>
            <p>Recommendation: {evaluationResult.recommendation || "Improve your GPA for a better admission chance"}</p>
            <Button className="mt-4" onClick={() => router.push('/programs')}>
              Back to Programs
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

