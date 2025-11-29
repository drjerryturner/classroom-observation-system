'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FileText, Users, BarChart3, Clock, Shield, BookOpen } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Classroom Observation System
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Professional Classroom
            <span className="text-blue-600"> Observation Tools</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your classroom observations for students with IDEA disabilities. 
            Capture real-time behaviors, generate comprehensive reports, and support 
            evidence-based interventions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <Clock className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Time Sampling</CardTitle>
                <CardDescription>
                  Precise time-stamped observations with real-time data collection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>IDEA Disabilities</CardTitle>
                <CardDescription>
                  Comprehensive support for all 13 IDEA disability categories (K-12)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <FileText className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Professional Reports</CardTitle>
                <CardDescription>
                  Generate detailed, formatted observation reports for IEP meetings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  Track behavioral patterns and intervention effectiveness over time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>FERPA Compliant</CardTitle>
                <CardDescription>
                  Secure, confidential data handling that meets educational standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-teal-600 mb-4" />
                <CardTitle>Evidence-Based</CardTitle>
                <CardDescription>
                  Built for school psychologists with research-backed methodologies
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-blue-600 text-white border-0">
            <CardHeader className="pb-8 pt-12">
              <CardTitle className="text-3xl font-bold">
                Ready to Transform Your Observations?
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join school psychologists who trust our platform for professional classroom observations
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Get Started Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Classroom Observation System. Professional tools for educational assessment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
