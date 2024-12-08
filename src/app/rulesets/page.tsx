"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Ruleset {
  rulesetId: number
  name: string
  description: string
}

export default function RulesetsPage() {
  const [rulesets, setRulesets] = useState<Ruleset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchRulesets()
  }, [])

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

  const filteredRulesets = rulesets.filter(
    (ruleset) =>
      ruleset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruleset.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (rulesetId: number) => {
    router.push(`/rulesets/${rulesetId}/edit`)
  }

  const handleDelete = async (rulesetId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/rulesets/${rulesetId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Ruleset deleted successfully!",
        })
        fetchRulesets()
      } else {
        throw new Error("Failed to delete ruleset")
      }
    } catch (error) {
      console.error("Error deleting ruleset:", error)
      toast({
        title: "Error",
        description: "Failed to delete ruleset. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rulesets</h1>
        <Button onClick={() => router.push("/rulesets/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Ruleset
        </Button>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search rulesets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRulesets.map((ruleset) => (
            <TableRow key={ruleset.rulesetId}>
              <TableCell>{ruleset.name}</TableCell>
              <TableCell>{ruleset.description}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(ruleset.rulesetId)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(ruleset.rulesetId)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

