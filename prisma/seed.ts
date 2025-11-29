import { PrismaClient } from '@prisma/client'  
import bcrypt from 'bcryptjs'  
  
const prisma = new PrismaClient()  
  
async function main() {  
  // Clear existing data  
  await prisma.observationEntry.deleteMany()  
  await prisma.observation.deleteMany()  
  await prisma.student.deleteMany()  
  await prisma.ideaCategory.deleteMany()  
  await prisma.user.deleteMany()  
  
  console.log('Seeding database...')  
  
  // Create IDEA categories  
  const ideaCategories = await Promise.all([  
    prisma.ideaCategory.create({  
      data: {  
        name: 'Autism',  
        description: 'Autism spectrum disorder affecting social communication and behavior'  
      }  
    }),  
    prisma.ideaCategory.create({  
      data: {  
        name: 'Specific Learning Disability',  
        description: 'Difficulty in learning and using academic skills'  
      }  
    }),  
    prisma.ideaCategory.create({  
      data: {  
        name: 'Intellectual Disability',  
        description: 'Significantly below average intellectual functioning'  
      }  
    }),  
    prisma.ideaCategory.create({  
      data: {  
        name: 'Emotional Disturbance',  
        description: 'Emotional or behavioral difficulties that affect educational performance'  
      }  
    }),  
    prisma.ideaCategory.create({  
      data: {  
        name: 'Speech or Language Impairment',  
        description: 'Communication disorders affecting speech or language'  
      }  
    }),  
  ])  
  
  // Create admin user  
  const hashedPassword = await bcrypt.hash('admin123', 10)  
  const adminUser = await prisma.user.create({  
    data: {  
      email: 'admin@school.edu',  
      password: hashedPassword,  
      name: 'Dr. Jerry Turner',  
      role: 'psychologist'  
    }  
  })  
  
  // Create sample students  
  await Promise.all([  
    prisma.student.create({  
      data: {  
        name: 'John Smith',  
        grade: '3rd Grade',  
        dateOfBirth: new Date('2016-05-15'),  
        ideaCategoryId: ideaCategories[0].id,  
        userId: adminUser.id  
      }  
    }),  
    prisma.student.create({  
      data: {  
        name: 'Emma Johnson',  
        grade: '5th Grade',   
        dateOfBirth: new Date('2014-08-22'),  
        ideaCategoryId: ideaCategories[1].id,  
        userId: adminUser.id  
      }  
    })  
  ])  
  
  console.log('Database seeded successfully!')  
}  
  
main()  
  .catch((e) => {  
    console.error(e)  
    process.exit(1)  
  })  
  .finally(async () => {  
    await prisma.$disconnect()  
  })  
