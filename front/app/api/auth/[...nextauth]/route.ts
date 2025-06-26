import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
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
            return {
              id: data.access_token,
              name: username,
              email: `${username}@example.com`,
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
      if (user) {
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'votre-secret-tres-long-et-securise',
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}
