import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    Credentials({
      name: 'Admin',
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;
        const a = await prisma.admin.findUnique({ where: { email: c.email } });
        if (!a || !(await bcrypt.compare(c.password, a.passwordHash))) return null;
        return { id: String(a.id), email: a.email, name: 'Admin' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.role = account.provider === 'credentials' ? 'admin' : 'client';
      return token;
    },
    async session({ session, token }) { (session as any).role = token.role; return session; },
  },
};
export async function isAdmin() {
  const s: any = await getServerSession(authOptions);
  return s?.role === 'admin';
}
