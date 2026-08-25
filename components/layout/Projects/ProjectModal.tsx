// components/layout/Projects/ProjectModal.tsx
"use client";

import Modal from "@/components/ui/modal-drop";
import { Tabs as MainTabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/products-tab";
import { EmblaCarousel } from "./Carousel";
export interface ProjectTab {
    id: number;
    name: string;
    images: string[];
    order: number;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Client {
    id: number;
    name: string;
    image: string;
}

export interface Project {
    id: number;
    title: string;
    description: string | null;
    bannerImage: string;
    hasTabs: boolean;
    tabs: ProjectTab[];
    images: string[];
    categoryId: number;
    clientId: number | null;
    projectClientLogo: string | null;
    category: Category;
    client: Client | null;
}

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    activeInnerTab: string;
    onActiveInnerTabChange: (value: string) => void;
}

export function ProjectModal({ isOpen, onClose, project, activeInnerTab, onActiveInnerTabChange }: ProjectModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-80 xxs:max-w-92 md:max-w-2xl lg:max-w-200 bg-white p-0" allowEasyClose={true}>
            {project && (
                <MainTabs value={activeInnerTab} onValueChange={onActiveInnerTabChange}>
                    <div className="flex flex-col bg-white">
                        {/* Media */}
                        <div className="h-80 sm:h-90 md:100 lg:h-110 w-full shrink-0 relative">
                            {project.hasTabs && project.tabs.length > 0 ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                        {project.tabs.map((tab) => (
                                            <TabsPanel key={tab.id} value={`inner-tab-${tab.id}`} className="h-full">
                                                <div className="h-full w-full overflow-hidden relative">
                                                    <EmblaCarousel media={tab.images} />
                                                </div>
                                            </TabsPanel>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full overflow-hidden relative">
                                    <EmblaCarousel media={project.images} />
                                </div>
                            )}
                        </div>

                        {/* Content — desktop */}
                        <div className="p-5 shrink-0 hidden md:flex gap-5 items-center">
                            <div className="max-w-3/5 w-full shrink-0">
                                <p className="font-helvetica-medium text-lg lg:text-[22px] font-semibold leading-6.5 tracking-wide text-footer-bg">{project.title}</p>

                                {project.description && <p className="mt-2 font-helvetica-neue-roman text-sm leading-4.5 tracking-wide text-footer-bg">{project.description}</p>}
                            </div>

                            {project.hasTabs && project.tabs.length > 0 && (
                                <TabsList className="max-w-max w-full mt-0 p-0 rounded-none bg-white gap-1 justify-start">
                                    {project.tabs.map((tab) => (
                                        <TabsTab key={tab.id} value={`inner-tab-${tab.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                            {tab.name}
                                        </TabsTab>
                                    ))}
                                </TabsList>
                            )}
                        </div>

                        {/* Content — mobile */}
                        <div className="p-2.5 shrink-0 block md:hidden">
                            <div className="w-full shrink-0">
                                <p className="font-helvetica-medium text-lg lg:text-[22px] font-semibold leading-6.5 tracking-wide text-footer-bg">{project.title}</p>
                            </div>
                            <div className="mt-2.5 max-w-full w-full shrink-0 flex gap-y-2.5 justify-between">
                                {project.description && <p className="font-helvetica-neue-roman text-sm leading-4.5 tracking-wide text-footer-bg">{project.description}</p>}
                                {project.hasTabs && project.tabs.length > 0 && (
                                    <TabsList className="max-w-max w-full mt-0 p-0 rounded-none bg-white gap-1 justify-start">
                                        {project.tabs.map((tab) => (
                                            <TabsTab key={tab.id} value={`inner-tab-${tab.id}`} className="rounded-none text-sm py-2 sm:py-4 px-2.75 sm:px-6.75">
                                                {tab.name}
                                            </TabsTab>
                                        ))}
                                    </TabsList>
                                )}
                            </div>
                        </div>
                    </div>
                </MainTabs>
            )}
        </Modal>
    );
}
