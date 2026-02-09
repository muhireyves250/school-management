import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.AUTH_SECRET || "your-secret-key-change-this-in-production";
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
}

export async function createSession(payload: any) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);

    cookies().set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires,
        sameSite: "lax",
        path: "/",
    });
}

export async function verifySession() {
    const session = cookies().get("session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function logout() {
    cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
    return await verifySession();
}
