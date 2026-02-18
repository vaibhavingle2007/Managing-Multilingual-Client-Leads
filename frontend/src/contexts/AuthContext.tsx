"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    updateProfile,
    type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/* ------------------------------------------------------------------ */
/*  Agent email list — add agent emails here                           */
/* ------------------------------------------------------------------ */

const AGENT_EMAILS = new Set([
    "agenta@gmail.com",
    "agentb@gmail.com",
    "agentc@gmail.com",
    // Add more agent emails here
]);

export type UserRole = "client" | "agent";

/* ------------------------------------------------------------------ */
/*  Context shape                                                      */
/* ------------------------------------------------------------------ */

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>("client");
    const [loading, setLoading] = useState(true);

    /* ---- Listen for auth state changes ---- */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser?.email) {
                setRole(
                    AGENT_EMAILS.has(firebaseUser.email.toLowerCase())
                        ? "agent"
                        : "client"
                );
            } else {
                setRole("client");
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    /* ---- Email / Password sign in ---- */
    async function signIn(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    /* ---- Email / Password register ---- */
    async function signUp(email: string, password: string, name: string) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
    }

    /* ---- Google sign in ---- */
    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }

    /* ---- Sign out ---- */
    async function signOut() {
        await firebaseSignOut(auth);
    }

    return (
        <AuthContext.Provider
            value={{ user, role, loading, signIn, signUp, signInWithGoogle, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
