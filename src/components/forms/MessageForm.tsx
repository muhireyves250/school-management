"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { createMessage } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const MessageForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MessageSchema>({
        resolver: zodResolver(messageSchema),
    });

    const [state, formAction] = useFormState(createMessage, {
        success: false,
        error: false,
    });

    const onSubmit = handleSubmit((data) => {
        formAction(data);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Message has been sent!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, setOpen]);

    const { users } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Send a new message" : "Update the message"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Receiver</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("receiverId")}
                        defaultValue={data?.receiverId}
                    >
                        {users.map((user: { id: string; name: string }) => (
                            <option value={user.id} key={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    {errors.receiverId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.receiverId.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Body</label>
                    <textarea
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-32"
                        {...register("body")}
                        defaultValue={data?.body}
                    />
                    {errors.body?.message && (
                        <p className="text-xs text-red-400">
                            {errors.body.message.toString()}
                        </p>
                    )}
                </div>
            </div>
            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Send" : "Update"}
            </button>
        </form>
    );
};

export default MessageForm;
