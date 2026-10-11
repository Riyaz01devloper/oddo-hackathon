const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
                index: true,
            },
            name: { type: String, default: 'System' },
            email: { type: String, default: '' },
            role: { type: String, default: 'User' },
        },
        action: {
            type: String,
            required: true,
            index: true, // e.g. LOGIN, UPDATE_PROFILE, CREATE_VEHICLE, DISPATCH_TRIP, COMPLETE_TRIP, CANCEL_TRIP
        },
        entityType: {
            type: String,
            required: true,
            index: true, // e.g. User, Vehicle, Driver, Trip, Maintenance, Expense, FuelLog
        },
        entityId: {
            type: String,
            default: '',
        },
        details: {
            type: String,
            default: '',
        },
        ip: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, createdAt: -1 });
auditLogSchema.index({ 'actor.id': 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

