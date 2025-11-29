# Classroom Observation System Database Schema

## Core Entities

### 1. Users (School Psychologists)
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  title: string
  licenseNumber?: string
  district: string
  createdAt: Date
  updatedAt: Date
}
```

### 2. IDEA Disability Categories
```typescript
interface IdeaCategory {
  id: string
  code: string // e.g., "AU", "DB", "DD", etc.
  name: string // e.g., "Autism", "Deaf-Blindness", "Developmental Delay"
  description: string
  ageRange: string // e.g., "Birth-21", "3-21", etc.
}
```

### 3. Schools
```typescript
interface School {
  id: string
  name: string
  district: string
  address: string
  principal: string
  phone?: string
  createdAt: Date
}
```

### 4. Teachers
```typescript
interface Teacher {
  id: string
  firstName: string
  lastName: string
  email?: string
  schoolId: string
  department?: string
  gradeLevel?: string
  createdAt: Date
}
```

### 5. Students
```typescript
interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  grade: string
  schoolId: string
  primaryIdeaCategoryId?: string
  secondaryIdeaCategoryId?: string
  iepDate?: Date
  caseManager?: string
  accommodations?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 6. Classrooms
```typescript
interface Classroom {
  id: string
  name: string // e.g., "Geoscience", "Math Block A"
  schoolId: string
  teacherId: string
  subject?: string
  gradeLevel?: string
  roomNumber?: string
  capacity: number
  createdAt: Date
}
```

### 7. Observations
```typescript
interface Observation {
  id: string
  studentId: string
  classroomId: string
  teacherId: string
  observerId: string // User ID of school psychologist
  date: Date
  startTime: string // e.g., "12:56"
  endTime: string
  setting: string // e.g., "Whole group lecture followed by small group project work..."
  totalStudents: number
  totalTeachers: number
  purpose: string
  notes?: string
  status: "draft" | "completed" | "reviewed"
  createdAt: Date
  updatedAt: Date
}
```

### 8. Observation Entries (Timestamped entries)
```typescript
interface ObservationEntry {
  id: string
  observationId: string
  timestamp: string // e.g., "1256", "13:03"
  timeOfDay: string // HH:MM format for sorting
  behavior: string
  context: string
  antecedent?: string
  consequence?: string
  setting?: string
  peers?: string
  duration?: number // in seconds
  intensity?: "low" | "medium" | "high"
  frequency?: number
  intervention?: string
  notes?: string
  tags?: string[] // for categorization
  createdAt: Date
}
```

### 9. Behavior Categories
```typescript
interface BehaviorCategory {
  id: string
  name: string // e.g., "Academic Engagement", "Social Communication", "Attention"
  description: string
  domain: "academic" | "behavioral" | "social" | "emotional" | "physical"
  isPositive: boolean
  color?: string // for UI coding
}
```

### 10. Observation Templates
```typescript
interface ObservationTemplate {
  id: string
  name: string
  description: string
  userId: string
  behaviorCategories: string[] // BehaviorCategory IDs
  defaultInterval: number // minutes between observations
  prompts?: string[]
  isPublic: boolean
  createdAt: Date
}
```

## Relationships

- User (1) -> Observations (many)
- Student (1) -> Observations (many)
- Student (many) -> IDEA Categories (1-2) [primary and secondary]
- School (1) -> Students (many)
- School (1) -> Teachers (many)
- School (1) -> Classrooms (many)
- Teacher (1) -> Classrooms (many)
- Classroom (1) -> Observations (many)
- Observation (1) -> Observation Entries (many)
- Observation Entry (many) -> Behavior Categories (many) [through tags]

## IDEA Disability Categories (Seeded Data)

1. AU - Autism
2. DB - Deaf-Blindness
3. DD - Developmental Delay (Birth-9 only)
4. ED - Emotional Disturbance
5. HI - Hearing Impairment
6. ID - Intellectual Disability
7. MD - Multiple Disabilities
8. OI - Orthopedic Impairment
9. OHI - Other Health Impairment
10. SLD - Specific Learning Disability
11. SLI - Speech or Language Impairment
12. TBI - Traumatic Brain Injury
13. VI - Visual Impairment

## Indexes for Performance

- Students: schoolId, primaryIdeaCategoryId, isActive
- Observations: studentId, observerId, date, status
- ObservationEntries: observationId, timeOfDay
- Teachers: schoolId
- Classrooms: schoolId, teacherId