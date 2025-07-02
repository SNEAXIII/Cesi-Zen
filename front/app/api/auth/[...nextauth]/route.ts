import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  user_id: string;
  sub: string;
  email: string;
  role: string;
}

export const {
  handlers: { GET, POST },
} = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: "Nom d'utilisateur", type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const username = typeof credentials.username === 'string' ? credentials.username : '';
          const password = typeof credentials.password === 'string' ? credentials.password : '';

          if (!username || !password) return null;

          const formData = new URLSearchParams();
          formData.append('grant_type', 'password');
          formData.append('username', username);
          formData.append('password', password);

          const res = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });

          const data = await res.json();

          if (!res.ok || !data.access_token) {
            return null;
          }

          const decoded = jwt.decode(data.access_token) as JwtPayload | null;

          if (!decoded) {
            console.error('Impossible de décoder le JWT');
            return null;
          }

          return {
            id: decoded.user_id,
            name: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error('Erreur de connexion:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken: user.accessToken,
          accessTokenExpires: Date.now() + 60 * 60 * 1000,
          expired: false,
        };
      }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      return {
        ...token,
        expired: true,
      };
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.expired) {
        return {
          ...session,
          error: 'TokenExpiredError',
        };
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
        },
        accessToken: token.accessToken,
      };
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  logger: {
    error(error: Error) {
      console.error(error);
    },
    warn(code: string) {
      console.warn(code);
    },
    debug(message: string, metadata?: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(message, metadata);
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
    expired: boolean;
  }
}
