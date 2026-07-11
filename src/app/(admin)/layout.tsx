'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@/providers/data-provider";
import { authProvider } from "@/providers/auth-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user || user.perfil !== 'admin') {
            router.push(`/login?redirect=/admin`);
            return;
        }

        setIsAuthorized(true);
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='flex flex-col'>
            <div className="relative flex gap-15 bodyPadding min-h-screen items-stretch dt:py-16 py-12">
                <Sidebar />
                <div className="relative z-1 flex-1 flex flex-col gap-15">
                    <Refine
                        dataProvider={dataProvider}
                        authProvider={authProvider}
                        routerProvider={routerProvider}
                        resources={[
                            {
                                name: "pedidos",
                                list: "/admin/pedidos",
                            }
                        ]}
                    >
                        {children}
                    </Refine>
                </div>
            </div>
            <Footer />
        </div>
    );
}