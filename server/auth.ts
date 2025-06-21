// // server/auth.ts
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import { db } from './db'

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// export const hashPassword = async (password: string): Promise<string> => {
//   return await bcrypt.hash(password, 10)
// }

// export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
//   return await bcrypt.compare(password, hash)
// }

// export const generateToken = (userId: string): string => {
//   return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
// }

// export const verifyToken = (token: string): { userId: string } | null => {
//   try {
//     return jwt.verify(token, JWT_SECRET) as { userId: string }
//   } catch {
//     return null
//   }
// }

// export const getUser = async (token: string) => {
//   const decoded = verifyToken(token)
//   if (!decoded) return null
  
//   return await db.user.findUnique({
//     where: { id: decoded.userId },
//     select: { id: true, email: true, name: true, role: true }
//   })
// }



// server/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export const getUser = async (token: string) => {
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  return await db.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true }
  })
}
