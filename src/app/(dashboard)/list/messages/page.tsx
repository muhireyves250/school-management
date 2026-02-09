import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import Image from "next/image";

type MessageList = any;

const MessageListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const session = await getSession();
    const role = session?.role as string;
    const currentUserId = session?.userId as string;

    const columns = [
        {
            header: "Title",
            accessor: "title",
        },
        {
            header: "Sender",
            accessor: "senderId",
        },
        {
            header: "Receiver",
            accessor: "receiverId",
        },
        {
            header: "Date",
            accessor: "date",
            className: "hidden md:table-cell",
        },
        {
            header: "Actions",
            accessor: "action",
        },
    ];

    const renderRow = (item: MessageList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="p-4">{item.title}</td>
            <td>{item.senderId}</td>
            <td>{item.receiverId}</td>
            <td className="hidden md:table-cell">
                {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || item.senderId === currentUserId) && (
                        <FormContainer table="message" type="delete" id={item.id} />
                    )}
                </div>
            </td>
        </tr>
    );

    const { page, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: any = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.title = { contains: value, mode: "insensitive" };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // ROLE CONDITIONS: Admins see all, others only their own (sent or received)
    if (role !== "admin") {
        query.OR = [
            { senderId: currentUserId },
            { receiverId: currentUserId },
        ];
    }

    const [data, count] = await (prisma as any).$transaction([
        (prisma as any).message.findMany({
            where: query,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
            orderBy: {
                createdAt: "desc",
            },
        }),
        (prisma as any).message.count({ where: query }),
    ]);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Messages</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        <FormContainer table="message" type="create" />
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

export default MessageListPage;
