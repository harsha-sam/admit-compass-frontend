"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AttributeForm, AttributeFormData } from "@/components/attribute-form"
import { useToast } from "@/components/ui/use-toast"

export default function CreateAttributePage() {
  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchAttributes()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/attribute-categories")
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
      const response = await fetch("http://localhost:8000/api/attributes")
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
      delete newData["attributeId"]
      const response = await fetch("http://localhost:8000/api/attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attribute created successfully!",
        })
        router.push("/attributes")
      } else {
        throw new Error("Failed to create attribute")
      }
    } catch (error) {
      console.error("Error creating attribute:", error)
      toast({
        title: "Error",
        description: "Failed to create attribute. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create Attribute</h1>
      <AttributeForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/attributes")}
        categories={categories}
        attributes={attributes}
        isEdit={false}
      />
    </div>
  )
}

