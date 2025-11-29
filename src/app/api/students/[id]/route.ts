import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        school: true,
        primaryIdeaCategory: true,
        secondaryIdeaCategory: true,
        observations: {
          include: {
            classroom: true,
            teacher: true,
            observer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    const student = await prisma.student.update({
      where: { id },
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
        accommodations,
        updatedAt: new Date()
      },
      include: {
        school: true,
        primaryIdeaCategory: true,
        secondaryIdeaCategory: true
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft delete by marking as inactive
    await prisma.student.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}