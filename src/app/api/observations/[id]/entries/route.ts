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

    // Check if observation exists and user owns it
    const observation = await prisma.observation.findUnique({
      where: { id },
      select: { observerId: true }
    })

    if (!observation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }

    if (observation.observerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const entries = await prisma.observationEntry.findMany({
      where: {
        observationId: id
      },
      orderBy: {
        timeOfDay: 'asc'
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching observation entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: observationId } = await params
    const {
      timestamp,
      timeOfDay,
      behavior,
      context,
      antecedent,
      consequence,
      setting,
      peers,
      duration,
      intensity,
      frequency,
      intervention,
      notes,
      tags
    } = await req.json()

    // Check if observation exists and user owns it
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      select: { observerId: true }
    })

    if (!observation) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 })
    }

    if (observation.observerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!timestamp || !timeOfDay || !behavior || !context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entry = await prisma.observationEntry.create({
      data: {
        observationId,
        timestamp,
        timeOfDay,
        behavior,
        context,
        antecedent,
        consequence,
        setting,
        peers,
        duration: duration ? parseInt(duration) : null,
        intensity,
        frequency: frequency ? parseInt(frequency) : null,
        intervention,
        notes,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating observation entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}