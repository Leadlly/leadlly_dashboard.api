"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEfficiency = void 0;
const solvedQuestions_1 = __importDefault(require("../../models/solvedQuestions"));
const calculateEfficiency = async (topics, user) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const solvedQuestions = await solvedQuestions_1.default.aggregate([
            {
                $match: {
                    student: user._id,
                    createdAt: { $gte: today },
                },
            },
        ]);
        for (let topic of topics) {
            let correctCount = 0;
            let totalCount = 0;
            solvedQuestions.forEach((question) => {
                if (question.question.topics.includes(topic.name)) {
                    totalCount++;
                    if (question.isCorrect) {
                        correctCount++;
                    }
                }
            });
            const efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
            if (!topic.studiedAt) {
                topic.studiedAt = [];
            }
            topic.studiedAt.push({
                date: today,
                efficiency: efficiency,
            });
            // Calculate overall efficiency
            topic.overall_efficiency = await calculateOverallEfficiency(topic, user);
        }
        console.log("Topic efficiencies calculated:", topics);
        return topics;
    }
    catch (error) {
        console.error("Error calculating topic efficiencies:", error);
        throw new Error("Failed to calculate topic efficiencies");
    }
};
exports.calculateEfficiency = calculateEfficiency;
const calculateOverallEfficiency = async (topic, user) => {
    try {
        const solvedQuestions = await solvedQuestions_1.default.find({
            student: user._id,
            "question.topics": { $in: [topic.name] },
        });
        let correctCount = 0;
        let totalCount = solvedQuestions.length;
        // Calculate correct count
        solvedQuestions.forEach((question) => {
            if (question.isCorrect) {
                correctCount++;
            }
        });
        // Calculate efficiency
        const efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
        return efficiency;
    }
    catch (error) {
        console.error("Error calculating overall efficiency:", error);
        throw new Error("Failed to calculate overall efficiency");
    }
};
