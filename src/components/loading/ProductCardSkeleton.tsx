import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
    return (
        <div className="relative flex flex-col tb:w-[220px] w-[200px]">
            {/* Imagem Placeholder */}
            <div className="z-10 w-full h-[180px] tb:h-[200px]">
                <Skeleton className="w-full h-full rounded-3xl" />
            </div>

            {/* Corpo do Card */}
            <div className="flex flex-col flex-grow bg-white rounded-b-3xl shadow-lg px-5 pt-10 pb-5 -mt-7 z-0 space-y-4">
                {/* Linhas do Título */}
                <div className="space-y-2 mt-2">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                </div>

                {/* Preço e Tag */}
                <div className="flex justify-between items-center pt-2">
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-12 rounded" />
                        <Skeleton className="h-6 w-20 rounded" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export const ProductGridSkeleton = ({ count = 5 }: { count?: number }) => {
    return (
        <div className="productsContainer">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

export default ProductCardSkeleton;
