import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    iconBgColor: string;
    label: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export function StatCard({ icon, iconBgColor, label, value, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-[16px] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <span className="text-slate-grey text-sm font-medium">{label}</span>
                    <span className="text-3xl font-extrabold text-charcoal">{value}</span>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-success-green' : 'text-shibl-crimson'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>
                <div
                    className={`w-14 h-14 rounded-[12px] flex items-center justify-center ${iconBgColor}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

