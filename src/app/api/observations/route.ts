import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    let where: any = { observerId: user.id }
    if (studentId) where.studentId = studentId

    const observations = await prisma.observation.findMany({
      where,
      include: {
        student: {
          include: {
            school: true,
            primaryIdeaCategory: true
          }
        },
        classroom: true,
        teacher: true,
        observer: {
          select: {
            firstName: true,
            lastName: true,
            title: true
          }
        },
        entries: {
          orderBy: {
            timeOfDay: 'asc'
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(observations)
  } catch (error) {
    console.error('Error fetching observations:', error)
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
      studentId,
      classroomId,
      teacherId,
      date,
      startTime,
      endTime,
      setting,
      totalStudents,
      totalTeachers,
      purpose,
      notes,
      status = 'draft'
    } = await req.json()

    if (!studentId || !classroomId || !teacherId || !date || !startTime || !setting || !totalStudents || !totalTeachers || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const observation = await prisma.observation.create({
      data: {
        studentId,
        classroomId,
        teacherId,
        observerId: user.id,
        date: new Date(date),
        startTime,
        endTime,
        setting,
        totalStudents: parseInt(totalStudents),
        totalTeachers: parseInt(totalTeachers),
        purpose,
        notes,
        status
      },
      include: {
        student: {
          include: {
            school: true,
            primaryIdeaCategory: true
          }
        },
        classroom: true,
        teacher: true,
        observer: {
          select: {
            firstName: true,
            lastName: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(observation, { status: 201 })
  } catch (error) {
    console.error('Error creating observation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}