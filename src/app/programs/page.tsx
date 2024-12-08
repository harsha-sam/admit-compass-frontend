"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProgramForm, ProgramFormData } from "@/components/program-form"
import { useToast } from "@/components/ui/use-toast"
import { SignedOut, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

interface Program extends ProgramFormData {
  programId: number
  rubricId: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [rulesets, setRulesets] = useState<any[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null)
  const { toast } = useToast()
  const { isSignedIn } = useUser();

  useEffect(() => {
    fetchPrograms()
    fetchRulesets()
  }, [])

  useEffect(() => {
    const results = programs.filter(program =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programCategory.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPrograms(results)
  }, [searchTerm, programs])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
        setFilteredPrograms(data)
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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRulesets = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/rulesets")
      if (response.ok) {
        const data = await response.json()
        setRulesets(data)
      } else {
        throw new Error("Failed to fetch rulesets")
      }
    } catch (error) {
      console.error("Error fetching rulesets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch rulesets. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSubmitProgram = async (data: ProgramFormData) => {
    try {
      const url = currentProgram
        ? `http://localhost:8000/api/programs/${currentProgram.programId}`
        : 'http://localhost:8000/api/programs'
      const method = currentProgram ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          rulesetId: data.rulesetId? parseInt(data.rulesetId) : null
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Program ${currentProgram ? 'updated' : 'created'} successfully!`,
        })
        setIsDialogOpen(false)
        setCurrentProgram(null)
        fetchPrograms()
      } else {
        throw new Error(`Failed to ${currentProgram ? 'update' : 'create'} program`)
      }
    } catch (error) {
      console.error(`Error ${currentProgram ? 'updating' : 'creating'} program:`, error)
      toast({
        title: "Error",
        description: `Failed to ${currentProgram ? 'update' : 'create'} program. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteProgram = async (programId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/programs/${programId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Program deleted successfully!",
        })
        fetchPrograms()
      } else {
        throw new Error('Failed to delete program')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">UMBC Engineering Programs</h1>
      
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-lg text-muted-foreground">
          <span className="font-semibold text-foreground">Admit Compass</span> {`is your digital mentor, designed to help prospective students assess their chances of admission to UMBC's prestigious engineering programs. Whether you're aiming for an undergraduate or graduate degree, AdmitCompass guides you through the application process, providing personalized insights into program requirements and offering an estimated acceptance rate based on your qualifications. This tool helps you understand where you stand in your journey towards admission, giving you the confidence to make informed decisions.`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="relative w-full max-w-xl">
          <Input
            type="text"
            placeholder="Search programs by name or program category or type..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {isSignedIn ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentProgram(null)}>
                <Plus className="mr-2 h-4 w-4" /> Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{currentProgram ? "Edit" : "Create New"} Program</DialogTitle>
                <DialogDescription>
                  {`Enter the details for the ${currentProgram ? "existing" : "new"} program. Click save when you're done.`}
                </DialogDescription>
              </DialogHeader>
              <ProgramForm 
                onSubmit={handleSubmitProgram}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setCurrentProgram(null)
                }}
                rulesets={rulesets}
                initialData={currentProgram || undefined}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <SignInButton>
            <Button>Sign In to Create Program</Button>
          </SignInButton>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredPrograms.map((program) => (
            <Card key={program.programId} className="w-full flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{program.name}</CardTitle>
                <a href={program.umbcLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="link" size={"default"}>Program Info &#8599;</Button>
                </a>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                  <p className="text-sm font-medium mb-2">Degree: {program.programType}</p>
                  <p className="text-sm font-medium mb-4">Degree Category: {program.programCategory}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <SignedOut>
                      <Link href={`/programs/${program.programId}/apply`}>
                        <Button variant="outline" size="sm">Apply</Button>
                      </Link>
                    </SignedOut>
                  {isSignedIn && (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentProgram(program)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              program and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProgram(program.programId)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredPrograms.length === 0 && (
        <p className="text-center text-lg text-muted-foreground mt-8">
          No programs found matching your search.
        </p>
      )}
    </div>
  )
}

