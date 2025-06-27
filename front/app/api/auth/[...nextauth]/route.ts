import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

// Interface pour le payload décodé du JWT
interface JwtPayload {
  user_id: string;
  sub?: string;
  email?: string;
  role?: string;
  // Ajoutez d'autres champs que votre JWT pourrait contenir
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
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

          if (res.ok && data.access_token) {
            // Décoder le JWT pour obtenir les informations de l'utilisateur
            const decoded = jwt.decode(data.access_token) as JwtPayload | null;

            if (!decoded) {
              console.error('Impossible de décoder le JWT');
              return null;
            }

            // Retourner les informations de l'utilisateur à partir du JWT
            return {
              id: decoded.user_id,
              name: decoded.sub,
              email: decoded.email,
              role: decoded.role,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error('Erreur de connexion:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initialisation avec les données de l'utilisateur
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role,
          accessToken: (user as any).accessToken,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: (token as any).role as string,
        },
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

declare module 'next-auth' {
  interface Session {
    accessToken: string;
  }
}
