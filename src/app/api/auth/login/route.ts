import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('LOGIN BODY:', body)

    const { email, password } = body || {}
    console.log('PARSED EMAIL:', email)
    console.log('PASSWORD LENGTH:', password ? password.length : null)

    // 1) Look up user in database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    console.log('USER FROM DB:', user)

    if (!user) {
      // Make the reason visible
      return NextResponse.json(
        { error: 'Invalid credentials - no user found for this email' },
        { status: 401 }
      )
    }

    // 2) Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('PASSWORD VALID:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials - password mismatch' },
        { status: 401 }
      )
    }

    // 3) Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('LOGIN ERROR (exception):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
