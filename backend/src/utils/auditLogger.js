const AuditLog = require('../models/auditLog.model');

/**
 * Record an audit log entry asynchronously without blocking response cycle
 */
async function recordAuditLog({
    actor,
    action,
    entityType,
    entityId = '',
    details = '',
    req = null,
}) {
    try {
        const actorId = actor?._id || actor?.id;
        if (!actorId) return;

        const ip =
            req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.socket?.remoteAddress ||
            '';

        await AuditLog.create({
            actor: {
                id: actorId,
                name: actor.name || 'User',
                email: actor.email || '',
                role: actor.role || 'User',
            },
            action,
            entityType,
            entityId: String(entityId),
            details: typeof details === 'object' ? JSON.stringify(details) : String(details),
            ip,
        });
    } catch (err) {
        // Silently catch audit log failures so business operations are not aborted
        console.error('Audit log recording failed:', err.message);
    }
}

module.exports = { recordAuditLog };

