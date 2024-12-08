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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Attribute {
  attributeId: number
  name: string
  description: string
  displayName: string
  type: string
  categoryId: number | null
  category?: Category
}

interface Category {
  categoryId: number
  name: string
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/attributes`)
      if (response.ok) {
        const data = await response.json()
      
        setAttributes(data)
      } else {
        throw new Error("Failed to fetch attributes")
      }
    } catch (error) {
      console.error("Error fetching attributes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attributes. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/attribute-categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error("Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const filteredAttributes = attributes.filter(
    (attribute) =>
      (selectedCategory === null || attribute.categoryId?.toString() === selectedCategory) &&
      (attribute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attribute.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEdit = (attributeId: number) => {
    router.push(`/attributes/${attributeId}/edit`)
  }

  const handleDelete = async (attributeId: number) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/attributes/${attributeId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Attribute deleted successfully!",
        })
        fetchAttributes()
      } else {
        throw new Error("Failed to delete attribute")
      }
    } catch (error) {
      console.error("Error deleting attribute:", error)
      toast({
        title: "Error",
        description: "Failed to delete attribute. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attributes</h1>
        <Button onClick={() => router.push("/attributes/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Attribute
        </Button>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search attributes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Display Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttributes.map((attribute) => (
            <TableRow key={attribute.attributeId}>
              <TableCell>{attribute.displayName}</TableCell>
              <TableCell>{attribute.name}</TableCell>
              <TableCell>{attribute.type[0].toUpperCase() + attribute.type.slice(1).toLowerCase()}</TableCell>
              <TableCell>{attribute.category?.name || "Uncategorized"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(attribute.attributeId)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(attribute.attributeId)}>
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

