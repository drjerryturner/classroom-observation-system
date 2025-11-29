import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      where: {
        isActive: true
      },
      include: {
        school: true,
        primaryIdeaCategory: true,
        secondaryIdeaCategory: true,
        observations: {
          select: {
            id: true,
            date: true,
            status: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 5
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      schoolId,
      primaryIdeaCategoryId,
      secondaryIdeaCategoryId,
      iepDate,
      caseManager,
      accommodations
    } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !grade || !schoolId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        grade,
        schoolId,
        primaryIdeaCategoryId,
        secondaryIdeaCategoryId,
        iepDate: iepDate ? new Date(iepDate) : null,
        caseManager,
        accommodations
      },
      include: {
        school: true,
        primaryIdeaCategory: true,
        secondaryIdeaCategory: true
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}