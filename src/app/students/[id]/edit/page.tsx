'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  grade: string
  schoolId: string
  primaryIdeaCategoryId?: string
  secondaryIdeaCategoryId?: string
  iepDate?: string
  caseManager?: string
  accommodations?: string
}

export default function EditStudentPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <EditStudentContent />
      </div>
    </ProtectedRoute>
  )
}

function EditStudentContent() {
  const params = useParams()
  const router = useRouter()
  const studentId = params?.id as string
  
  const [student, setStudent] = useState<Student | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [ideaCategories, setIdeaCategories] = useState<IdeaCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingStudent, setIsFetchingStudent] = useState(true)
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
    if (studentId) {
      fetchStudent()
      fetchSchools()
      fetchIdeaCategories()
    }
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudent(data)
        
        // Populate form data
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth.split('T')[0], // Convert to YYYY-MM-DD format
          grade: data.grade,
          schoolId: data.schoolId,
          primaryIdeaCategoryId: data.primaryIdeaCategoryId || '',
          secondaryIdeaCategoryId: data.secondaryIdeaCategoryId || '',
          iepDate: data.iepDate ? data.iepDate.split('T')[0] : '',
          caseManager: data.caseManager || '',
          accommodations: data.accommodations || ''
        })
      } else if (response.status === 404) {
        setError('Student not found')
      } else {
        setError('Failed to fetch student')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsFetchingStudent(false)
    }
  }

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
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
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
        router.push(`/students/${studentId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update student')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const grades = ['PreK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Post-Secondary']

  if (isFetchingStudent) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-red-600 text-lg">{error || 'Student not found'}</div>
          <Link href="/students" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Students
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/students/${studentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Student: {student.firstName} {student.lastName}
            </h1>
            <p className="mt-2 text-gray-600">Update student information and IEP details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Update the student's information. All fields marked with an asterisk (*) are required.
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
                  <Select value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
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
                  <Select value={formData.schoolId} onValueChange={(value) => handleSelectChange('schoolId', value)}>
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
                  <Select 
                    value={formData.primaryIdeaCategoryId} 
                    onValueChange={(value) => handleSelectChange('primaryIdeaCategoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary disability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                  <Select 
                    value={formData.secondaryIdeaCategoryId} 
                    onValueChange={(value) => handleSelectChange('secondaryIdeaCategoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select secondary disability (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                <Link href={`/students/${studentId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    'Updating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Student
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