import React, { FunctionComponent, useEffect, useRef } from 'react';

interface InfoOverlayProps {
    open: boolean;
    onClose: () => void;
}

interface Role {
    company: string;
    title: string;
    period: string;
    highlights: string[];
}

const ROLES: Role[] = [
    {
        company: 'VK',
        title: 'Go Engineer',
        period: 'Nov 2025 — Present',
        highlights: [
            'Streaming replication & big-data processing from Kafka and YT at >5M RPS.',
            'Authored a high-throughput Kafka→Kafka replicator with Exactly-Once guarantees — 9× faster than MirrorMaker 2 on identical hardware.',
        ],
    },
    {
        company: 'Yandex',
        title: 'Go Engineer',
        period: 'Nov 2023 — Nov 2025',
        highlights: [
            'Led a feature team: decomposed work, ran planning, demoed results to stakeholders.',
            'Cut monolith response time ~20% by migrating every table from custom to native indexes — unblocked the microservices migration.',
            'Built a type-safe YDB query builder — 3× faster than Squirrel, adopted across teams.',
            'Designed two greenfield microservices end-to-end: domain boundaries, contracts, schemas, stack choice.',
            'Set up observability (golden signals, alerts, dashboards) and on-call runbooks.',
            'First on the team to migrate a service to Kubernetes: Helm charts, Terraform, health-checks, secrets.',
            'Halved average CI time on PRs; handled on-call incidents and zero-downtime releases.',
        ],
    },
    {
        company: 'LANIT',
        title: 'Developer Intern',
        period: 'Jun 2021 — Nov 2021',
        highlights: [
            'Extended a Django HRM system, shipped new features, maintained git pipelines, and cleaned up legacy code.',
        ],
    },
];

interface Project {
    name: string;
    stack: string;
    blurb: string;
    href?: string;
}

const PROJECTS: Project[] = [
    {
        name: 'Sphere',
        stack: 'TypeScript · GLSL · OpenGL · Go · WebSockets',
        blurb: 'Procedurally generated sphere — 100k particles driven by a 7-shader pipeline, real-time in the browser. Go backend syncs geolocations across clients.',
        href: 'https://github.com/appxpy',
    },
    {
        name: 'NFFS — Neural Network From Scratch',
        stack: 'C++ · CMake · Qt · GoogleTest · Doxygen',
        blurb: 'Perceptron-architecture neural network framework. Designed the architecture, wrote unit tests and docs.',
        href: 'https://github.com/appxpy',
    },
    {
        name: 'Speech2Text Telegram Bot',
        stack: 'Python · Aiogram · PostgreSQL · Docker · Yandex SpeechKit',
        blurb: 'Transcribes voice and video messages. End-to-end pipelines for build and deploy.',
        href: 'https://github.com/appxpy',
    },
];

const SKILLS: { label: string; items: string[] }[] = [
    { label: 'Languages', items: ['Go', 'Python', 'C++', 'TypeScript'] },
    { label: 'Distributed', items: ['Kafka', 'Temporal', 'gRPC'] },
    { label: 'Data', items: ['YDB', 'PostgreSQL'] },
    { label: 'DevOps', items: ['Kubernetes', 'Helm', 'Terraform', 'Docker', 'GitHub Actions'] },
];

export const InfoOverlay: FunctionComponent<InfoOverlayProps> = ({ open, onClose }) => {
    const closeRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Focus the close button when opened and restore scroll lock
    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
            prev?.focus?.();
        };
    }, [open]);

    // Esc to close + focus trap
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            const focusables = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <div
            aria-hidden={!open}
            className={`fixed inset-0 z-40 flex items-stretch justify-end transition-opacity duration-500 ${
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-title"
                style={{
                    paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                    paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
                }}
                className={`about-scroll relative w-full sm:max-w-xl md:max-w-2xl h-full overflow-y-auto bg-ink text-white border-l border-white/10 px-6 sm:px-10 transform transition-transform duration-500 ease-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="uppercase text-xs opacity-60 tracking-[0.2em]">About</p>
                        <h2 id="info-title" className="text-2xl sm:text-3xl font-normal mt-2 leading-tight">
                            Pankevich George
                        </h2>
                        <p className="text-sm opacity-70 mt-1 uppercase tracking-wider">
                            Go Engineer · Moscow
                        </p>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close about panel"
                        className="uppercase text-sm opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:underline"
                    >
                        Close ✕
                    </button>
                </div>

                <p className="text-base leading-relaxed opacity-90 max-w-lg">
                    I build high-throughput distributed systems in Go. Currently at VK on streaming
                    replication for Kafka and YT (5M+ RPS); previously led backend work at Yandex on
                    monolith-to-microservices migration, observability, and internal libraries.
                </p>

                <section className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="uppercase text-xs tracking-[0.2em] opacity-60 mb-4">Experience</h3>
                    <ul className="space-y-7">
                        {ROLES.map((role) => (
                            <li key={role.company}>
                                <div className="flex items-baseline justify-between gap-4">
                                    <p className="text-lg">
                                        <span className="font-normal">{role.company}</span>
                                        <span className="opacity-60"> · {role.title}</span>
                                    </p>
                                    <p className="text-xs uppercase opacity-50 whitespace-nowrap">{role.period}</p>
                                </div>
                                <ul className="mt-2 space-y-1.5 pl-4 list-disc marker:text-white/30 text-sm opacity-85 leading-relaxed">
                                    {role.highlights.map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="uppercase text-xs tracking-[0.2em] opacity-60 mb-4">Selected Projects</h3>
                    <ul className="space-y-5">
                        {PROJECTS.map((p) => (
                            <li key={p.name}>
                                {p.href ? (
                                    <a
                                        href={p.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block -mx-2 px-2 py-1 rounded hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none transition-colors"
                                    >
                                        <p className="text-base group-hover:underline underline-offset-4 decoration-white/40">
                                            {p.name} <span className="opacity-40 text-sm">↗</span>
                                        </p>
                                        <p className="text-xs uppercase opacity-50 tracking-wider mt-0.5">{p.stack}</p>
                                        <p className="text-sm opacity-80 mt-1 leading-relaxed">{p.blurb}</p>
                                    </a>
                                ) : (
                                    <div>
                                        <p className="text-base">{p.name}</p>
                                        <p className="text-xs uppercase opacity-50 tracking-wider mt-0.5">{p.stack}</p>
                                        <p className="text-sm opacity-80 mt-1 leading-relaxed">{p.blurb}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="uppercase text-xs tracking-[0.2em] opacity-60 mb-4">Skills</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {SKILLS.map((s) => (
                            <div key={s.label} className="flex gap-3">
                                <dt className="uppercase text-xs opacity-50 tracking-wider w-24 pt-0.5">{s.label}</dt>
                                <dd className="text-sm opacity-90">{s.items.join(' · ')}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="uppercase text-xs tracking-[0.2em] opacity-60 mb-4">Education</h3>
                    <p className="text-base">HSE University</p>
                    <p className="text-sm opacity-70">BSc, Information Security · 2022 — 2026</p>
                </section>

                <section className="mt-12 pt-8 border-t border-white/10 pb-16">
                    <h3 className="uppercase text-xs tracking-[0.2em] opacity-60 mb-4">Elsewhere</h3>
                    <ul className="space-y-1.5 text-sm">
                        <li><a className="underline decoration-white/30 underline-offset-4 hover:decoration-white" href="mailto:me@appxpy.com">me@appxpy.com</a></li>
                        <li><a className="underline decoration-white/30 underline-offset-4 hover:decoration-white" href="https://t.me/appxpy" target="_blank" rel="noopener noreferrer">t.me/appxpy</a></li>
                        <li><a className="underline decoration-white/30 underline-offset-4 hover:decoration-white" href="https://github.com/appxpy" target="_blank" rel="noopener noreferrer">github.com/appxpy</a></li>
                        <li><a className="underline decoration-white/30 underline-offset-4 hover:decoration-white" href="/resume.pdf" target="_blank" rel="noopener">Download CV (PDF)</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default InfoOverlay;
