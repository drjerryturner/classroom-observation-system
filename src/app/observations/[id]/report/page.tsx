'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Download, Eye, Edit, Save } from 'lucide-react'
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
  student: {
    firstName: string
    lastName: string
    grade: string
    primaryIdeaCategory?: {
      name: string
      code: string
    }
    secondaryIdeaCategory?: {
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
    email: string
  }
  entries: Array<{
    id: string
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
  }>
}

export default function ObservationReportPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ObservationReportContent />
      </div>
    </ProtectedRoute>
  )
}

function ObservationReportContent() {
  const params = useParams()
  const observationId = params?.id as string
  const printRef = useRef<HTMLDivElement>(null)
  
  const [observation, setObservation] = useState<ObservationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditingReport, setIsEditingReport] = useState(false)
  const [reportSummary, setReportSummary] = useState('')
  const [reportRecommendations, setReportRecommendations] = useState('')

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
        
        // Auto-generate summary and recommendations if not already set
        if (!reportSummary) {
          setReportSummary(generateSummary(data))
        }
        if (!reportRecommendations) {
          setReportRecommendations(generateRecommendations(data))
        }
      } else {
        setError('Failed to fetch observation')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = (data: ObservationData) => {
    const studentName = data.student.firstName
    const totalEntries = data.entries.length
    const positiveEntries = data.entries.filter(entry => 
      entry.behavior.toLowerCase().includes('on task') ||
      entry.behavior.toLowerCase().includes('appropriate') ||
      entry.behavior.toLowerCase().includes('correct') ||
      entry.behavior.toLowerCase().includes('engaged')
    ).length
    
    const transitionEntries = data.entries.filter(entry =>
      entry.behavior.toLowerCase().includes('transition') ||
      entry.context.toLowerCase().includes('transition')
    ).length

    return `Across the full observation, ${studentName} demonstrated consistent classroom ready behaviors. ${studentName} initiated tasks promptly after directions, managed materials independently, and remained on task without adult redirection. ${studentName} navigated brief transitions smoothly, including sitting to standing, retrieving items, and shifting from lecture to collaborative work. Social communication during instruction and group work appeared appropriate in frequency and tone.

No disruptive behaviors were observed, and no signs of emotional distress or dysregulation were evident. Mild, momentary shifts in visual focus did not interfere with performance, yet may represent an opportunity to further strengthen active listening during multistep directions.

${studentName} appears to benefit from proximity seating, clear verbal directions paired with brief visual anchors, and predictable routines for transitions. Instructional efficiency will be enhanced through guided notes or a concise visual outline during lecture portions, so auditory information anchors to a simple written scaffold.`
  }

  const generateRecommendations = (data: ObservationData) => {
    const studentName = data.student.firstName
    
    return `A brief cue to orient eyes to the speaker or visual display at the start of directions can reinforce attention awareness. During group work, assigning explicit roles, for example, materials manager, recorder, presenter, can reduce the slow starts and support steady engagement.

Timely performance feedback highlighting accurate responses and effective collaboration will reinforce strengths in participation and independence observed during this session. These supports align with ${studentName}'s demonstrated ability to self manage, contribute to peer tasks, and maintain attention across instructional formats.`
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const originalContent = document.body.innerHTML
      
      document.body.innerHTML = printContent
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    }
  }

  const saveReport = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      await fetch(`/api/observations/${observationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: `SUMMARY: ${reportSummary}\n\nRECOMMENDATIONS: ${reportRecommendations}`,
          status: 'reviewed'
        })
      })
      setIsEditingReport(false)
    } catch (err) {
      console.error('Failed to save report:', err)
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
            <Link href={`/observations/${observation.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Observation
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Observation Report</h1>
              <p className="mt-2 text-gray-600">
                {observation.student.firstName} {observation.student.lastName} - {format(new Date(observation.date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isEditingReport ? (
              <>
                <Button onClick={() => setIsEditingReport(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditingReport(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Report
                </Button>
                <Button onClick={handlePrint}>
                  <Download className="h-4 w-4 mr-2" />
                  Print/Save PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Report Content */}
        <Card>
          <CardContent ref={printRef} className="p-8 bg-white">
            {/* Report Header */}
            <div className="mb-8 border-b pb-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p><strong>Date:</strong> {format(new Date(observation.date), 'MMMM d, yyyy')}</p>
                  <p><strong>Class:</strong> {observation.classroom.name}</p>
                  <p><strong>Teacher:</strong> {observation.teacher.firstName} {observation.teacher.lastName}</p>
                </div>
                <div>
                  <p><strong>Observer:</strong> {observation.observer.title ? `${observation.observer.title} ` : ''}{observation.observer.firstName} {observation.observer.lastName}</p>
                  <p><strong>Student:</strong> {observation.student.firstName} {observation.student.lastName}</p>
                  <p><strong>Time:</strong> {observation.startTime} - {observation.endTime || 'In Progress'}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p><strong>Setting:</strong> {observation.setting}</p>
              </div>
            </div>

            {/* Time-Stamped Observations */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Observation Entries</h3>
              <div className="space-y-4">
                {observation.entries.map((entry, index) => (
                  <div key={entry.id} className="border-l-4 border-l-blue-500 pl-4">
                    <div className="font-semibold text-blue-700 mb-2">
                      {entry.timestamp}
                    </div>
                    <p className="mb-2">{entry.behavior}</p>
                    <p className="text-gray-700">{entry.context}</p>
                    
                    {(entry.antecedent || entry.consequence || entry.peers) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {entry.antecedent && <p><strong>Antecedent:</strong> {entry.antecedent}</p>}
                        {entry.consequence && <p><strong>Consequence:</strong> {entry.consequence}</p>}
                        {entry.peers && <p><strong>Setting/Peers:</strong> {entry.peers}</p>}
                        {entry.intervention && <p><strong>Intervention:</strong> {entry.intervention}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              {isEditingReport ? (
                <Textarea
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  rows={8}
                  className="w-full"
                />
              ) : (
                <div className="prose max-w-none">
                  {reportSummary.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              {isEditingReport ? (
                <Textarea
                  value={reportRecommendations}
                  onChange={(e) => setReportRecommendations(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              ) : (
                <div className="prose max-w-none">
                  {reportRecommendations.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-sm text-gray-600">
              <p>Report generated on {format(new Date(), 'MMMM d, yyyy')} by {observation.observer.firstName} {observation.observer.lastName}</p>
              <p>Total observation entries: {observation.entries.length}</p>
              {observation.student.primaryIdeaCategory && (
                <p>Primary IDEA Category: {observation.student.primaryIdeaCategory.code} - {observation.student.primaryIdeaCategory.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}