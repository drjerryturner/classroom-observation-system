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

    const observation = await prisma.observation.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            school: true,
            primaryIdeaCategory: true,
            secondaryIdeaCategory: true
          }
        },
        classroom: true,
        teacher: true,
        observer: {
          select: {
            firstName: true,
            lastName: true,
            title: true,
            email: true
          }
        },
        entries: {
          orderBy: {
            timeOfDay: 'asc'
          }
        }
      }
    })

    if (!observation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }

    // Check if user owns this observation
    if (observation.observerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(observation)
  } catch (error) {
    console.error('Error fetching observation:', error)
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
    const updateData = await req.json()

    // Check if observation exists and user owns it
    const existingObservation = await prisma.observation.findUnique({
      where: { id }
    })

    if (!existingObservation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }

    if (existingObservation.observerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const observation = await prisma.observation.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
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
        },
        entries: {
          orderBy: {
            timeOfDay: 'asc'
          }
        }
      }
    })

    return NextResponse.json(observation)
  } catch (error) {
    console.error('Error updating observation:', error)
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

    // Check if observation exists and user owns it
    const existingObservation = await prisma.observation.findUnique({
      where: { id }
    })

    if (!existingObservation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }

    if (existingObservation.observerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.observation.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Observation deleted successfully' })
  } catch (error) {
    console.error('Error deleting observation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}