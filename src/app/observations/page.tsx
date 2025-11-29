'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Observation {
  id: string
  date: string
  startTime: string
  endTime?: string
  status: string
  student: {
    firstName: string
    lastName: string
    grade: string
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
  entries: Array<{ id: string }>
}

export default function ObservationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ObservationsContent />
      </div>
    </ProtectedRoute>
  )
}

function ObservationsContent() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [filteredObservations, setFilteredObservations] = useState<Observation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchObservations()
  }, [])

  useEffect(() => {
    const filtered = observations.filter(observation =>
      `${observation.student.firstName} ${observation.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${observation.teacher.firstName} ${observation.teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredObservations(filtered)
  }, [observations, searchTerm])

  const fetchObservations = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/observations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setObservations(data)
      } else {
        setError('Failed to fetch observations')
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

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Observations</h1>
            <p className="mt-2 text-gray-600">Your classroom observation sessions</p>
          </div>
          <Link href="/observations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Observation
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Observation List</CardTitle>
                <CardDescription>
                  {observations.length} total observations
                </CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search observations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {filteredObservations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {observations.length === 0 ? (
                    <>
                      <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No observations created yet</p>
                      <p className="text-sm">Create your first observation to get started</p>
                    </>
                  ) : (
                    <>
                      <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No observations match your search</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Classroom</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObservations.map((observation) => (
                    <TableRow key={observation.id}>
                      <TableCell className="font-medium">
                        {format(new Date(observation.date), 'MM/dd/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {observation.student.firstName} {observation.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Grade {observation.student.grade}
                            {observation.student.primaryIdeaCategory && 
                              ` • ${observation.student.primaryIdeaCategory.code}`
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{observation.classroom.name}</div>
                          {observation.classroom.subject && (
                            <div className="text-sm text-gray-500">{observation.classroom.subject}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {observation.teacher.firstName} {observation.teacher.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {observation.startTime}
                        {observation.endTime && ` - ${observation.endTime}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {observation.entries.length} entries
                        </Badge>
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
                        <div className="flex justify-end gap-2">
                          {observation.status === 'draft' ? (
                            <Link href={`/observations/${observation.id}/record`}>
                              <Button variant="ghost" size="sm">
                                <Clock className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/observations/${observation.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/observations/${observation.id}/report`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}