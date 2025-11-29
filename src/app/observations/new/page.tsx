'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Play } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade: string
  school: {
    id: string
    name: string
  }
}

interface School {
  id: string
  name: string
  district: string
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  department?: string
}

interface Classroom {
  id: string
  name: string
  subject?: string
  roomNumber?: string
  capacity: number
}

export default function NewObservationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <NewObservationContent />
      </div>
    </ProtectedRoute>
  )
}

function NewObservationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedStudentId = searchParams?.get('student')
  
  const [students, setStudents] = useState<Student[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    studentId: preselectedStudentId || '',
    schoolId: '',
    teacherId: '',
    classroomId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    setting: '',
    totalStudents: '',
    totalTeachers: '1',
    purpose: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchSchools()
    
    // Auto-set current time
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setFormData(prev => ({
      ...prev,
      startTime: currentTime
    }))
  }, [])

  useEffect(() => {
    if (formData.schoolId) {
      fetchTeachers(formData.schoolId)
    }
  }, [formData.schoolId])

  useEffect(() => {
    if (formData.schoolId && formData.teacherId) {
      fetchClassrooms(formData.schoolId, formData.teacherId)
    }
  }, [formData.schoolId, formData.teacherId])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        
        // If there's a preselected student, set the school
        if (preselectedStudentId) {
          const student = data.find((s: Student) => s.id === preselectedStudentId)
          if (student && student.school) {
            setFormData(prev => ({
              ...prev,
              schoolId: student.school.id || ''
            }))
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch students:', err)
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

  const fetchTeachers = async (schoolId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/teachers?schoolId=${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err)
    }
  }

  const fetchClassrooms = async (schoolId: string, teacherId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/classrooms?schoolId=${schoolId}&teacherId=${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setClassrooms(data)
      }
    } catch (err) {
      console.error('Failed to fetch classrooms:', err)
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

    // Clear dependent fields when parent changes
    if (name === 'schoolId') {
      setFormData(prev => ({
        ...prev,
        teacherId: '',
        classroomId: ''
      }))
      setTeachers([])
      setClassrooms([])
    } else if (name === 'teacherId') {
      setFormData(prev => ({
        ...prev,
        classroomId: ''
      }))
      setClassrooms([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalStudents: parseInt(formData.totalStudents),
          totalTeachers: parseInt(formData.totalTeachers)
        })
      })

      if (response.ok) {
        const observation = await response.json()
        router.push(`/observations/${observation.id}/record`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create observation')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedStudent = students.find(s => s.id === formData.studentId)

  return (
    <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/observations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Observations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Observation</h1>
            <p className="mt-2 text-gray-600">Set up your classroom observation session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Setup Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Observation Setup</CardTitle>
                <CardDescription>
                  Complete the observation details to begin recording
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
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="studentId">Student *</Label>
                      <Select 
                        value={formData.studentId} 
                        onValueChange={(value) => handleSelectChange('studentId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} (Grade {student.grade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="schoolId">School *</Label>
                      <Select 
                        value={formData.schoolId} 
                        onValueChange={(value) => handleSelectChange('schoolId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacherId">Teacher *</Label>
                      <Select 
                        value={formData.teacherId} 
                        onValueChange={(value) => handleSelectChange('teacherId', value)}
                        disabled={!formData.schoolId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName}
                              {teacher.department && ` (${teacher.department})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classroomId">Classroom *</Label>
                      <Select 
                        value={formData.classroomId} 
                        onValueChange={(value) => handleSelectChange('classroomId', value)}
                        disabled={!formData.teacherId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select classroom" />
                        </SelectTrigger>
                        <SelectContent>
                          {classrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}
                              {classroom.subject && ` - ${classroom.subject}`}
                              {classroom.roomNumber && ` (Room ${classroom.roomNumber})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalStudents">Total Students in Class *</Label>
                      <Input
                        id="totalStudents"
                        name="totalStudents"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.totalStudents}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalTeachers">Total Teachers/Staff *</Label>
                      <Input
                        id="totalTeachers"
                        name="totalTeachers"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.totalTeachers}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="setting">Setting Description *</Label>
                      <Textarea
                        id="setting"
                        name="setting"
                        placeholder="e.g., Whole group lecture followed by small group project work in a general education classroom"
                        value={formData.setting}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="purpose">Purpose of Observation *</Label>
                      <Textarea
                        id="purpose"
                        name="purpose"
                        placeholder="e.g., Baseline data collection for attention behaviors during instruction"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Link href="/observations">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        'Creating...'
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Observation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Student Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Selected Student</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Grade</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedStudent.grade}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">School</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedStudent.school.name}
                      </dd>
                    </div>
                    <Link href={`/students/${selectedStudent.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Student Profile
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Select a student to view their information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}