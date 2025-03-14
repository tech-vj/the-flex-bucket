import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extend Session & JWT types to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      token: string;
    };
  }

  interface JWT {
    id: string;
    name?: string | null;
    token: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        credential: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.credential || !credentials?.password) {
            console.error("Missing credentials");
            throw new Error("Missing username or password");
          }

          console.log("Attempting to authenticate:", {
            credential: credentials.credential,
            password: credentials.password,
          });

          const res = await fetch("http://183.82.7.208:3002/anyapp/authentication/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "login",
              credential: credentials.credential,
              password: credentials.password,
              device_id: "device_unique_id",
              app_secret: process.env.APP_SECRET || "38475203487kwsdjfvb1023897yfwbhekrfj",
            }),
          });

          const data = await res.json();
          console.log("API Response:", data); // Debugging log

          if (!res.ok || data.status !== "success") {
            console.error("API Error:", res.status, data);
            throw new Error(data.message || "Invalid credentials");
          }

          if (!data.user_id || !data.login_token) {
            console.error("Invalid API response:", data);
            throw new Error("Missing required fields from API");
          }

          return { id: String(data.user_id), name: data.name || null, token: String(data.login_token) };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id as string,
        name: token.name || null,
        token: token.token as string,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "38475203487kwsdjfvb1023897yfwbhekrfj",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
