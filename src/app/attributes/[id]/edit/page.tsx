"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AttributeForm, AttributeFormData } from "@/components/attribute-form"
import { useToast } from "@/components/ui/use-toast"

export default function EditAttributePage({ params }: { params: { id: string } }) {
  const [attribute, setAttribute] = useState<AttributeFormData | null>(null)
  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAttribute()
    fetchCategories()
    fetchAttributes()
  }, [])

  const fetchAttribute = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/attributes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAttribute(data)
      } else {
        throw new Error("Failed to fetch attribute")
      }
    } catch (error) {
      console.error("Error fetching attribute:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attribute. Please try again later.",
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

  const handleSubmit = async (data: AttributeFormData) => {
    try {
      const newData = {
        ...data,
        rules: [data.rule]
      }
      delete newData["rule"]
      const response = await fetch(`${process.env.BASE_URL}/api/attributes/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attribute updated successfully!",
        })
        router.push("/attributes")
      } else {
        throw new Error("Failed to update attribute")
      }
    } catch (error) {
      console.error("Error updating attribute:", error)
      toast({
        title: "Error",
        description: "Failed to update attribute. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!attribute) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Attribute</h1>
      <AttributeForm
        initialData={attribute}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/attributes")}
        categories={categories}
        attributes={attributes}
        isEdit={true}
      />
    </div>
  )
}

