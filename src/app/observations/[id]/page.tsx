'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, FileText, Edit, Play } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ObservationData {
  id: string
  date: string
  startTime: string
  endTime?: string
  setting: string
  totalStudents: number
  totalTeachers: number
  purpose: string
  notes?: string
  status: string
  student: {
    firstName: string
    lastName: string
    grade: string
    school: {
      name: string
    }
    primaryIdeaCategory?: {
      name: string
      code: string
    }
  }
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
    title?: string
  }
  entries: Array<{
    id: string
    timestamp: string
    timeOfDay: string
    behavior: string
    context: string
    antecedent?: string
    consequence?: string
    intensity?: string
  }>
}

export default function ObservationDetailPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ObservationDetailContent />
      </div>
    </ProtectedRoute>
  )
}

function ObservationDetailContent() {
  const params = useParams()
  const observationId = params?.id as string
  
  const [observation, setObservation] = useState<ObservationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (observationId) {
      fetchObservation()
    }
  }, [observationId])

  const fetchObservation = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/observations/${observationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setObservation(data)
      } else {
        setError('Failed to fetch observation')
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !observation) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-red-600 text-lg">{error || 'Observation not found'}</div>
          <Link href="/observations" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Observations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/observations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Observations
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Observation: {observation.student.firstName} {observation.student.lastName}
              </h1>
              <p className="mt-2 text-gray-600">
                {format(new Date(observation.date), 'MMMM d, yyyy')} • {observation.classroom.name}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {observation.status === 'draft' && (
              <Link href={`/observations/${observation.id}/record`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Recording
                </Button>
              </Link>
            )}
            <Link href={`/observations/${observation.id}/report`}>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Observation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Observation Details</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(observation.status)}
                  >
                    {observation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(observation.date), 'MMMM d, yyyy')}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {observation.startTime} 
                    {observation.endTime && ` - ${observation.endTime}`}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Observer</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.observer.title ? `${observation.observer.title} ` : ''}
                    {observation.observer.firstName} {observation.observer.lastName}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Class Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.totalStudents} students, {observation.totalTeachers} teacher(s)
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Entries</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.entries.length} recorded observations
                  </dd>
                </div>

                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Setting</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.setting}
                  </dd>
                </div>

                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.purpose}
                  </dd>
                </div>
              </CardContent>
            </Card>

            {/* Observation Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recorded Entries ({observation.entries.length})</CardTitle>
                <CardDescription>Time-sampled observations during the session</CardDescription>
              </CardHeader>
              <CardContent>
                {observation.entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No entries recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {observation.entries.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="font-mono">
                            {entry.timestamp}
                          </Badge>
                          <span className="text-sm text-gray-500">{entry.timeOfDay}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <strong className="text-sm text-gray-700">Behavior:</strong>
                            <p className="text-sm">{entry.behavior}</p>
                          </div>
                          
                          <div>
                            <strong className="text-sm text-gray-700">Context:</strong>
                            <p className="text-sm">{entry.context}</p>
                          </div>
                          
                          {(entry.antecedent || entry.consequence || entry.intensity) && (
                            <div className="flex gap-4 text-xs text-gray-600">
                              {entry.antecedent && (
                                <span><strong>Antecedent:</strong> {entry.antecedent}</span>
                              )}
                              {entry.consequence && (
                                <span><strong>Consequence:</strong> {entry.consequence}</span>
                              )}
                              {entry.intensity && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.intensity} intensity
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.student.firstName} {observation.student.lastName}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Grade</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.student.grade}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">School</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.student.school.name}
                  </dd>
                </div>

                {observation.student.primaryIdeaCategory && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Primary Disability</dt>
                    <dd className="mt-1">
                      <Badge variant="secondary">
                        {observation.student.primaryIdeaCategory.code} - {observation.student.primaryIdeaCategory.name}
                      </Badge>
                    </dd>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link href={`/students/${observation.student.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Student Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Classroom Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Classroom</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.classroom.name}
                  </dd>
                  {observation.classroom.subject && (
                    <dd className="text-xs text-gray-500">{observation.classroom.subject}</dd>
                  )}
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Teacher</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.teacher.firstName} {observation.teacher.lastName}
                  </dd>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}