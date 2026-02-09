"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const LoginPage = () => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Login failed");
                setLoading(false);
                return;
            }

            toast.success("Login successful!");
            router.push(`/${data.role}`);
            router.refresh(); // Refresh to update middleware/server components
        } catch (error) {
            toast.error("An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
            <div className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2 w-full max-w-md">
                <h1 className="text-xl font-bold flex items-center gap-2 justify-center mb-4">
                    <Image src="/logo.png" alt="" width={24} height={24} />
                    UBUNTU MP
                </h1>
                <h2 className="text-gray-400 text-center mb-6">Sign in to your account</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-500">Username</label>
                        <input
                            type="text"
                            required
                            className="p-2 rounded-md ring-1 ring-gray-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-500">Password</label>
                        <input
                            type="password"
                            required
                            className="p-2 rounded-md ring-1 ring-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white my-4 rounded-md text-sm p-[10px] disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
