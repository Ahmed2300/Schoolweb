import type { ReactNode } from 'react';
import {
    SiFlutter,
    SiDart,
    SiReact,
    SiNextdotjs,
    SiTypescript,
    SiTailwindcss,
    SiPhp,
    SiLaravel,
    SiDjango,
    SiGo,
    SiDotnet,
    SiJavascript,
} from 'react-icons/si';
import {
    Paintbrush,
    Server,
    Database,
    Code,
    Cpu,
    BrainCircuit,
} from 'lucide-react';

const iconMap: Record<string, ReactNode> = {
    // Arabic labels
    "فلاتر": <SiFlutter />,
    "دارت": <SiDart />,

    // English labels
    "Flutter": <SiFlutter />,
    "Dart": <SiDart />,
    "React": <SiReact />,
    "Next.js": <SiNextdotjs />,
    "TypeScript": <SiTypescript />,
    "JavaScript": <SiJavascript />,
    "Tailwind": <SiTailwindcss />,
    "PHP": <SiPhp />,
    "Laravel": <SiLaravel />,
    "Django": <SiDjango />,
    "Golang": <SiGo />,
    "ASP.NET": <SiDotnet />,
    "UI/UX": <Paintbrush size={14} />,
    "Backend": <Server size={14} />,
    "Backend Development": <Server size={14} />,
    "API": <Code size={14} />,
    "Server Administrator": <Cpu size={14} />,
    "DevOps": <Database size={14} />,
    "AI Tools": <BrainCircuit size={14} />,
};

export function getSkillIcon(skill: string): ReactNode | null {
    return iconMap[skill] ?? null;
}
