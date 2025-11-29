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
    const schoolId = searchParams.get('schoolId')
    const teacherId = searchParams.get('teacherId')

    let where: any = {}
    if (schoolId) where.schoolId = schoolId
    if (teacherId) where.teacherId = teacherId

    const classrooms = await prisma.classroom.findMany({
      where,
      include: {
        school: true,
        teacher: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(classrooms)
  } catch (error) {
    console.error('Error fetching classrooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, schoolId, teacherId, subject, gradeLevel, roomNumber, capacity } = await req.json()

    if (!name || !schoolId || !teacherId || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const classroom = await prisma.classroom.create({
      data: {
        name,
        schoolId,
        teacherId,
        subject,
        gradeLevel,
        roomNumber,
        capacity: parseInt(capacity)
      },
      include: {
        school: true,
        teacher: true
      }
    })

    return NextResponse.json(classroom, { status: 201 })
  } catch (error) {
    console.error('Error creating classroom:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}