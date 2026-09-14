import { BookingStatus, UserRole } from '@prisma/client';
export interface TransitionTarget {
    target: BookingStatus;
    allowedRoles: UserRole[];
}
export interface StateTransitionRule {
    from: BookingStatus;
    targets: TransitionTarget[];
}
export declare const BOOKING_TRANSITIONS: StateTransitionRule[];
export declare const ACTIVE_BOOKING_STATUSES: BookingStatus[];
export declare const HISTORY_BOOKING_STATUSES: BookingStatus[];
export declare function normalizeBookingStatus(status: string): BookingStatus;
export declare function validateStateTransition(currentStatus: BookingStatus, targetStatus: BookingStatus, userRole: UserRole): void;
