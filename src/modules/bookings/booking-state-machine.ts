import { BadRequestException } from '@nestjs/common';
import { BookingStatus, UserRole } from '@prisma/client';

export interface TransitionTarget {
  target: BookingStatus;
  allowedRoles: UserRole[];
}

export interface StateTransitionRule {
  from: BookingStatus;
  targets: TransitionTarget[];
}

export const BOOKING_TRANSITIONS: StateTransitionRule[] = [
  {
    from: BookingStatus.PENDING,
    targets: [
      { target: BookingStatus.ACCEPTED, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.DECLINED, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.CANCELLED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.ACCEPTED,
    targets: [
      { target: BookingStatus.ON_THE_WAY, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.CANCELLED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.ON_THE_WAY,
    targets: [
      { target: BookingStatus.ARRIVED, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.CANCELLED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.ARRIVED,
    targets: [
      { target: BookingStatus.INSPECTION, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.INSPECTION,
    targets: [
      { target: BookingStatus.QUOTE_CREATED, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.DIAGNOSIS_PENDING, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.IN_PROGRESS, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.QUOTE_CREATED,
    targets: [
      { target: BookingStatus.DIAGNOSIS_PENDING, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.QUOTE_APPROVED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
      { target: BookingStatus.QUOTE_REJECTED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
      { target: BookingStatus.IN_PROGRESS, allowedRoles: [UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.DIAGNOSIS_PENDING,
    targets: [
      { target: BookingStatus.QUOTE_APPROVED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
      { target: BookingStatus.QUOTE_REJECTED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
      { target: BookingStatus.IN_PROGRESS, allowedRoles: [UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN] },
      { target: BookingStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.QUOTE_APPROVED,
    targets: [
      { target: BookingStatus.IN_PROGRESS, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.QUOTE_REJECTED,
    targets: [
      { target: BookingStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.IN_PROGRESS,
    targets: [
      { target: BookingStatus.COMPLETED, allowedRoles: [UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
  {
    from: BookingStatus.COMPLETED,
    targets: [
      { target: BookingStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN] },
    ],
  },
];

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.ACCEPTED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.ARRIVED,
  BookingStatus.INSPECTION,
  BookingStatus.DIAGNOSIS_PENDING,
  BookingStatus.QUOTE_CREATED,
  BookingStatus.QUOTE_APPROVED,
  BookingStatus.IN_PROGRESS,
];

export const HISTORY_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.CLOSED,
  BookingStatus.DECLINED,
  BookingStatus.QUOTE_REJECTED,
];

/**
 * Maps frontend alias names (e.g. REQUESTED, WAITING_CUSTOMER_APPROVAL, APPROVED, REJECTED)
 * to Prisma's internal BookingStatus enum values.
 */
export function normalizeBookingStatus(status: string): BookingStatus {
  if (!status) {
    throw new BadRequestException('Booking status must not be empty.');
  }
  const upper = status.trim().toUpperCase();
  switch (upper) {
    case 'REQUESTED':
      return BookingStatus.PENDING;
    case 'WAITING_CUSTOMER_APPROVAL':
      return BookingStatus.DIAGNOSIS_PENDING;
    case 'APPROVED':
      return BookingStatus.QUOTE_APPROVED;
    case 'REJECTED':
      return BookingStatus.QUOTE_REJECTED;
    default:
      if (Object.values(BookingStatus).includes(upper as BookingStatus)) {
        return upper as BookingStatus;
      }
      throw new BadRequestException(`Unrecognized or unsupported booking status: '${status}'`);
  }
}

/**
 * Validates deterministic state transition and role authorization.
 * Rejects any arbitrary status jump by the client.
 */
export function validateStateTransition(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus,
  userRole: UserRole,
): void {
  if (currentStatus === targetStatus) {
    return;
  }

  const rule = BOOKING_TRANSITIONS.find((r) => r.from === currentStatus);
  if (!rule) {
    throw new BadRequestException(
      `No transitions permitted from current status '${currentStatus}'.`,
    );
  }

  const targetConfig = rule.targets.find((t) => t.target === targetStatus);
  if (!targetConfig) {
    const validTargets = rule.targets.map((t) => `'${t.target}'`).join(', ');
    throw new BadRequestException(
      `Invalid booking state transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${validTargets}].`,
    );
  }

  if (userRole !== UserRole.ADMIN && !targetConfig.allowedRoles.includes(userRole)) {
    throw new BadRequestException(
      `Role '${userRole}' is not authorized to transition booking from '${currentStatus}' to '${targetStatus}'.`,
    );
  }
}
