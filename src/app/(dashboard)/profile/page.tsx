import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

const ProfilePage = async () => {
    const session = await getSession();

    if (!session || !session.userId) {
        return redirect("/login");
    }

    const userId = session.userId as string;
    const role = session.role as string;

    let user: any = null;

    if (role === "admin") {
        user = await prisma.admin.findUnique({
            where: { username: session.username as string },
        });
    } else if (role === "teacher") {
        user = await prisma.teacher.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        subjects: true,
                        lessons: true,
                        classes: true,
                    },
                },
            },
        });
    } else if (role === "student") {
        user = await prisma.student.findUnique({
            where: { id: userId },
            include: {
                class: { include: { _count: { select: { lessons: true } } } },
            },
        });
    } else if (role === "parent") {
        user = await prisma.parent.findUnique({
            where: { id: userId },
            include: {
                students: true,
            },
        });
    }

    if (!user) {
        return notFound();
    }

    // Determine values based on role
    const name = user.name || user.username;
    const surname = user.surname || "";
    const img = user.img || "/noAvatar.png";
    const bloodType = user.bloodType || "-";
    const email = user.email || "-";
    const phone = user.phone || "-";
    const birthday = user.birthday ? new Intl.DateTimeFormat("en-GB").format(user.birthday) : "-";

    return (
        <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* USER INFO CARD */}
                    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
                        <div className="w-1/3">
                            <Image
                                src={img}
                                alt=""
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>
                        <div className="w-2/3 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold">
                                    {name + " " + surname}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500">
                                This is your personal profile page. You can view your details and relevant statistics here.
                            </p>
                            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/blood.png" alt="" width={14} height={14} />
                                    <span>{bloodType}</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/date.png" alt="" width={14} height={14} />
                                    <span>{birthday}</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/mail.png" alt="" width={14} height={14} />
                                    <span>{email}</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/phone.png" alt="" width={14} height={14} />
                                    <span>{phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* SMALL CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {role === "teacher" && (
                            <>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">90%</h1><span className="text-sm text-gray-400">Attendance</span></div>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user._count.subjects}</h1><span className="text-sm text-gray-400">Branches</span></div>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user._count.lessons}</h1><span className="text-sm text-gray-400">Lessons</span></div>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user._count.classes}</h1><span className="text-sm text-gray-400">Classes</span></div>
                                </div>
                            </>
                        )}
                        {role === "student" && (
                            <>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <Suspense fallback="loading..."><StudentAttendanceCard id={user.id} /></Suspense>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user.class.name.charAt(0)}th</h1><span className="text-sm text-gray-400">Grade</span></div>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user.class._count.lessons}</h1><span className="text-sm text-gray-400">Lessons</span></div>
                                </div>
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                    <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div><h1 className="text-xl font-semibold">{user.class.name}</h1><span className="text-sm text-gray-400">Class</span></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* BOTTOM */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <h1>{role.charAt(0).toUpperCase() + role.slice(1)}&apos;s Schedule</h1>
                    {role === "teacher" && <BigCalendarContainer type="teacherId" id={user.id} />}
                    {role === "student" && <BigCalendarContainer type="classId" id={user.class.id} />}
                    {role === "admin" && <div className="p-4 text-gray-500">Admins can view and manage all schedules from the menu.</div>}
                    {role === "parent" && <div className="p-4 text-gray-500">Parents can view their children&apos;s schedules from the students list.</div>}
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Shortcuts</h1>
                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                        {role === "teacher" && (
                            <>
                                <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/classes?supervisorId=${user.id}`}>Teacher&apos;s Classes</Link>
                                <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/students?teacherId=${user.id}`}>Teacher&apos;s Students</Link>
                                <Link className="p-3 rounded-md bg-lamaYellowLight" href={`/list/lessons?teacherId=${user.id}`}>Teacher&apos;s Lessons</Link>
                                <Link className="p-3 rounded-md bg-pink-50" href={`/list/exams?teacherId=${user.id}`}>Teacher&apos;s Exams</Link>
                                <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/assignments?teacherId=${user.id}`}>Teacher&apos;s Assignments</Link>
                            </>
                        )}
                        {role === "student" && (
                            <>
                                <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/lessons?classId=${user.class.id}`}>Student&apos;s Lessons</Link>
                                <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/teachers?classId=${user.class.id}`}>Student&apos;s Teachers</Link>
                                <Link className="p-3 rounded-md bg-pink-50" href={`/list/exams?classId=${user.class.id}`}>Student&apos;s Exams</Link>
                                <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/assignments?classId=${user.class.id}`}>Student&apos;s Assignments</Link>
                                <Link className="p-3 rounded-md bg-lamaYellowLight" href={`/list/results?studentId=${user.id}`}>Student&apos;s Results</Link>
                            </>
                        )}
                        {role === "parent" && user.students.map((s: any) => (
                            <Link key={s.id} className="p-3 rounded-md bg-lamaSkyLight" href={`/list/students/${s.id}`}>{s.name}&apos;s Profile</Link>
                        ))}
                    </div>
                </div>
                <Performance />
                <Announcements />
            </div>
        </div>
    );
};

export default ProfilePage;
