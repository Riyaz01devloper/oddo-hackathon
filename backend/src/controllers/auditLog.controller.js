const AuditLog = require("../models/auditLog.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");

// GET /api/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
    const {
        startDate,
        endDate,
        action,
        entityType,
        actorId,
        page = 1,
        limit = 20,
    } = req.query;

    const query = {};

    if (action && action !== 'All') {
        query.action = action;
    }

    if (entityType && entityType !== 'All') {
        query.entityType = entityType;
    }

    if (actorId) {
        query['actor.id'] = actorId;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        AuditLog.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                logs,
                total,
                page: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
            },
            "Audit logs retrieved successfully"
        )
    );
});

module.exports = {
    getAuditLogs,
};

