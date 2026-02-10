/**
 * SlotRequestStatusBadge Component
 * 
 * Displays the status of a slot request with appropriate styling.
 */

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { SlotRequestStatus } from '../../../types/slotRequest';
import { SLOT_REQUEST_STATUSES } from '../../../types/slotRequest';

interface SlotRequestStatusBadgeProps {
    status: SlotRequestStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
    [SLOT_REQUEST_STATUSES.PENDING]: {
        label: 'قيد الانتظار',
        icon: Clock,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
    },
    [SLOT_REQUEST_STATUSES.APPROVED]: {
        label: 'مقبول',
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
    },
    [SLOT_REQUEST_STATUSES.REJECTED]: {
        label: 'مرفوض',
        icon: XCircle,
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-200',
    },
} as const;

export function SlotRequestStatusBadge({ status, size = 'md' }: SlotRequestStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
    };

    return (
        <span
            className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
      `}
        >
            <Icon size={size === 'sm' ? 12 : 14} />
            {config.label}
        </span>
    );
}

export default SlotRequestStatusBadge;
