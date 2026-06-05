import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProjectCategoriesTableLoader() {
    return (
        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                    {/* All Categories */}
                    <Skeleton className="h-8 w-44" />

                    {/* 4 Categories badge */}
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">
                                    <Skeleton className="h-5 w-8" />
                                </TableHead>

                                <TableHead className="min-w-[200px]">
                                    <Skeleton className="h-5 w-14" />
                                </TableHead>

                                <TableHead className="min-w-[300px]">
                                    <Skeleton className="h-5 w-24" />
                                </TableHead>

                                <TableHead className="text-right w-32">
                                    <Skeleton className="h-5 w-16 ml-auto" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {/* ID */}
                                    <TableCell>
                                        <Skeleton className="h-5 w-10" />
                                    </TableCell>

                                    {/* Name */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-2.5 w-2.5 rounded-full" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-full max-w-[520px]" />
                                            <Skeleton className="h-4 w-full max-w-[420px]" />
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
