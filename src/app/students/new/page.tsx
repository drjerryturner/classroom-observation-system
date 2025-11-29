'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface School {
  id: string
  name: string
  district: string
}

interface IdeaCategory {
  id: string
  name: string
  code: string
  description: string
}

export default function AddStudentPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AddStudentContent />
      </div>
    </ProtectedRoute>
  )
}

function AddStudentContent() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [ideaCategories, setIdeaCategories] = useState<IdeaCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    schoolId: '',
    primaryIdeaCategoryId: '',
    secondaryIdeaCategoryId: '',
    iepDate: '',
    caseManager: '',
    accommodations: ''
  })

  useEffect(() => {
    fetchSchools()
    fetchIdeaCategories()
  }, [])

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/schools', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err)
    }
  }

  const fetchIdeaCategories = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/idea-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIdeaCategories(data)
      }
    } catch (err) {
      console.error('Failed to fetch IDEA categories:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          primaryIdeaCategoryId: formData.primaryIdeaCategoryId || null,
          secondaryIdeaCategoryId: formData.secondaryIdeaCategoryId || null,
          iepDate: formData.iepDate || null,
          caseManager: formData.caseManager || null,
          accommodations: formData.accommodations || null
        })
      })

      if (response.ok) {
        router.push('/students')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create student')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const grades = ['PreK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Post-Secondary']

  return (
    <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
            <p className="mt-2 text-gray-600">Enter student information and IEP details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Please fill out all required fields marked with an asterisk (*)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select onValueChange={(value) => handleSelectChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="schoolId">School *</Label>
                  <Select onValueChange={(value) => handleSelectChange('schoolId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} - {school.district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryIdeaCategoryId">Primary IDEA Disability</Label>
                  <Select onValueChange={(value) => handleSelectChange('primaryIdeaCategoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary disability" />
                    </SelectTrigger>
                    <SelectContent>
                      {ideaCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryIdeaCategoryId">Secondary IDEA Disability</Label>
                  <Select onValueChange={(value) => handleSelectChange('secondaryIdeaCategoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select secondary disability (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {ideaCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iepDate">IEP Date</Label>
                  <Input
                    id="iepDate"
                    name="iepDate"
                    type="date"
                    value={formData.iepDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseManager">Case Manager</Label>
                  <Input
                    id="caseManager"
                    name="caseManager"
                    placeholder="Case manager name"
                    value={formData.caseManager}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accommodations">Accommodations</Label>
                  <Textarea
                    id="accommodations"
                    name="accommodations"
                    placeholder="List any accommodations or modifications"
                    value={formData.accommodations}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/students">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Student
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}