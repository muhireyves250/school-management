import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { Prisma, Attendance, Student, Lesson } from "@prisma/client";
import Image from "next/image";

type AttendanceList = Attendance & {
    student: Student;
    lesson: Lesson;
};

const AttendanceListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const session = await getSession();
    const role = session?.role as string;
    const currentUserId = session?.userId as string;

    const columns = [
        {
            header: "Date",
            accessor: "date",
        },
        {
            header: "Student",
            accessor: "student",
        },
        {
            header: "Lesson",
            accessor: "lesson",
        },
        {
            header: "Status",
            accessor: "status",
        },
        ...(role === "admin" || role === "teacher"
            ? [
                {
                    header: "Actions",
                    accessor: "action",
                },
            ]
            : []),
    ];

    const renderRow = (item: AttendanceList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="p-4">
                {new Intl.DateTimeFormat("en-US").format(item.date)}
            </td>
            <td>{item.student.name + " " + item.student.surname}</td>
            <td>{item.lesson.name}</td>
            <td>
                <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${item.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {item.present ? "Present" : "Absent"}
                </span>
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="attendance" type="update" data={item} />
                            <FormContainer table="attendance" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    const { page, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.AttendanceWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "studentId":
                        query.studentId = value;
                        break;
                    case "search":
                        query.student = {
                            name: { contains: value, mode: "insensitive" },
                        };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // ROLE CONDITIONS
    switch (role) {
        case "admin":
            break;
        case "teacher":
            query.lesson = {
                teacherId: currentUserId!,
            };
            break;
        case "student":
            query.studentId = currentUserId!;
            break;
        case "parent":
            query.student = {
                parentId: currentUserId!,
            };
            break;
        default:
            break;
    }

    const [data, count] = await prisma.$transaction([
        prisma.attendance.findMany({
            where: query,
            include: {
                student: { select: { name: true, surname: true } },
                lesson: { select: { name: true } },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
            orderBy: {
                date: "desc",
            },
        }),
        prisma.attendance.count({ where: query }),
    ]);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Attendance</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="attendance" type="create" />
                        )}
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data} />
            {/* PAGINATION */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default AttendanceListPage;
