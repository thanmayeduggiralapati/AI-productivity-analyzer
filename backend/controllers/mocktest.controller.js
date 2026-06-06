// controllers/mocktest.controller.js
// Handles mock test generation and results

const MockTest = require('../models/MockTest');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CREATE MOCK TEST ─────────────────────────
// POST /api/mocktests
const createMockTest = async (req, res) => {
    try {
        const {
            title,
            topic,
            questions,
            difficulty,
            source
        } = req.body;
        if (!title || !topic || !questions) {
            return sendError(res, 'Title, topic and questions are required', 400);
        }
        const mockTest = await MockTest.create({
            user: req.userId,
            title,
            topic,
            questions,
            difficulty,
            source,
            totalQuestions: questions.length,
            status: 'generated'
        });
        return sendSuccess(res, { mockTest }, 'Mock test created', 201);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET ALL MOCK TESTS ───────────────────────
// GET /api/mocktests
const getMockTests = async (req, res) => {
    try {
        const mockTests = await MockTest.find({
            user: req.userId
        }).sort({ createdAt: -1 });
        return sendSuccess(res, { mockTests }, 'Mock tests fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET SINGLE MOCK TEST ─────────────────────
// GET /api/mocktests/:id
const getMockTest = async (req, res) => {
    try {
        const mockTest = await MockTest.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!mockTest) {
            return sendError(res, 'Mock test not found', 404);
        }
        return sendSuccess(res, { mockTest }, 'Mock test fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── SUBMIT MOCK TEST ─────────────────────────
// PUT /api/mocktests/:id/submit
const submitMockTest = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const mockTest = await MockTest.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!mockTest) {
            return sendError(res, 'Mock test not found', 404);
        }

    // Calculate score
        let correctAnswers = 0;
        const mistakesToReview = [];

        mockTest.questions.forEach((question, index) => {
            const userAnswer = answers[index] || '';
            question.userAnswer = userAnswer;
            if (userAnswer === question.correctAnswer) {
                question.isCorrect = true;
                correctAnswers++;
            } else {
                question.isCorrect = false;
                mistakesToReview.push({
                    question: question.question,
                    correctAnswer: question.correctAnswer,
                    userAnswer,
                    explanation: question.explanation
                });
            }
        });

        const percentage = Math.round(
            (correctAnswers / mockTest.totalQuestions) * 100
        );

        mockTest.correctAnswers = correctAnswers;
        mockTest.score = correctAnswers;
        mockTest.percentage = percentage;
        mockTest.timeTaken = timeTaken || 0;
        mockTest.status = 'completed';
        mockTest.mistakesToReview = mistakesToReview;

        await mockTest.save();

        return sendSuccess(res, { mockTest }, 'Mock test submitted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET MISTAKES ─────────────────────────────
// GET /api/mocktests/mistakes
const getMistakes = async (req, res) => {
    try {
        const mockTests = await MockTest.find({
            user: req.userId,
            status: 'completed'
        });

    // Collect all mistakes
        const allMistakes = mockTests.reduce((acc, test) => {
            return acc.concat(
                test.mistakesToReview.map(m => ({
                    ...m,
                    topic: test.topic,
                    testDate: test.updatedAt
                }))
            );
        }, []);
        return sendSuccess(res, { mistakes: allMistakes }, 'Mistakes fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── DELETE MOCK TEST ─────────────────────────
// DELETE /api/mocktests/:id
const deleteMockTest = async (req, res) => {
    try {
        const mockTest = await MockTest.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!mockTest) {
            return sendError(res, 'Mock test not found', 404);
        }
        return sendSuccess(res, {}, 'Mock test deleted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    createMockTest,
    getMockTests,
    getMockTest,
    submitMockTest,
    getMistakes,
    deleteMockTest
};