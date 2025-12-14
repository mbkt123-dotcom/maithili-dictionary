import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating users for each role...')

  // Default password for all test users
  const defaultPassword = 'Test1234!'
  const hashedPassword = await hashPassword(defaultPassword)

  const users = [
    {
      email: 'public@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Public User',
      role: UserRole.PUBLIC,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'researcher@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Field Researcher',
      role: UserRole.FIELD_RESEARCHER,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'editor@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Editor',
      role: UserRole.EDITOR,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'senior.editor@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Senior Editor',
      role: UserRole.SENIOR_EDITOR,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'editor.in.chief@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Editor in Chief',
      role: UserRole.EDITOR_IN_CHIEF,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'admin@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Administrator',
      role: UserRole.ADMIN,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
    {
      email: 'superadmin@maithili.test',
      passwordHash: hashedPassword,
      fullName: 'Super Administrator',
      role: UserRole.SUPER_ADMIN,
      authProvider: 'EMAIL' as const,
      isActive: true,
    },
  ]

  for (const userData of users) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existing) {
        // Update existing user
        const updated = await prisma.user.update({
          where: { email: userData.email },
          data: {
            passwordHash: hashedPassword,
            fullName: userData.fullName,
            role: userData.role,
            isActive: true,
          },
        })
        console.log(`✅ Updated: ${userData.email} (${userData.role}) - ID: ${updated.id}`)
      } else {
        // Create new user
        const user = await prisma.user.create({
          data: userData,
        })
        console.log(`✅ Created: ${userData.email} (${userData.role}) - ID: ${user.id}`)
      }
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error)
    }
  }

  console.log('\n✅ All users created/updated successfully!')
  console.log('\n📋 User Credentials:')
  console.log('='.repeat(60))
  users.forEach((user) => {
    console.log(`\nRole: ${user.role}`)
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${defaultPassword}`)
  })
  console.log('\n' + '='.repeat(60))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

