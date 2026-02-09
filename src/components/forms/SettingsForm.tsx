"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { settingsSchema, SettingsSchema } from "@/lib/formValidationSchemas";
import InputField from "../InputField";
import { updateSettings } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SettingsForm = ({ data }: { data?: any }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SettingsSchema>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            phone: data?.phone || "",
            email: data?.email || "",
            address: data?.address || "",
            img: data?.img || "",
        },
    });

    const [state, formAction] = useFormState(updateSettings, {
        success: false,
        error: false,
    });

    const router = useRouter();

    const onSubmit = handleSubmit((data) => {
        formAction(data);
    });

    useEffect(() => {
        if (state.success) {
            toast("Settings updated successfully!");
            router.refresh();
        }
    }, [state, router]);

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">Change Settings</h1>
            <div className="flex flex-wrap gap-4">
                <InputField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    register={register}
                    error={errors?.currentPassword}
                />
                <InputField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    register={register}
                    error={errors?.newPassword}
                />
                <InputField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    register={register}
                    error={errors?.confirmPassword}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">Personal Information</span>
            <div className="flex flex-wrap gap-4">
                <InputField
                    label="Email"
                    name="email"
                    register={register}
                    error={errors?.email}
                />
                <InputField
                    label="Phone"
                    name="phone"
                    register={register}
                    error={errors?.phone}
                />
                <InputField
                    label="Address"
                    name="address"
                    register={register}
                    error={errors?.address}
                />
            </div>
            {state.error && (
                <span className="text-red-500">Something went wrong! {(state as any).message}</span>
            )}
            <button className="bg-blue-400 text-white p-2 rounded-md">Update</button>
        </form>
    );
};

export default SettingsForm;
