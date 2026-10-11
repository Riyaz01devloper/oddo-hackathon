import api from "./api";

export const askCopilot = ({ question, conversationId }) =>
    api.post("/ai/ask", { question, conversationId });

