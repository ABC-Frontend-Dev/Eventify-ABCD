"use client";

import { useState } from "react";
import TiptapEditor, { HeadingItem } from "@/components/Editor/TiptapEditor";
import { TableOfContents } from "@/components/Editor/TableOfContents";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditorTestPage() {
    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState<HeadingItem[]>([]);

    return (
        <div className="container max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Rich Text Editor Test</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Editor */}
                <div className="lg:col-span-3">
                    <TiptapEditor content={content} onChange={setContent} onHeadingsChange={setHeadings} />
                </div>

                {/* Table of Contents - Multiple Variants */}
                <div className="lg:col-span-1 space-y-4">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="h1">H1</TabsTrigger>
                            <TabsTrigger value="h2">H2</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">All Headings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TableOfContents headings={headings} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="h1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">H1 Only</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TableOfContents headings={headings} levels={[1]} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="h2">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">H2 Only</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TableOfContents headings={headings} levels={[2]} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Additional TOC Variants */}
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-sm">H1 + H2 Only</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TableOfContents headings={headings} levels={[1, 2]} />
                        </CardContent>
                    </Card>

                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-sm">H3 (No Indent)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TableOfContents headings={headings} levels={[3]} showIndentation={false} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Heading Count Stats */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Heading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((level) => {
                            const count = headings.filter((h) => h.level === level).length;
                            return (
                                <div key={level} className="text-center">
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-sm text-muted-foreground">H{level}</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
