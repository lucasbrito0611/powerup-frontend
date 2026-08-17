import { Skeleton } from "@/components/ui/skeleton";

export const TopbarAuthSkeleton = () => {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="w-[34px] h-[34px] tb:w-[38px] tb:h-[38px] rounded-full mr-1" />
            <div className="hidden nt-sm:flex items-center gap-2">
                <Skeleton className="w-[78px] h-[38px] rounded-tl-[10px] rounded-br-[10px]" />
                <Skeleton className="w-[98px] h-[38px] rounded-tl-[10px] rounded-br-[10px]" />
            </div>
        </div>
    );
};

export default TopbarAuthSkeleton;
