'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, Plus, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  grade: string
  school: {
    id: string
    name: string
    district: string
  }
  primaryIdeaCategory?: {
    id: string
    name: string
    code: string
    description: string
  }
  secondaryIdeaCategory?: {
    id: string
    name: string
    code: string
    description: string
  }
  iepDate?: string
  caseManager?: string
  accommodations?: string
  observations: Array<{
    id: string
    date: string
    startTime: string
    endTime?: string
    status: string
    setting: string
    classroom: {
      name: string
      subject?: string
    }
    teacher: {
      firstName: string
      lastName: string
    }
    observer: {
      firstName: string
      lastName: string
    }
  }>
}

export default function StudentDetailPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <StudentDetailContent />
      </div>
    </ProtectedRoute>
  )
}

function StudentDetailContent() {
  const params = useParams()
  const studentId = params?.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (studentId) {
      fetchStudent()
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
      } else if (response.status === 404) {
        setError('Student not found')
      } else {
        setError('Failed to fetch student')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  if (isLoading) {
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
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/students">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="mt-2 text-gray-600">
                Student Profile and Observation History
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/students/${student.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Student
              </Button>
            </Link>
            <Link href={`/observations/new?student=${student.id}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Observation
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.firstName} {student.lastName}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Age / Grade</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {calculateAge(student.dateOfBirth)} years old, Grade {student.grade}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(student.dateOfBirth), 'MMMM d, yyyy')}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">School</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.school.name}
                    <div className="text-xs text-gray-500">{student.school.district}</div>
                  </dd>
                </div>

                {student.primaryIdeaCategory && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Primary Disability</dt>
                    <dd className="mt-1">
                      <Badge variant="secondary">
                        {student.primaryIdeaCategory.code} - {student.primaryIdeaCategory.name}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        {student.primaryIdeaCategory.description}
                      </p>
                    </dd>
                  </div>
                )}

                {student.secondaryIdeaCategory && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Secondary Disability</dt>
                    <dd className="mt-1">
                      <Badge variant="outline">
                        {student.secondaryIdeaCategory.code} - {student.secondaryIdeaCategory.name}
                      </Badge>
                    </dd>
                  </div>
                )}

                {student.iepDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IEP Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(new Date(student.iepDate), 'MMMM d, yyyy')}
                    </dd>
                  </div>
                )}

                {student.caseManager && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Case Manager</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {student.caseManager}
                    </dd>
                  </div>
                )}

                {student.accommodations && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Accommodations</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {student.accommodations}
                    </dd>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observation History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Observation History</CardTitle>
                    <CardDescription>
                      {student.observations.length} total observations
                    </CardDescription>
                  </div>
                  <Link href={`/observations/new?student=${student.id}`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Observation
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {student.observations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No observations recorded yet</p>
                    <p className="text-sm">Start by creating your first observation</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Classroom</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.observations.map((observation) => (
                        <TableRow key={observation.id}>
                          <TableCell className="font-medium">
                            {format(new Date(observation.date), 'MM/dd/yyyy')}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {observation.startTime}
                            {observation.endTime && ` - ${observation.endTime}`}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {observation.classroom.name}
                            {observation.classroom.subject && (
                              <div className="text-xs text-gray-500">
                                {observation.classroom.subject}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {observation.teacher.firstName} {observation.teacher.lastName}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={getStatusColor(observation.status)}
                            >
                              {observation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/observations/${observation.id}`}>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}