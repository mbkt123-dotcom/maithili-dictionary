import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import TwitterProvider from "next-auth/providers/twitter"
import { prisma } from "@/lib/db/prisma"
import { verifyPassword } from "@/lib/auth/password"

// Build providers array conditionally based on environment variables
const providers: any[] = []

// Credentials provider for email/password authentication
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required")
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("Your account has been deactivated. Please contact support.")
      }

      // Check if user has a password (not OAuth-only account)
      if (!user.passwordHash) {
        throw new Error("Please sign in using your social account or reset your password")
      }

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.passwordHash)

      if (!isValid) {
        throw new Error("Invalid email or password")
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      // Return user object (will be available in session)
      return {
        id: user.id,
        email: user.email,
        name: user.fullName || user.email,
        image: user.avatarUrl,
      }
    },
  })
)

// OAuth providers (optional)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )
}

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      const userId = (token as any)?.id || token?.sub
      
      if (session.user && userId) {
        session.user.id = userId as string
        
        // Fetch user data from database (cached in token if available)
        if (!token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { role: true, email: true, fullName: true, avatarUrl: true },
          })
          
          if (dbUser) {
            (token as any).role = dbUser.role
            token.email = dbUser.email || token.email
            (token as any).name = dbUser.fullName
            (token as any).image = dbUser.avatarUrl
          }
        }
        
        // Use cached token data
        (session.user as any).role = (token as any).role
        if ((token as any).name) session.user.name = (token as any).name
        if ((token as any).image) (session.user as any).image = (token as any).image
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        (token as any).id = user.id
        token.email = user.email || token.email
      }
      return token
    },
    async signIn({ user, account }) {
      // Update last login time for OAuth providers (non-blocking)
      if (user?.id && account?.provider !== "credentials") {
        prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }).catch(() => {
          // Ignore errors if user doesn't exist yet (will be created by adapter)
        })
      }
      return true
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

