"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface AttributeCategory {
  categoryId: number | undefined
  name: string | ""
  description: string | ""
}

export default function AttributeCategoriesPage() {
  const [categories, setCategories] = useState<AttributeCategory[]>([])
  const [currentCategory, setCurrentCategory] = useState<AttributeCategory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleCreateOrUpdateCategory = async () => {
    if (!currentCategory) return

    const isUpdating = currentCategory.categoryId !== undefined
    const url = isUpdating
      ? `${process.env.API_BASE_URL}/api/attribute-categories/${currentCategory.categoryId}`
      : `${process.env.API_BASE_URL}/api/attribute-categories`
    
    const method = isUpdating ? "PATCH" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentCategory),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${isUpdating ? "updated" : "created"} successfully!`,
        })
        setIsDialogOpen(false)
        setCurrentCategory(null)
        fetchCategories()
      } else {
        throw new Error(`Failed to ${isUpdating ? "update" : "create"} category`)
      }
    } catch (error) {
      console.error(`Error ${isUpdating ? "updating" : "creating"} category:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isUpdating ? "update" : "create"} category. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/attribute-categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attribute Category deleted successfully!",
        })
        fetchCategories()
        setCurrentCategory(null)
      } else {
        throw new Error("Failed to delete attribute category. Ensure there are no existing attributes in this category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mr-6">Attribute Categories</h1>
        <Button onClick={() => {
          setCurrentCategory({ name: "", description: "", categoryId: undefined })
          setIsDialogOpen(true)
        }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Category
        </Button>
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
          {categories.map((category) => (
            <TableRow key={category.categoryId}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentCategory(category)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.categoryId!)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory?.categoryId ? "Edit" : "Create New"} Category</DialogTitle>
            <DialogDescription>
              Enter the details for the attribute category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentCategory?.name || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory!, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={currentCategory?.description || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory!, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateOrUpdateCategory}>
              {currentCategory?.categoryId ? "Update" : "Create"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

