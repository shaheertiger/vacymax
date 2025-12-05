import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export const authOptions = {
    providers: [
        // Email/Password Authentication
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                // Check if user exists in Supabase
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single();

                if (error || !user) {
                    throw new Error('Invalid credentials');
                }

                // Verify password
                const isValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
        }),

        // Google OAuth
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers, create user in Supabase if doesn't exist
            if (account?.provider === 'google') {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (!existingUser) {
                    await supabase.from('users').insert({
                        email: user.email,
                        name: user.name,
                        provider: 'google',
                        provider_id: account.providerAccountId,
                    });
                }
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export default async function handler(req, res) {
    return await NextAuth(req, res, authOptions);
}
