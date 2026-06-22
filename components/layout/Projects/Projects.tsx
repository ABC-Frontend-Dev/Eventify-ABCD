// components/layout/Projects/Projects.tsx
"use client";

import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import Image from "next/image";
import axios from "axios";
import Modal from "@/components/ui/modal-drop";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EmblaCarousel } from "./Carousel";

interface Category {
    id: number;
    name: string;
    description: string | null;
}

interface Project {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    images: string[];
    categoryId: number;
    category: Category;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEasyCloseOpen, setIsEasyCloseOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get("/api/projects");

            if (response.data.success) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = Array.from(new Map(projects.map((project) => [project.category.id, project.category])).values());

    if (loading) {
        return <section className="max-w-360 w-full mx-auto px-20 py-9 scroll-mt-14">Loading projects...</section>;
    }

    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9 scroll-mt-14">
            <Button
                onClick={() => {
                    console.log("TEST");
                    setIsEasyCloseOpen(true);
                }}
            >
                Test Modal
            </Button>
            <Tabs defaultValue="tab-all">
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithLogo titlePart1="" titlePart2_1="proj" titlePart2_2="ts" />
                        <SubHeading title="Explore remaining projects" />
                        <HeaderDescription description="The talented individuals working together to create memorable events." scrollContainerRef={undefined} />
                    </div>

                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-2.5">
                        <TabsTab value="tab-all" className="rounded-none text-sm py-4 px-6.75">
                            All Projects
                        </TabsTab>

                        {categories.map((category) => (
                            <TabsTab key={category.id} value={`tab-${category.id}`} className="rounded-none text-sm py-4 px-6.75">
                                {category.name}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-9">
                    {/* ALL PROJECTS */}
                    <TabsPanel value="tab-all">
                        <div className="grid grid-cols-3 gap-1.5">
                            {projects.map((project) => (
                                <div key={project.id} className="relative group">
                                    <Image src={project.bannerImage} alt={project.title} width={1000} height={1000} className="w-full" />

                                    <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-18.25 bg-black/50 backdrop-blur-lg">
                                        <div className="flex items-center justify-center flex-col w-full h-full text-white">
                                            <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>

                                            <p className="font-helvetica text-sm leading-4.5 text-center">{project.description}</p>
                                        </div>

                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[93%] z-10 bg-white">
                                            <button className="text-slate-950 px-3.75 py-2.5 font-helvetica font-medium text-[16px] text-center w-full h-full">{project.category.name}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsPanel>

                    {/* CATEGORY PROJECTS */}
                    {categories.map((category) => (
                        <TabsPanel key={category.id} value={`tab-${category.id}`}>
                            <div className="grid grid-cols-3 gap-1.5">
                                {projects
                                    .filter((project) => project.categoryId === category.id)
                                    .map((project) => (
                                        <div key={project.id} className="relative z-100 group">
                                            <Image src={project.bannerImage} alt={project.title} width={1000} height={1000} className="w-full" />

                                            <div className="group-hover:opacity-100 group-hover:z-10 transition-opacity duration-500 opacity-0 z-0 absolute left-0 top-0 w-full h-full px-18.25 bg-black/50 backdrop-blur-lg">
                                                <div className="flex items-center justify-center flex-col w-full h-full text-white">
                                                    <h2 className="font-helvetica text-[26px] font-bold text-center">{project.title}</h2>

                                                    <p className="font-helvetica text-sm leading-4.5 text-center">{project.description}</p>
                                                </div>
                                                {/* bottom-5 left-1/2 -translate-x-1/2 */}
                                                {/* <div className="relative  w-[93%] z-[1000] cursor-pointer bg-white">
                                                    <button
                                                        onClick={() => {
                                                            console.log("clicked");
                                                            setIsEasyCloseOpen(true);
                                                        }}
                                                        className="absolute z-[9999] text-slate-950 bottom-5 left-1/2 -translate-x-1/2 px-3.75 py-2.5 font-helvetica font-medium text-[16px] text-center w-full h-full pointer-events-auto z-50"
                                                        style={{ pointerEvents: "auto" }}
                                                    >
                                                        {project.category.name}
                                                    </button>
                                                </div> */}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </TabsPanel>
                    ))}
                </div>
            </Tabs>
            <Modal isOpen={isEasyCloseOpen} onClose={() => setIsEasyCloseOpen(false)} className="p-0 max-w-166 w-full h-165.25 bg-white" allowEasyClose={true}>
                <div className="p-2.5">
                    {/* w-full h-103 overflow-hidden */}
                    <EmblaCarousel />

                    <div className="p-5">
                        <p className="text-[34px] font-product-sans-bold font-semibold tracking-wide leading-10 text-footer-bg">Dubai Premier Padel</p>
                        <p className="text-xl font-product-sans-medium tracking-wide leading-6.5 mt-2 text-footer-bg">
                            The World Chamber Congress hosted by Dubai Chamber and the International Chamber of Commerce was a three day congress at Madinat Jumeirah Conference Center. We were
                            privileged to be the agency executing this mammoth event from plenary sessions to multiple learningt.
                        </p>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
