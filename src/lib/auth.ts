import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from './db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      name: string
      role: UserRole
      shopId: string
      shopName: string
    }
  }

  interface User {
    id: string
    username: string
    name: string
    role: UserRole
    shopId: string
    shopName: string
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: UserRole
    shopId: string
    shopName: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
              active: true
            },
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                  active: true
                }
              }
            }
          })

          if (!user || !user.shop.active) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          // Log audit
          await prisma.auditLog.create({
            data: {
              action: "LOGIN",
              entityType: "User",
              entityId: user.id,
              description: `User ${user.username} logged in`,
              userId: user.id
            }
          })

          return {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            shopId: user.shopId,
            shopName: user.shop.name
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.shopId = user.shopId
        token.shopName = user.shopName
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        name: token.name || "",
        role: token.role,
        shopId: token.shopId,
        shopName: token.shopName
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET
}