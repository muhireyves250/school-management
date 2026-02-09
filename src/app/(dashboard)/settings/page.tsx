import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SettingsForm from "@/components/forms/SettingsForm";

const SettingsPage = async () => {
    const session = await getSession();

    if (!session || !session.userId) {
        return redirect("/login");
    }

    const { userId, role } = session;

    let user: any = null;

    if (role === "admin") {
        user = await prisma.admin.findUnique({
            where: { username: session.username as string },
        });
    } else if (role === "teacher") {
        user = await prisma.teacher.findUnique({
            where: { id: userId as string },
        });
    } else if (role === "student") {
        user = await prisma.student.findUnique({
            where: { id: userId as string },
        });
    } else if (role === "parent") {
        user = await prisma.parent.findUnique({
            where: { id: userId as string },
        });
    }

    if (!user) {
        return notFound();
    }

    return (
        <div className="p-4 bg-white rounded-md flex-1 m-4 mt-0">
            <SettingsForm data={user} />
        </div>
    );
};

export default SettingsPage;
