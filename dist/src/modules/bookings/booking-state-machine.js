"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HISTORY_BOOKING_STATUSES = exports.ACTIVE_BOOKING_STATUSES = exports.BOOKING_TRANSITIONS = void 0;
exports.normalizeBookingStatus = normalizeBookingStatus;
exports.validateStateTransition = validateStateTransition;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.BOOKING_TRANSITIONS = [
    {
        from: client_1.BookingStatus.PENDING,
        targets: [
            { target: client_1.BookingStatus.ACCEPTED, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.DECLINED, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.CANCELLED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.ACCEPTED,
        targets: [
            { target: client_1.BookingStatus.ON_THE_WAY, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.CANCELLED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.ON_THE_WAY,
        targets: [
            { target: client_1.BookingStatus.ARRIVED, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.CANCELLED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.ARRIVED,
        targets: [
            { target: client_1.BookingStatus.INSPECTION, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.INSPECTION,
        targets: [
            { target: client_1.BookingStatus.QUOTE_CREATED, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.DIAGNOSIS_PENDING, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.IN_PROGRESS, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.QUOTE_CREATED,
        targets: [
            { target: client_1.BookingStatus.DIAGNOSIS_PENDING, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.QUOTE_APPROVED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.QUOTE_REJECTED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.IN_PROGRESS, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.CLOSED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.DIAGNOSIS_PENDING,
        targets: [
            { target: client_1.BookingStatus.QUOTE_APPROVED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.QUOTE_REJECTED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.IN_PROGRESS, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
            { target: client_1.BookingStatus.CLOSED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.QUOTE_APPROVED,
        targets: [
            { target: client_1.BookingStatus.IN_PROGRESS, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.QUOTE_REJECTED,
        targets: [
            { target: client_1.BookingStatus.CLOSED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.IN_PROGRESS,
        targets: [
            { target: client_1.BookingStatus.COMPLETED, allowedRoles: [client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
    {
        from: client_1.BookingStatus.COMPLETED,
        targets: [
            { target: client_1.BookingStatus.CLOSED, allowedRoles: [client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN] },
        ],
    },
];
exports.ACTIVE_BOOKING_STATUSES = [
    client_1.BookingStatus.PENDING,
    client_1.BookingStatus.ACCEPTED,
    client_1.BookingStatus.ON_THE_WAY,
    client_1.BookingStatus.ARRIVED,
    client_1.BookingStatus.INSPECTION,
    client_1.BookingStatus.DIAGNOSIS_PENDING,
    client_1.BookingStatus.QUOTE_CREATED,
    client_1.BookingStatus.QUOTE_APPROVED,
    client_1.BookingStatus.IN_PROGRESS,
];
exports.HISTORY_BOOKING_STATUSES = [
    client_1.BookingStatus.COMPLETED,
    client_1.BookingStatus.CANCELLED,
    client_1.BookingStatus.CLOSED,
    client_1.BookingStatus.DECLINED,
    client_1.BookingStatus.QUOTE_REJECTED,
];
function normalizeBookingStatus(status) {
    if (!status) {
        throw new common_1.BadRequestException('Booking status must not be empty.');
    }
    const upper = status.trim().toUpperCase();
    switch (upper) {
        case 'REQUESTED':
            return client_1.BookingStatus.PENDING;
        case 'WAITING_CUSTOMER_APPROVAL':
            return client_1.BookingStatus.DIAGNOSIS_PENDING;
        case 'APPROVED':
            return client_1.BookingStatus.QUOTE_APPROVED;
        case 'REJECTED':
            return client_1.BookingStatus.QUOTE_REJECTED;
        default:
            if (Object.values(client_1.BookingStatus).includes(upper)) {
                return upper;
            }
            throw new common_1.BadRequestException(`Unrecognized or unsupported booking status: '${status}'`);
    }
}
function validateStateTransition(currentStatus, targetStatus, userRole) {
    if (currentStatus === targetStatus) {
        return;
    }
    const rule = exports.BOOKING_TRANSITIONS.find((r) => r.from === currentStatus);
    if (!rule) {
        throw new common_1.BadRequestException(`No transitions permitted from current status '${currentStatus}'.`);
    }
    const targetConfig = rule.targets.find((t) => t.target === targetStatus);
    if (!targetConfig) {
        const validTargets = rule.targets.map((t) => `'${t.target}'`).join(', ');
        throw new common_1.BadRequestException(`Invalid booking state transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${validTargets}].`);
    }
    if (userRole !== client_1.UserRole.ADMIN && !targetConfig.allowedRoles.includes(userRole)) {
        throw new common_1.BadRequestException(`Role '${userRole}' is not authorized to transition booking from '${currentStatus}' to '${targetStatus}'.`);
    }
}
//# sourceMappingURL=booking-state-machine.js.map