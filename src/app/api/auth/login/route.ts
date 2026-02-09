import prisma from "@/lib/prisma";
import { comparePassword, createSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required" },
                { status: 400 }
            );
        }

        // Check in all tables based on expected logic, or generic username usage.
        // Since usernames are unique across tables in this schema?
        // Actually schema has separate tables. Username might collide between Admin/Teacher?
        // Usernames in seed seem unique (admin1, teacher1).
        // Logic: Try finding in Admin, then Teacher, then Student, then Parent.

        let user: any = null;
        let role = "";

        // 1. Admin
        user = await prisma.admin.findUnique({ where: { username } });
        if (user) role = "admin";

        // 2. Teacher
        if (!user) {
            user = await prisma.teacher.findUnique({ where: { username } });
            if (user) role = "teacher";
        }

        // 3. Student
        if (!user) {
            user = await prisma.student.findUnique({ where: { username } });
            if (user) role = "student";
        }

        // 4. Parent
        if (!user) {
            user = await prisma.parent.findUnique({ where: { username } });
            if (user) role = "parent";
        }

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify Password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create session
        await createSession({
            userId: user.id,
            role: role,
            username: user.username,
        });

        return NextResponse.json({ message: "Logged in successfully", role });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
