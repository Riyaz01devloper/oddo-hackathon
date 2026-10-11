const aiTools = require("../services/aiTools.service.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { recordAuditLog } = require("../utils/auditLogger.js");

// Fallback deterministic synthesis when GEMINI_API_KEY is not set or network fails
function buildDeterministicAnswer(intent, toolData, question) {
    switch (intent) {
        case "AVAILABLE_VEHICLES": {
            const count = toolData.availableCount || 0;
            if (count === 0) {
                return `**Vehicle Availability Status**\n\nThere are currently **0 vehicles available** in the fleet. All vehicles are either dispatched on active trips or undergoing maintenance in the shop.`;
            }
            const rows = toolData.vehicles
                .map((v) => `| ${v.name} | ${v.registrationNumber} | ${v.type} | ${v.maxLoadCapacity?.toLocaleString('en-IN') || 0} kg | ${v.odometer?.toLocaleString('en-IN') || 0} km |`)
                .join("\n");
            return `### Vehicle Availability Summary\n\nThere are currently **${count} vehicle(s)** ready and available for assignment:\n\n| Vehicle Name | Registration | Type | Max Load | Odometer |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n*All listed vehicles are in 'Available' operational status.*`;
        }

        case "VEHICLES_ON_TRIPS": {
            const count = toolData.onTripCount || 0;
            if (count === 0) {
                return `### Active Trips Status\n\nThere are currently **no vehicles on active trips**. All dispatched trips have either completed or have not yet been dispatched.`;
            }
            const rows = toolData.activeTrips
                .map((t) => `| #${String(t.tripId).slice(-6)} | ${t.vehicle} (${t.registration}) | ${t.driver || 'Unassigned'} | ${t.source || '-'} → ${t.destination || '-'} | ${t.cargoWeightKg?.toLocaleString('en-IN') || 0} kg |`)
                .join("\n");
            return `### Vehicles Currently on Trips\n\nThere are **${count} active dispatched trip(s)** underway:\n\n| Trip ID | Vehicle | Driver | Route | Cargo Weight |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n*These vehicles are committed until their respective trips are marked completed or cancelled.*`;
        }

        case "LOW_SAFETY_DRIVERS": {
            const drivers = toolData.drivers || [];
            if (drivers.length === 0) {
                return `### Driver Safety Review\n\nNo driver safety records found in the database.`;
            }
            const rows = drivers
                .map((d) => `| ${d.name} | ${d.licenseNumber} | **${d.safetyScore}/100** | ${d.status} | ${d.phone || '-'} |`)
                .join("\n");
            return `### Driver Safety Evaluation\n\nHere are the drivers ranked with the lowest recorded safety scores:\n\n| Driver Name | License Number | Safety Score | Status | Contact |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n> **Safety Officer Recommendation:** Drivers scoring below 75 points should be flagged for defensive driving refresher training.`;
        }

        case "EXPIRING_LICENSES": {
            const drivers = toolData.drivers || [];
            if (drivers.length === 0) {
                return `### Driver License Expiry Status\n\nGood news: **No driver licenses** are expiring within the next 60 days based on verified database records.`;
            }
            const rows = drivers
                .map((d) => {
                    const tag = d.daysLeft <= 0 ? "🔴 **EXPIRED**" : d.daysLeft <= 15 ? "🟠 **Critical**" : "🟡 Approaching";
                    const formattedDate = new Date(d.licenseExpiry).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                    return `| ${d.name} | ${d.licenseNumber} | ${formattedDate} | ${d.daysLeft <= 0 ? 'Expired' : d.daysLeft + ' days'} | ${tag} |`;
                })
                .join("\n");
            return `### Upcoming Driver License Expirations\n\nWe identified **${drivers.length} driver(s)** with expired or approaching license expirations:\n\n| Driver Name | License Number | Expiration Date | Days Remaining | Urgency |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n> **Compliance Alert:** Ensure renewals are verified before scheduling future trip dispatches.`;
        }

        case "VEHICLES_IN_MAINTENANCE": {
            const records = toolData.records || [];
            if (records.length === 0) {
                return `### Maintenance Shop Status\n\nThere are currently **0 vehicles in maintenance**. The entire fleet is either available or actively dispatched on trips.`;
            }
            const rows = records
                .map((r) => {
                    const formattedDate = r.serviceDate ? new Date(r.serviceDate).toLocaleDateString('en-IN') : '-';
                    return `| ${r.vehicle || 'Vehicle'} | ${r.registration || '-'} | ${r.issue || 'Scheduled Service'} | ₹${Number(r.cost || 0).toLocaleString('en-IN')} | ${formattedDate} |`;
                })
                .join("\n");
            return `### Vehicles Currently Undergoing Maintenance\n\nThere are **${records.length} vehicle(s)** currently in the workshop:\n\n| Vehicle | Registration | Issue / Description | Estimated Cost | Service Date |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n*These vehicles are locked in 'InShop' status and cannot be dispatched.*`;
        }

        case "INCOMPLETE_TRIPS": {
            const trips = toolData.trips || [];
            if (trips.length === 0) {
                return `### Incomplete Trips Audit\n\nNo incomplete trips found. All recorded trips in the database are marked as Completed or Cancelled.`;
            }
            const rows = trips
                .map((t) => `| #${String(t.id).slice(-6)} | **${t.status}** | ${t.source || '-'} → ${t.destination || '-'} | ${t.vehicle || '-'} | ${t.driver || '-'} | ${t.plannedDistanceKm || 0} km |`)
                .join("\n");
            return `### Incomplete Trips Summary\n\nFound **${trips.length} active/pending trip(s)** requiring operational follow-up:\n\n| Trip ID | Status | Route | Vehicle | Driver | Planned Dist. |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n*Draft trips require vehicle/driver confirmation before dispatch.*`;
        }

        case "HIGHEST_MAINTENANCE_COSTS": {
            const list = toolData.topVehicles || [];
            if (list.length === 0) {
                return `### Maintenance Cost Audit\n\nNo vehicle maintenance expense history recorded yet.`;
            }
            const rows = list
                .map((v) => `| ${v.name} | ${v.registration} | ₹${v.totalMaintenanceCost.toLocaleString('en-IN')} | ${v.maintenanceCount} | ${v.recentIssues.join(", ") || 'General Service'} |`)
                .join("\n");
            return `### Top Vehicles by Recorded Maintenance Expenses\n\nHere are the vehicles with the highest cumulative maintenance costs:\n\n| Vehicle | Registration | Total Maintenance | Work Orders | Recent Issues |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n> **Financial Recommendation:** Vehicles with frequent repeat issues should be scheduled for comprehensive mechanical appraisal or asset retirement review.`;
        }

        case "MONTHLY_EXPENSES": {
            const cur = toolData.currentMonth;
            const prev = toolData.previousMonth;
            const delta = toolData.fuelDeltaPercentage;
            const deltaBadge = delta > 0 ? `+${delta}% increase` : `${delta}% decrease`;

            return `### Monthly Fuel & Operating Expenses Comparison\n\nOperational cost comparison between **${cur.month}** and **${prev.month}**:\n\n| Expense Category | ${prev.month} | ${cur.month} | Trend |\n| :--- | :--- | :--- | :--- |\n| **Fuel Expenses** | ₹${prev.fuelCost.toLocaleString('en-IN')} (${prev.fuelLiters.toLocaleString('en-IN')} L) | ₹${cur.fuelCost.toLocaleString('en-IN')} (${cur.fuelLiters.toLocaleString('en-IN')} L) | ${deltaBadge} |\n| **Other Expenses** | ₹${prev.otherExpenses.toLocaleString('en-IN')} | ₹${cur.otherExpenses.toLocaleString('en-IN')} | - |\n| **Total Operating Cost** | **₹${prev.totalOperatingCost.toLocaleString('en-IN')}** | **₹${cur.totalOperatingCost.toLocaleString('en-IN')}** | - |\n\n*All statistics are compiled directly from recorded Fuel Logs and Operating Expense records.*`;
        }

        case "TOP_DRIVERS_TRIPS": {
            const drivers = toolData.topDrivers || [];
            if (drivers.length === 0) {
                return `### Driver Performance Audit\n\nNo completed trip records found in the database.`;
            }
            const rows = drivers
                .map((d, idx) => `| #${idx + 1} | ${d.name} | ${d.license} | **${d.completedTrips}** | ${d.totalDistanceKm?.toLocaleString('en-IN') || 0} km | ${d.safetyScore}/100 |`)
                .join("\n");
            return `### Top Drivers by Completed Trips\n\nHere are the most active drivers based on verified completed transport assignments:\n\n| Rank | Driver Name | License | Completed Trips | Total Distance | Safety Score |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n*Only trips marked with 'Completed' status are included in these totals.*`;
        }

        default: {
            // General fleet performance summary
            const { totalVehicles, vehiclesByStatus, totalDrivers, driversByStatus, totalTripsRecorded, tripsByStatus, activeMaintenanceCount } = toolData;
            return `### TransitOps Fleet Intelligence Overview\n\nHere is the current operational snapshot of the TransitOps platform:\n\n- **Vehicles (${totalVehicles || 0} total):** Available: ${vehiclesByStatus?.Available || 0} | On Trip: ${vehiclesByStatus?.OnTrip || 0} | In Shop: ${vehiclesByStatus?.InShop || 0} | Retired: ${vehiclesByStatus?.Retired || 0}\n- **Drivers (${totalDrivers || 0} total):** Available: ${driversByStatus?.Available || 0} | On Trip: ${driversByStatus?.OnTrip || 0} | Off Duty: ${driversByStatus?.OffDuty || 0} | Suspended: ${driversByStatus?.Suspended || 0}\n- **Trips (${totalTripsRecorded || 0} total):** Draft: ${tripsByStatus?.Draft || 0} | Dispatched: ${tripsByStatus?.Dispatched || 0} | Completed: ${tripsByStatus?.Completed || 0} | Cancelled: ${tripsByStatus?.Cancelled || 0}\n- **Maintenance:** ${activeMaintenanceCount || 0} vehicle(s) currently in the workshop.\n\n*You can ask specific questions about vehicle availability, maintenance costs, expiring driver licenses, or incomplete trips.*`;
        }
    }
}

// Call Google Gemini REST API with Grounded Data
async function callGeminiApi(apiKey, question, groundedContext) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are the TransitOps AI Fleet Copilot, a professional, grounded AI assistant for fleet managers, safety officers, and operations teams.
CRITICAL GROUNDING RULES:
1. Base your answer EXCLUSIVELY on the validated database facts provided below.
2. NEVER invent vehicles, drivers, trips, expenses, dates, or numbers.
3. If specific data is missing or empty, explicitly state that it is unavailable in the records.
4. Clearly distinguish verified database facts from suggestions or recommendations.
5. Format your answers cleanly using markdown headings, bullet points, and markdown tables where suitable.
6. Include relevant vehicle names, registration numbers, driver names, and dates whenever available.`;

    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `USER QUESTION: "${question}"\n\nVERIFIED DATABASE RECORDS & METRICS:\n\`\`\`json\n${JSON.stringify(groundedContext, null, 2)}\n\`\`\`\n\nProvide an intelligent, structured, and fact-grounded answer based on the above records.`
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1200
        }
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error (HTTP ${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
        throw new Error("Gemini returned empty candidate content");
    }

    return candidateText;
}

// POST /api/ai/ask
const askCopilot = asyncHandler(async (req, res) => {
    const { question, conversationId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
        throw new ApiError(400, "A valid question string is required");
    }

    const cleanQuestion = question.trim();
    const qLower = cleanQuestion.toLowerCase();

    let intent = "FLEET_SUMMARY";
    let toolData = null;

    // Identify intent to fetch precise server-side grounded data
    if (qLower.includes("available vehicle") || qLower.includes("how many vehicles are currently available") || qLower.includes("ready vehicle")) {
        intent = "AVAILABLE_VEHICLES";
        toolData = await aiTools.getAvailableVehicles();
    } else if (qLower.includes("on trip") || qLower.includes("currently on trips") || qLower.includes("active trip")) {
        intent = "VEHICLES_ON_TRIPS";
        toolData = await aiTools.getVehiclesOnTrips();
    } else if (qLower.includes("safety score") || qLower.includes("lowest safety") || qLower.includes("unsafe driver")) {
        intent = "LOW_SAFETY_DRIVERS";
        toolData = await aiTools.getDriversLowSafetyScores();
    } else if (qLower.includes("license") && (qLower.includes("expire") || qLower.includes("expiring") || qLower.includes("expiry") || qLower.includes("soon"))) {
        intent = "EXPIRING_LICENSES";
        toolData = await aiTools.getExpiringLicenses(60);
    } else if (qLower.includes("maintenance") && (qLower.includes("current") || qLower.includes("in shop") || qLower.includes("shop") || qLower.includes("undergoing"))) {
        intent = "VEHICLES_IN_MAINTENANCE";
        toolData = await aiTools.getVehiclesInMaintenance();
    } else if (qLower.includes("highest maintenance") || qLower.includes("unusually high maintenance") || qLower.includes("highest repair")) {
        intent = "HIGHEST_MAINTENANCE_COSTS";
        toolData = await aiTools.getHighestMaintenanceCostVehicles();
    } else if (qLower.includes("fuel") || qLower.includes("operating cost") || qLower.includes("compare this month") || qLower.includes("previous month") || qLower.includes("expenses this month")) {
        intent = "MONTHLY_EXPENSES";
        toolData = await aiTools.getMonthlyFuelAndExpenses();
    } else if (qLower.includes("incomplete trip") || qLower.includes("pending trip") || qLower.includes("show me all incomplete")) {
        intent = "INCOMPLETE_TRIPS";
        toolData = await aiTools.getIncompleteTrips();
    } else if (qLower.includes("completed the most") || qLower.includes("top driver") || qLower.includes("most trip")) {
        intent = "TOP_DRIVERS_TRIPS";
        toolData = await aiTools.getTopDriversByTrips();
    } else {
        intent = "FLEET_SUMMARY";
        toolData = await aiTools.getFleetSummary();
    }

    let answer = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your_gemini_api_key_here") {
        try {
            answer = await callGeminiApi(apiKey, cleanQuestion, { intent, toolData });
        } catch (geminiError) {
            console.warn("Gemini API call failed, using grounded deterministic fallback:", geminiError.message);
            answer = buildDeterministicAnswer(intent, toolData, cleanQuestion);
        }
    } else {
        answer = buildDeterministicAnswer(intent, toolData, cleanQuestion);
    }

    const sources = toolData.sources || [];
    const activeConversationId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    recordAuditLog({
        actor: req.user,
        action: 'AI_QUERY',
        entityType: 'AICopilot',
        details: cleanQuestion.substring(0, 100),
        req
    });

    return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "AI response generated successfully",
        data: {
            answer,
            sources,
            conversationId: activeConversationId,
            intent
        },
        answer,
        sources,
        conversationId: activeConversationId
    });
});

module.exports = {
    askCopilot,
};

