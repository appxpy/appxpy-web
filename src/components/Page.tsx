import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from "./Logo";
import { Dimensions } from "../main";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import Scene from "../Scene";
import { Canvas } from "@react-three/fiber";
import { ClickData } from "./Plane";
import InfoOverlay from "./InfoOverlay";

const LINKS = {
    email: 'me@appxpy.com',
    telegram: 'https://t.me/appxpy',
    github: 'https://github.com/appxpy',
    cv: '/resume.pdf',
} as const;

// Shared "animated underline" link style used by the footer nav
const navLinkClass =
    "relative uppercase font-normal text-lg text-start hover:cursor-pointer " +
    "after:duration-300 after:bg-white after:w-0 after:h-[1.5px] " +
    "after:absolute after:bottom-[5.5px] after:left-0 hover:after:w-full " +
    "pointer-events-auto focus-visible:outline-none focus-visible:after:w-full";

const TITLE_FRAMES: { s: string, delay?: number, replace?: boolean }[] = [
    { s: "Pankevich\u205fGeorge", replace: true },
    { s: "Pankevich#George", replace: true, delay: 50 },
    { s: "Pank#vich*George", replace: true, delay: 50 },
    { s: "Pank*vich*Geor#e", replace: true, delay: 50 },
    { s: "#ank*vich*Geor*e", replace: true, delay: 50 },
    { s: "*#nk*vich*Geor*e", replace: true, delay: 50 },
    { s: "**#k*vich*Geor*e", replace: true, delay: 50 },
    { s: "***k*vich*Ge#r*e", replace: true, delay: 50 },
    { s: "***k*v#ch*Ge*r*e", replace: true, delay: 50 },
    { s: "***#*v*ch*Ge*r*e", replace: true, delay: 50 },
    { s: "*****v*c#*Ge*r*e", replace: true, delay: 50 },
    { s: "*****v*c**#e*r*e", replace: true, delay: 50 },
    { s: "*****v*#***e*r*e", replace: true, delay: 50 },
    { s: "*****#*****e*r*e", replace: true, delay: 50 },
    { s: "***********#*r*e", replace: true, delay: 50 },
    { s: "*************r*#", replace: true, delay: 50 },
    { s: "*************#**", replace: true, delay: 50 },
    { s: "****************", replace: true, delay: 1000 },
    { s: "*******x*******", replace: true, delay: 100 },
    { s: "* ****pxp**** *", replace: true, delay: 100 },
    { s: "*  **ppxpy**  *", replace: true, delay: 100 },
    { s: "*   appxpy    *", replace: true, delay: 100 },
    { s: "appxpy", replace: true, delay: 1000 },
    { s: "\u205f", replace: true, delay: 100 },
    { s: "appxpy", replace: true, delay: 70 },
    { s: "\u205f", replace: true, delay: 70 },
    { s: "appxpy", replace: true, delay: 50 },
    { s: "\u205f", replace: true, delay: 50 },
    { s: "appxpy", replace: true, delay: 30 },
    { s: "\u205f", replace: true, delay: 30 },
    { s: "appxpy", replace: true, delay: 10 },
    { s: "\u205f", replace: true, delay: 1000 },
    { s: "P", delay: 100 },
    { s: "a", delay: 100 },
    { s: "n", delay: 100 },
    { s: "k", delay: 100 },
    { s: "e", delay: 100 },
    { s: "v", delay: 100 },
    { s: "i", delay: 100 },
    { s: "c", delay: 100 },
    { s: "h", delay: 100 },
    { s: "\u205f", delay: 100 },
    { s: "G", delay: 100 },
    { s: "e", delay: 100 },
    { s: "o", delay: 100 },
    { s: "r", delay: 100 },
    { s: "g", delay: 100 },
    { s: "e", delay: 2000 },
];

const computeDimensions = (): Dimensions => ({
    width: window.innerWidth,
    height: window.innerHeight,
    aspectWH: window.innerWidth / window.innerHeight,
    aspectHW: window.innerHeight / window.innerWidth,
    aspect: Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth),
});

const formatTime = (d: Date) =>
    d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const formatDay = (d: Date) =>
    d.toLocaleString('en-US', { weekday: 'long' });

const Page: FunctionComponent = () => {
    const [time, setTime] = useState(() => formatTime(new Date()));
    const [day, setDay] = useState(() => formatDay(new Date()));
    const [clickData, setClickData] = useState<ClickData | null>(null);
    const [dimensions, setDimensions] = useState<Dimensions>(computeDimensions);
    const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    );
    const [copied, setCopied] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [hintVisible, setHintVisible] = useState(false);
    const [webglSupported, setWebglSupported] = useState<boolean>(true);
    const [documentVisible, setDocumentVisible] = useState<boolean>(() =>
        typeof document === 'undefined' ? true : !document.hidden
    );

    const mousePosRef = useRef<[number, number]>([0.5, 0.5]);
    const wasCalled = useRef(false);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (infoOpen) return;
        const nx = e.clientX / window.innerWidth;
        const ny = 1.0 - (e.clientY / window.innerHeight);
        setClickData({ x: nx, y: ny, time: Date.now() });
    }, [infoOpen]);

    const openInfo = useCallback(() => setInfoOpen(true), []);
    const closeInfo = useCallback(() => setInfoOpen(false), []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        mousePosRef.current = [
            e.clientX / window.innerWidth,
            1.0 - (e.clientY / window.innerHeight),
        ];
    }, []);

    const handleEmailClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Best-effort copy to clipboard alongside the default mailto:
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(LINKS.email);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
            }
        } catch {
            /* noop — mailto: still fires */
        }
        // Do NOT preventDefault: let the mailto: happen too.
        void e;
    }, []);

    // Title animation — properly cancellable; pauses when the tab is hidden
    useEffect(() => {
        if (wasCalled.current) return;
        wasCalled.current = true;

        // Respect reduced motion: set a static title and skip the animation.
        const prefersReduced =
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (prefersReduced) {
            document.title = 'Pankevich George — Software Engineer';
            return;
        }

        // eslint-disable-next-line no-console
        console.log(
            "\n\n%c %c Coded with \u2661 by appxpy ",
            "background:#fff;padding:23.5px;color:#000;font-size:20px;font-weight:200;font-family:'ABC Diatype',serif",
            "background:#000;padding:20px;color:#fff;font-size:20px;font-weight:200;font-family:'ABC Diatype Plus Variable',serif"
        );

        let timeout: number | undefined;
        let frame = 0;
        let cancelled = false;

        const schedule = (delay: number) => {
            timeout = window.setTimeout(() => {
                if (cancelled || document.hidden) return;
                const f = TITLE_FRAMES[frame % TITLE_FRAMES.length];
                if (f.replace) {
                    document.title = f.s;
                } else {
                    document.title += f.s;
                }
                frame += 1;
                schedule(f.delay ?? 500);
            }, delay);
        };

        const onVisibility = () => {
            if (document.hidden) {
                if (timeout) window.clearTimeout(timeout);
                timeout = undefined;
            } else if (!cancelled && timeout === undefined) {
                schedule(250);
            }
        };

        schedule(0);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            cancelled = true;
            if (timeout) window.clearTimeout(timeout);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    // Clock — pauses while tab is hidden to save battery
    useEffect(() => {
        let interval: number | undefined;
        const start = () => {
            if (interval) return;
            interval = window.setInterval(() => {
                const now = new Date();
                setDay(formatDay(now));
                setTime(formatTime(now));
            }, 500);
        };
        const stop = () => {
            if (interval) {
                window.clearInterval(interval);
                interval = undefined;
            }
        };
        const onVisibility = () => (document.hidden ? stop() : start());
        start();
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            stop();
        };
    }, []);

    // Resize listener
    useEffect(() => {
        const onResize = () => setDimensions(computeDimensions());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Track prefers-reduced-motion dynamically
    useEffect(() => {
        if (!window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    // Keyboard shortcuts: space/R spawn a ripple at a pseudo-random spot
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Ignore when typing in an input or with modifiers held
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                setClickData({
                    x: 0.15 + Math.random() * 0.7,
                    y: 0.15 + Math.random() * 0.7,
                    time: Date.now(),
                });
            } else if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                setInfoOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Intro fade-in then show keyboard hint briefly
    useEffect(() => {
        const t1 = window.setTimeout(() => setIntroDone(true), 400);
        const t2 = window.setTimeout(() => setHintVisible(true), 1100);
        const t3 = window.setTimeout(() => setHintVisible(false), 6500);
        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.clearTimeout(t3);
        };
    }, []);

    // Detect WebGL availability so we can degrade gracefully
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl) setWebglSupported(false);
        } catch {
            setWebglSupported(false);
        }
    }, []);

    // Pause canvas frame loop when tab is hidden to save battery
    useEffect(() => {
        const onVis = () => setDocumentVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    const year = useMemo(() => new Date().getFullYear(), []);

    return (
        <div
            className="inset-0 fixed overflow-hidden cursor-crosshair"
            onClick={handleClick}
            onPointerMove={handlePointerMove}
        >
            {webglSupported ? (
                <Canvas
                    className={"fixed inset-0 w-full h-full overflow-hidden touch-auto"}
                    aria-hidden="true"
                    dpr={[1, reducedMotion ? 1.25 : 2]}
                    frameloop={reducedMotion || !documentVisible ? 'demand' : 'always'}
                    gl={{
                        antialias: true,
                        toneMapping: ACESFilmicToneMapping,
                        outputColorSpace: SRGBColorSpace,
                        powerPreference: 'high-performance',
                    }}
                    orthographic
                    camera={{
                        zoom: 1000,
                        position: [0, 0, 5],
                        top: dimensions.height / 2,
                        bottom: dimensions.height / -2,
                        left: dimensions.width / -2,
                        right: dimensions.width / 2,
                    }}
                    onCreated={({ gl }) => {
                        gl.domElement.addEventListener('webglcontextlost', (e) => {
                            e.preventDefault();
                            setWebglSupported(false);
                        }, { once: true });
                    }}
                >
                    <Scene dimensions={dimensions} clickData={clickData} mousePosRef={mousePosRef} />
                </Canvas>
            ) : (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-[#0c0c0c] flex items-center justify-center pointer-events-none"
                >
                    <div className="absolute inset-0 opacity-60" style={{
                        backgroundImage:
                            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent 55%),' +
                            'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.04), transparent 60%)',
                    }} />
                    <div className="relative text-center select-none">
                        <p className="text-4xl sm:text-6xl uppercase tracking-tight">Pankevich George</p>
                        <p className="text-sm sm:text-base uppercase tracking-[0.3em] opacity-60 mt-3">Software Engineer</p>
                    </div>
                </div>
            )}

            <a
                href="#contact"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:uppercase focus:text-sm"
            >
                Skip to contact
            </a>

            <main
                id="main"
                role="main"
                aria-label="Pankevich George — personal business card"
                className={`absolute inset-0 font-inter font-normal p-6 pointer-events-none transition-opacity duration-700 ease-out ${
                    introDone ? 'opacity-80' : 'opacity-0'
                }`}
            >
                <div className="relative h-full w-full box-border flex flex-col justify-between" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    <div className="h-20 hidden absolute my-3 mx-6 top-0 right-0 sm:flex flex-col items-end justify-center">
                        <span className="uppercase font-normal text-lg text-end pointer-events-auto">→{year}</span>
                        <span className="uppercase font-normal text-lg text-end pointer-events-auto">appxpy.com</span>
                    </div>
                    <div className="h-20 hidden absolute my-3 mx-6 bottom-0 right-0 sm:flex flex-col items-end justify-start">
                        <button
                            type="button"
                            onClick={openInfo}
                            aria-label="Open about panel (press I)"
                            className="relative uppercase font-normal text-lg text-end hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:right-0 hover:after:w-full pointer-events-auto focus-visible:outline-none focus-visible:after:w-full"
                        >
                            About ↗
                        </button>
                        <span className="uppercase font-normal text-xs opacity-50 text-end pointer-events-auto select-none">Press I</span>
                    </div>
                    {/* Mobile-only About button so it's reachable without keyboard */}
                    <div className="absolute top-0 right-0 my-6 mx-6 sm:hidden">
                        <button
                            type="button"
                            onClick={openInfo}
                            aria-label="Open about panel"
                            className="relative uppercase font-normal text-sm text-end pointer-events-auto after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[3.5px] after:right-0 hover:after:w-full focus-visible:outline-none focus-visible:after:w-full"
                        >
                            About ↗
                        </button>
                    </div>

                    <nav
                        id="contact"
                        aria-label="Contact links"
                        className="absolute my-6 sm:my-3 sm:mx-6 bottom-10 sm:bottom-0 left-0 flex flex-col items-start justify-start z-20 max-w-[80vw]"
                    >
                        <a
                            href={`mailto:${LINKS.email}`}
                            onClick={handleEmailClick}
                            aria-label={`Email me at ${LINKS.email} (click to also copy)`}
                            className={navLinkClass}
                        >
                            ↗ mail: {LINKS.email}
                            <span
                                aria-hidden="true"
                                className={`ml-2 text-xs normal-case opacity-0 transition-opacity duration-300 ${copied ? 'opacity-80' : ''}`}
                            >
                                (copied)
                            </span>
                        </a>
                        <a
                            href={LINKS.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Telegram @appxpy"
                            className={navLinkClass}
                        >
                            ↗ telegram: @appxpy
                        </a>
                        <a
                            href={LINKS.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub @appxpy"
                            className={navLinkClass}
                        >
                            ↗ github: @appxpy
                        </a>
                    </nav>

                    <header
                        className={'flex flex-col mm:flex-row justify-center items-center h-32 mm:h-10 gap-3 mm:gap-4 sm:gap-10 md:gap-16 select-none'}
                    >
                        <div className="flex justify-center mm:justify-between w-min order-2 mm:order-[0] pointer-events-auto">
                            <span className="uppercase font-normal text-lg text-center" aria-label={`Day: ${day}`}>{day}</span>
                            <span
                                className="uppercase w-20 font-normal text-lg text-center hidden sm:block"
                                aria-live="off"
                                aria-label={`Local time: ${time}`}
                            >
                                {time}
                            </span>
                        </div>
                        <Logo size={40} />
                        <a
                            className="relative uppercase font-normal text-lg text-center w-40 pointer-events-auto hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:left-1/2 after:-translate-x-1/2 hover:after:w-[9.5rem] focus-visible:outline-none focus-visible:after:w-[9.5rem]"
                            href={LINKS.cv}
                            target="_blank"
                            rel="noopener"
                            download="pankevich-george-cv.pdf"
                            aria-label="Download CV as PDF"
                        >
                            DOWNLOAD CV ↗
                        </a>
                    </header>

                    <footer className="h-10 w-full flex flex-col items-center justify-center gap-1">
                        <span className="relative uppercase font-normal text-sm opacity-70 md:text-lg text-start pointer-events-auto">
                            © Pankevich George, {year}
                        </span>
                        <span className="relative uppercase font-normal text-[10px] sm:text-xs opacity-50 text-center pointer-events-auto select-none">
                            Currently · Go Engineer at VK · Moscow
                        </span>
                    </footer>
                </div>
            </main>

            {/* Floating keyboard-shortcut hint */}
            <div
                aria-hidden="true"
                className={`fixed left-1/2 -translate-x-1/2 bottom-14 z-30 pointer-events-none transition-all duration-500 ${
                    hintVisible && !infoOpen ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
            >
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                    <kbd className="font-mono">I</kbd> about&nbsp;·&nbsp;<kbd className="font-mono">Space</kbd> ripple&nbsp;·&nbsp;<kbd className="font-mono">Click</kbd> anywhere
                </div>
            </div>

            <InfoOverlay open={infoOpen} onClose={closeInfo} />
        </div>
    );
};

export default Page;
