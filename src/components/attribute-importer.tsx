import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Attribute } from '@/components/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface AttributeImporterProps {
  selectedAttributes: Attribute[]
  onImport: (attribute: Attribute) => void
  onRemove: (attributeId: number) => void
}

export function AttributeImporter({ onImport, onRemove, selectedAttributes }: AttributeImporterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [filteredAttributes, setFilteredAttributes] = useState<Attribute[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchAttributes()
  }, [])

  useEffect(() => {
    const filtered = allAttributes.filter(attr =>
      (attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.displayName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !selectedAttributes.some(selected => selected.attributeId === attr.attributeId)
    )
    setFilteredAttributes(filtered)
  }, [searchTerm, allAttributes, selectedAttributes])

  const fetchAttributes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/attributes")
      if (response.ok) {
        const data = await response.json()
        setAllAttributes(data)
        setFilteredAttributes(data)
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

  const handleImport = (attribute: Attribute) => {
    let dependentAttrIds: number[] = []
    if (attribute.rules && attribute.rules.length > 0) {
      const rule = attribute.rules[0]
      if (rule.conditions && rule.conditions.length > 0) {
        rule.conditions.map((condition: any) => {
          dependentAttrIds.push(condition.evaluatedAttributeId)
        })
      }
    }
    onImport(attribute)
    allAttributes.forEach((attr) => {
      if (dependentAttrIds.includes(attr.attributeId)) {
        if (Array.isArray(attribute['dependsOn'])) {
          attribute['dependsOn'].push(attr)
        }
        else {
          attribute['dependsOn'] = [attr]
        }
        onImport(attr)
      }
    })
    setSearchTerm('')
  }

  const handleRemove = (attribute: Attribute) => {
    if (attribute.dependsOn && Array.isArray(attribute.dependsOn) && attribute.dependsOn.length) {
      if (selectedAttributes.some((attr) => {
        return attribute.dependsOn?.some((ele) => attr.attributeId === ele.attributeId)
      })) {
        let string = attribute.dependsOn.map((attr) => attr.displayName).join(', ')
        toast({
            title: "Error",
            description: `To remove ${attribute.displayName}, first remove it's dependent attributes - ${string} `,
            variant: "destructive",
        })
        return
      }
    }
    onRemove(attribute.attributeId)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Available Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.map((attribute) => (
                  <TableRow key={attribute.attributeId}>
                    <TableCell>{attribute.displayName}</TableCell>
                    <TableCell>{attribute.name}</TableCell>
                    <TableCell>{attribute.type}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleImport(attribute)} size="sm">
                        Import
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Imported Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedAttributes.map((attribute) => (
                <TableRow key={attribute.attributeId}>
                  <TableCell>{attribute.displayName}</TableCell>
                  <TableCell>{attribute.name}</TableCell>
                  <TableCell>{attribute.type}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemove(attribute)} variant="destructive" size="sm">
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

