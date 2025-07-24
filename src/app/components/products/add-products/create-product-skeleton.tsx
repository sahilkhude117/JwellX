// src/components/ui/loading-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const FormFieldSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
    </div>
);

export const SelectFieldSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
    </div>
);

export const TextareaFieldSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
    </div>
);

export const ProductFormSkeleton = () => (
    <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
                {/* Product Details Section */}
                <div className="border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormFieldSkeleton />
                            <FormFieldSkeleton />
                            <div className="md:col-span-2">
                                <TextareaFieldSkeleton />
                            </div>
                            <SelectFieldSkeleton />
                            <SelectFieldSkeleton />
                            <FormFieldSkeleton />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <Skeleton className="h-12 w-12 mx-auto mb-4" />
                                    <Skeleton className="h-4 w-48 mx-auto mb-2" />
                                    <Skeleton className="h-8 w-24 mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attributes Section */}
                <div className="border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-5 w-6 rounded" />
                            <Skeleton className="h-6 w-36" />
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <Skeleton className="h-10 w-10" />
                                </div>
                            ))}
                            <Skeleton className="h-12 w-full border-dashed" />
                        </div>
                    </div>
                </div>

                {/* Variants Section */}
                <div className="border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-5 w-6 rounded" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="space-y-6">
                            <div className="border border-gray-200 rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                                <div className="px-6 py-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <FormFieldSkeleton key={i} />
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-5 w-36" />
                                            <Skeleton className="h-8 w-24" />
                                        </div>
                                        {[1, 2].map((i) => (
                                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                                                <SelectFieldSkeleton />
                                                <FormFieldSkeleton />
                                                <FormFieldSkeleton />
                                                <div className="flex items-end">
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full border-dashed" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Actions Skeleton */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-end space-x-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    </div>
);

export const VariantSkeleton = () => (
    <div className="border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
        <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <FormFieldSkeleton key={i} />
                ))}
            </div>
            <div className="h-px bg-gray-200" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                    <SelectFieldSkeleton />
                    <FormFieldSkeleton />
                    <FormFieldSkeleton />
                    <div className="flex items-end">
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);