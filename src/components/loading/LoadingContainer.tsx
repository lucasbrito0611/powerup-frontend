import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { ProductGridSkeleton } from "./ProductCardSkeleton";

interface LoadingContainerProps {
    children: React.ReactNode;
    loading: boolean;
    skeleton?: React.ReactNode;
    type?: "products" | "spinner" | "custom";
    count?: number;
}

const LoadingContainer: React.FC<LoadingContainerProps> = ({
    children,
    loading,
    skeleton,
    type = "spinner",
    count = 5,
}) => {
    if (!loading) {
        return <>{children}</>;
    }

    if (skeleton) {
        return <>{skeleton}</>;
    }

    if (type === "products") {
        return <ProductGridSkeleton count={count} />;
    }

    return (
        <section className="w-full flex justify-center items-center h-64">
            <LoadingSpinner />
        </section>
    );
};

export default LoadingContainer;