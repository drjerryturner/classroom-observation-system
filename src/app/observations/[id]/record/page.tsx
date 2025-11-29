'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Clock, Save, Square, Play, Pause } from 'lucide-react'
import { format } from 'date-fns'

interface ObservationEntry {
  id?: string
  timestamp: string
  timeOfDay: string
  behavior: string
  context: string
  antecedent?: string
  consequence?: string
  setting?: string
  peers?: string
  duration?: number
  intensity?: string
  frequency?: number
  intervention?: string
  notes?: string
  tags?: string[]
}

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
  setting: string
  totalStudents: number
  totalTeachers: number
  purpose: string
  entries: ObservationEntry[]
}

interface BehaviorCategory {
  id: string
  name: string
  domain: string
  isPositive: boolean
  color?: string
}

export default function RecordObservationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <RecordObservationContent />
      </div>
    </ProtectedRoute>
  )
}

function RecordObservationContent() {
  const params = useParams()
  const router = useRouter()
  const observationId = params?.id as string
  
  const [observation, setObservation] = useState<Observation | null>(null)
  const [behaviorCategories, setBehaviorCategories] = useState<BehaviorCategory[]>([])
  const [entries, setEntries] = useState<ObservationEntry[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout>()
  const behaviorInputRef = useRef<HTMLTextAreaElement>(null)
  
  const [newEntry, setNewEntry] = useState<Partial<ObservationEntry>>({
    behavior: '',
    context: '',
    antecedent: '',
    consequence: '',
    peers: '',
    intensity: '',
    intervention: '',
    notes: '',
    tags: []
  })

  useEffect(() => {
    if (observationId) {
      fetchObservation()
      fetchBehaviorCategories()
    }

    // Start the real-time clock
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(clockInterval)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
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
        setEntries(data.entries || [])
      } else {
        setError('Failed to fetch observation')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBehaviorCategories = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/behavior-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBehaviorCategories(data)
      }
    } catch (err) {
      console.error('Failed to fetch behavior categories:', err)
    }
  }

  const getCurrentTimeString = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const getCurrentTimestamp = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    // Convert to the format used in the example (e.g., "1256", "13:03")
    if (hours >= 10) {
      return `${hours}${minutes.toString().padStart(2, '0')}`
    } else {
      return `${hours}:${minutes.toString().padStart(2, '0')}`
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    
    // Focus on the behavior input
    setTimeout(() => {
      if (behaviorInputRef.current) {
        behaviorInputRef.current.focus()
      }
    }, 100)
  }

  const pauseRecording = () => {
    setIsPaused(true)
  }

  const resumeRecording = () => {
    setIsPaused(false)
  }

  const stopRecording = async () => {
    setIsRecording(false)
    setIsPaused(false)
    
    // Update observation end time
    try {
      const token = localStorage.getItem('auth-token')
      await fetch(`/api/observations/${observationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endTime: getCurrentTimeString(),
          status: 'completed'
        })
      })
    } catch (err) {
      console.error('Failed to update observation:', err)
    }
  }

  const addEntry = async () => {
    if (!newEntry.behavior || !newEntry.context) {
      alert('Please enter both behavior and context')
      return
    }

    const timestamp = getCurrentTimestamp()
    const timeOfDay = getCurrentTimeString()

    const entry: ObservationEntry = {
      timestamp,
      timeOfDay,
      behavior: newEntry.behavior!,
      context: newEntry.context!,
      antecedent: newEntry.antecedent || undefined,
      consequence: newEntry.consequence || undefined,
      peers: newEntry.peers || undefined,
      intensity: newEntry.intensity || undefined,
      intervention: newEntry.intervention || undefined,
      notes: newEntry.notes || undefined,
      tags: newEntry.tags
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/observations/${observationId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entry)
      })

      if (response.ok) {
        const savedEntry = await response.json()
        setEntries(prev => [...prev, savedEntry])
        
        // Clear the form
        setNewEntry({
          behavior: '',
          context: '',
          antecedent: '',
          consequence: '',
          peers: '',
          intensity: '',
          intervention: '',
          notes: '',
          tags: []
        })
        
        // Focus back on behavior input
        if (behaviorInputRef.current) {
          behaviorInputRef.current.focus()
        }
      } else {
        alert('Failed to save entry')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickBehavior = (behaviorText: string) => {
    setNewEntry(prev => ({
      ...prev,
      behavior: behaviorText
    }))
    
    if (behaviorInputRef.current) {
      behaviorInputRef.current.focus()
    }
  }

  const formatElapsedTime = (startTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const now = new Date()
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const current = new Date(`2000-01-01T${currentTimeStr}`)
    
    const diff = current.getTime() - start.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
        </div>
      </div>
    )
  }

  const quickBehaviors = [
    'On task - attending to instruction',
    'Off task - looking away from instruction',
    'Hand raised to participate',
    'Talking to peers',
    'Out of seat without permission',
    'Following directions appropriately',
    'Transition completed independently',
    'Seeking help appropriately',
    'Disruptive behavior',
    'Positive peer interaction'
  ]

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Recording: {observation.student.firstName} {observation.student.lastName}
            </h1>
            <p className="mt-2 text-gray-600">
              {observation.classroom.name} - {observation.teacher.firstName} {observation.teacher.lastName}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              {isRecording && (
                <div className="text-sm text-gray-600">
                  Elapsed: {formatElapsedTime(observation.startTime)}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isRecording ? (
                <Button onClick={startRecording}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <>
                  {!isPaused ? (
                    <Button onClick={pauseRecording} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeRecording}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Entry Form */}
            {isRecording && !isPaused && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Record Observation - {getCurrentTimestamp()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="behavior">Behavior *</Label>
                      <Textarea
                        ref={behaviorInputRef}
                        id="behavior"
                        placeholder="Describe what you observe..."
                        value={newEntry.behavior}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, behavior: e.target.value }))}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context">Context *</Label>
                      <Textarea
                        id="context"
                        placeholder="What is happening in the environment..."
                        value={newEntry.context}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, context: e.target.value }))}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="antecedent">Antecedent</Label>
                      <Input
                        id="antecedent"
                        placeholder="What happened before..."
                        value={newEntry.antecedent}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, antecedent: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consequence">Consequence</Label>
                      <Input
                        id="consequence"
                        placeholder="What happened after..."
                        value={newEntry.consequence}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, consequence: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peers">Peers/Setting</Label>
                      <Input
                        id="peers"
                        placeholder="Peer interactions, setting details..."
                        value={newEntry.peers}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, peers: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="intensity">Intensity</Label>
                      <Select 
                        value={newEntry.intensity} 
                        onValueChange={(value) => setNewEntry(prev => ({ ...prev, intensity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Time: {getCurrentTimeString()} | Total Entries: {entries.length}
                    </div>
                    <Button onClick={addEntry} disabled={isSaving}>
                      {isSaving ? (
                        'Saving...'
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Entry
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Behaviors */}
            {isRecording && !isPaused && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Behaviors</CardTitle>
                  <CardDescription>Click to add common behaviors to your entry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {quickBehaviors.map((behavior, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2 px-3"
                        onClick={() => handleQuickBehavior(behavior)}
                      >
                        {behavior}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recorded Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recorded Entries ({entries.length})
                  <Badge variant={isRecording ? "default" : "secondary"}>
                    {isRecording ? (isPaused ? "PAUSED" : "RECORDING") : "STOPPED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No entries recorded yet</p>
                    <p className="text-sm">Start recording to add time-sampled observations</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {entries.map((entry, index) => (
                      <div key={entry.id || index} className="border rounded-lg p-4 bg-white">
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
                          
                          {entry.antecedent && (
                            <div>
                              <strong className="text-sm text-gray-700">Antecedent:</strong>
                              <p className="text-sm">{entry.antecedent}</p>
                            </div>
                          )}
                          
                          {entry.consequence && (
                            <div>
                              <strong className="text-sm text-gray-700">Consequence:</strong>
                              <p className="text-sm">{entry.consequence}</p>
                            </div>
                          )}
                          
                          {(entry.peers || entry.intensity) && (
                            <div className="flex gap-4 text-sm">
                              {entry.peers && (
                                <span><strong>Peers:</strong> {entry.peers}</span>
                              )}
                              {entry.intensity && (
                                <Badge variant="secondary">{entry.intensity} intensity</Badge>
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

          {/* Observation Details Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Observation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Student</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.student.firstName} {observation.student.lastName}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    Grade {observation.student.grade}
                    {observation.student.primaryIdeaCategory && 
                      ` • ${observation.student.primaryIdeaCategory.code}`
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(observation.date), 'MMMM d, yyyy')}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    Started: {observation.startTime}
                    {observation.endTime && ` • Ended: ${observation.endTime}`}
                  </dd>
                </div>

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

                <div>
                  <dt className="text-sm font-medium text-gray-500">Class Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {observation.totalStudents} students, {observation.totalTeachers} teacher(s)
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Setting</dt>
                  <dd className="mt-1 text-sm text-gray-900">{observation.setting}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900">{observation.purpose}</dd>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/observations/${observation.id}/report`)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}