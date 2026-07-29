"use client";

import { FC, useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";

interface Position {
    x: number;
    y: number;
}

export interface SmoothCursorProps {
    cursor?: React.ReactNode;
    springConfig?: {
        damping: number;
        stiffness: number;
        mass: number;
        restDelta: number;
    };
}

const DESKTOP_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)";
const CURSOR_STYLE_ID = "smooth-cursor-hide-native";

function isTrackablePointer(pointerType: string) {
    return pointerType !== "touch";
}

function hasPointerCursorInTree(element: HTMLElement | null) {
    let node = element;

    while (node && node !== document.body) {
        if (window.getComputedStyle(node).cursor === "pointer") {
            return true;
        }
        node = node.parentElement;
    }

    return false;
}

function isInteractiveTarget(element: HTMLElement | null) {
    if (!element) return false;

    return !!element.closest(["a", "button", '[role="button"]', "summary", "label", "input:not([type='hidden'])", "select", "textarea", "[data-cursor='pointer']"].join(", "));
}

const CustomCursorSVG: FC<{ isHovering: boolean }> = ({ isHovering }) => {
    const iconColor = isHovering ? "#FFFFFF" : "#7E0ACB";

    return (
        <motion.div
            className="relative"
            animate={{
                scale: isHovering ? 1 : 1,
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
        >
            {/* hover bg so white icon stays visible */}
            <motion.div
                className="absolute left-1/2 top-1/2 rounded-full bg-[#7E0ACB]/30"
                initial={false}
                animate={{
                    scale: isHovering ? 1 : 0.6,
                    opacity: isHovering ? 1 : 0,
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{
                    width: 34,
                    height: 34,
                    x: "-50%",
                    y: "-50%",
                }}
            />

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="30"
                viewBox="0 0 46 44"
                fill="none"
                style={{
                    filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <g clipPath="url(#clip0_172_894)">
                    <motion.path
                        d="M31.224 6.19238L31.2897 6.19826C31.3813 6.27518 31.5419 6.72349 31.5911 6.84973L31.9841 7.8494C32.0849 8.10326 32.894 9.98302 32.8739 10.0663C32.4788 10.2906 31.5457 10.6301 31.0739 10.8263L26.5578 12.6531L14.8215 17.415L14.7435 17.3997C14.6285 17.2793 13.3352 13.9727 13.1406 13.5346L24.0514 9.10519C25.6057 8.4833 27.1568 7.85355 28.7048 7.216C29.5004 6.89337 30.4525 6.54604 31.224 6.19238Z"
                        animate={{ fill: iconColor }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.path
                        d="M13.2406 29.3108C13.4555 29.3682 14.8251 29.3465 15.119 29.3463L19.0132 29.3465L27.9577 29.3469L30.8495 29.3467C31.5034 29.3467 32.1708 29.3571 32.8225 29.3262C32.8448 30.3069 32.8135 31.3151 32.8266 32.2983C32.8321 32.7176 32.8155 33.1545 32.8379 33.5713C32.4031 33.5471 31.8466 33.562 31.4011 33.562L28.8634 33.5618H21.0562H15.8308L14.2689 33.561C13.9423 33.5608 13.5458 33.5485 13.2287 33.5864C13.2436 33.3084 13.2326 32.9202 13.2325 32.634L13.2316 30.5319C13.2314 30.1534 13.2193 29.6831 13.2406 29.3108Z"
                        animate={{ fill: iconColor }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.path
                        d="M13.7374 18.9656C13.9208 19.0418 14.4962 19.1275 14.707 19.1675C15.3887 19.297 16.0755 19.3886 16.7596 19.512L28.6052 21.5548L30.9106 21.953C31.2557 22.0115 32.7817 22.2222 33 22.3488V22.4175C32.9334 22.6886 32.9291 23.0385 32.8717 23.3277C32.734 24.0211 32.6176 24.7034 32.5175 25.4029C32.4623 25.7888 32.3775 26.0613 32.3473 26.4773L19.0904 24.1918L15.0273 23.5026C14.684 23.445 14.3765 23.3923 14.0326 23.3249C13.6951 23.2588 13.3743 23.2579 13.0313 23.1461C13.0308 23.0301 13.0775 22.8371 13.0953 22.711C13.1512 22.3145 13.2198 21.9117 13.2948 21.518C13.4559 20.6716 13.5572 19.8067 13.7374 18.9656Z"
                        animate={{ fill: iconColor }}
                        transition={{ duration: 0.2 }}
                    />
                </g>

                <defs>
                    <clipPath id="clip0_172_894">
                        <rect width="20" height="27.7344" fill="white" transform="translate(13 6)" />
                    </clipPath>
                </defs>
            </svg>
        </motion.div>
    );
};

export function SmoothCursor({
    cursor,
    springConfig = {
        damping: 45,
        stiffness: 400,
        mass: 1,
        restDelta: 0.001,
    },
}: SmoothCursorProps) {
    const lastMousePos = useRef<Position>({ x: 0, y: 0 });
    const velocity = useRef<Position>({ x: 0, y: 0 });
    const lastUpdateTime = useRef(Date.now());

    const [isEnabled, setIsEnabled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    const tilt = useSpring(0, {
        damping: 20,
        stiffness: 150,
        mass: 0.5,
    });

    const scale = useSpring(1, {
        ...springConfig,
        stiffness: 500,
        damping: 35,
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);

        const updateEnabled = () => {
            const enabled = mediaQuery.matches;
            setIsEnabled(enabled);

            if (!enabled) {
                setIsVisible(false);
                setIsHovering(false);
            }
        };

        updateEnabled();
        mediaQuery.addEventListener("change", updateEnabled);

        return () => {
            mediaQuery.removeEventListener("change", updateEnabled);
        };
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        const styleTag = document.createElement("style");
        styleTag.id = CURSOR_STYLE_ID;
        styleTag.textContent = `
            html, body, a, button, input, textarea, select, summary, label, [role="button"], * {
                cursor: none !important;
            }
        `;
        document.head.appendChild(styleTag);

        return () => {
            styleTag.remove();
        };
    }, [isEnabled]);

    useEffect(() => {
        if (!isEnabled) return;

        let tiltTimeout: ReturnType<typeof setTimeout> | null = null;
        let scaleTimeout: ReturnType<typeof setTimeout> | null = null;
        let rafId = 0;

        const updateVelocity = (currentPos: Position) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastUpdateTime.current;

            if (deltaTime > 0) {
                velocity.current = {
                    x: (currentPos.x - lastMousePos.current.x) / deltaTime,
                    y: (currentPos.y - lastMousePos.current.y) / deltaTime,
                };
            }

            lastUpdateTime.current = currentTime;
            lastMousePos.current = currentPos;
        };

        const updateHoverState = (target: EventTarget | null) => {
            const element = target instanceof HTMLElement ? target : null;
            const clickable = isInteractiveTarget(element) || hasPointerCursorInTree(element);
            setIsHovering(clickable);
        };

        const smoothPointerMove = (e: PointerEvent) => {
            if (!isTrackablePointer(e.pointerType)) return;

            setIsVisible(true);
            updateHoverState(e.target);

            const currentPos = { x: e.clientX, y: e.clientY };
            updateVelocity(currentPos);

            const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);

            cursorX.set(currentPos.x);
            cursorY.set(currentPos.y);

            if (Math.abs(velocity.current.x) > 0.1) {
                const tiltAngle = Math.max(-25, Math.min(15, velocity.current.x * 30));
                tilt.set(tiltAngle);

                if (tiltTimeout) clearTimeout(tiltTimeout);
                tiltTimeout = setTimeout(() => {
                    tilt.set(0);
                }, 180);
            }

            if (speed > 0.1) {
                scale.set(isHovering ? 1 : 1);

                if (scaleTimeout) clearTimeout(scaleTimeout);
                scaleTimeout = setTimeout(() => {
                    scale.set(isHovering ? 1 : 1);
                }, 130);
            } else {
                scale.set(isHovering ? 1 : 1);
            }
        };

        const throttledPointerMove = (e: PointerEvent) => {
            if (!isTrackablePointer(e.pointerType)) return;
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                smoothPointerMove(e);
                rafId = 0;
            });
        };

        const handlePointerLeaveViewport = () => {
            setIsVisible(false);
            setIsHovering(false);
        };

        const handleWindowBlur = () => {
            setIsVisible(false);
            setIsHovering(false);
        };

        window.addEventListener("pointermove", throttledPointerMove, { passive: true });
        document.addEventListener("pointerleave", handlePointerLeaveViewport);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            window.removeEventListener("pointermove", throttledPointerMove);
            document.removeEventListener("pointerleave", handlePointerLeaveViewport);
            window.removeEventListener("blur", handleWindowBlur);

            if (rafId) cancelAnimationFrame(rafId);
            if (tiltTimeout) clearTimeout(tiltTimeout);
            if (scaleTimeout) clearTimeout(scaleTimeout);
        };
    }, [cursorX, cursorY, tilt, scale, isEnabled, isHovering]);

    if (!isEnabled) return null;

    const cursorContent = cursor || <CustomCursorSVG isHovering={isHovering} />;

    return (
        <motion.div
            style={{
                position: "fixed",
                left: cursorX,
                top: cursorY,
                translateX: "-50%",
                translateY: "-50%",
                rotate: tilt,
                scale,
                zIndex: 9999,
                pointerEvents: "none",
                willChange: "transform",
                opacity: isVisible ? 1 : 0,
            }}
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.15 }}
        >
            {cursorContent}
        </motion.div>
    );
}
