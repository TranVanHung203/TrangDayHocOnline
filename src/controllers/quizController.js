// controllers/quizController.js
import Quiz from '../models/quiz.schema.js';
import QuizQuestion from '../models/quizQuestion.schema.js';
import QuizAnswer from '../models/quizAnswer.schema.js';
import Course from '../models/course.schema.js';
import ForbiddenError from '../errors/forbiddenError.js';
import Lecturer from '../models/lecturer.schema.js';
import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import UnauthorizedError from '../errors/unauthorizedError.js'
import mongoose from 'mongoose';

export const addQuestionWithAnswersToQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { questions } = req.body;

        // Kiểm tra vai trò của người dùng
        if (req.user.role !== 'Lecturer') {
            throw new ForbiddenError('Only lecturers can add questions and answers to quizzes.');
        }
        // Tìm khóa học chứa quiz này
        const course = await Course.findOne({ quiz: quizId });
        if (!course) {
            throw new NotFoundError(`Course containing quiz ${quizId} not found`);
        }

        // Kiểm tra quyền của giảng viên
        const lecturer = await Lecturer.findOne({
            user: req.user.id,
            courses: { $in: [course._id] }
        });

        if (!lecturer) {
            throw new ForbiddenError('You do not have permission to add questions to this quiz.');
        }

        // Tạo danh sách các câu hỏi và câu trả lời
        const savedQuestions = await Promise.all(questions.map(async (questionData) => {
            const { question_title, answers } = questionData;

            // Tạo câu hỏi mới
            const newQuestion = new QuizQuestion({ question_title });

            // Tạo và lưu từng câu trả lời cho câu hỏi này
            const savedAnswers = await Promise.all(answers.map(async (answer) => {
                const newAnswer = new QuizAnswer({
                    answer_text: answer.answer_text,
                    is_correct: answer.is_correct,
                });
                return await newAnswer.save();
            }));

            // Gắn ID của các câu trả lời vào câu hỏi
            newQuestion.quiz_answers = savedAnswers.map(answer => answer._id);
            const savedQuestion = await newQuestion.save();

            // Trả về câu hỏi đã lưu cùng với các câu trả lời
            return { question: savedQuestion, answers: savedAnswers };
        }));

        // Thêm tất cả câu hỏi vào quiz
        const questionIds = savedQuestions.map(q => q.question._id);
        await Quiz.findByIdAndUpdate(
            quizId,
            { $push: { quiz_questions: { $each: questionIds } } },
            { new: true }
        );

        res.status(201).json(savedQuestions);
    } catch (error) {
        next(error);
    }
};




export const deleteQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;

        // Check if the user is a lecturer
        if (req.user.role !== 'Lecturer') {
            throw new ForbiddenError('Only lecturers can delete quizzes.');
        }

        // Find the course containing this quiz
        const course = await Course.findOne({ quiz: quizId });
        console.log(course)
        if (!course) {
            throw new NotFoundError(`Course containing quiz ${quizId} not found.`);
        }

        // Verify that the lecturer has permission to delete this quiz
        const lecturer = await Lecturer.findOne({
            user: req.user.id,
            courses: { $in: [course._id] },
        });
        if (!lecturer) {
            throw new ForbiddenError('You do not have permission to delete this quiz.');
        }

        // Find the quiz by ID and check if it exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new NotFoundError(`Quiz with ID ${quizId} not found.`);
        }

        // Retrieve all questions associated with this quiz
        const questions = await QuizQuestion.find({ _id: { $in: quiz.quiz_questions } });

        // Extract all answer IDs from each question's quiz_answers field
        const answerIds = questions.flatMap(question => question.quiz_answers);

        // Delete all answers associated with the quiz questions
        await QuizAnswer.deleteMany({ _id: { $in: answerIds } });

        // Delete the questions themselves
        await QuizQuestion.deleteMany({ _id: { $in: quiz.quiz_questions } });

        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);

        // Remove the quiz from the course's quizzes array
        await Course.findByIdAndUpdate(course._id, {
            $pull: { quiz: quizId }
        });

        res.status(200).json({
            message: 'Quiz, associated questions, and answers have been deleted successfully, and the quiz has been removed from the course.'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        // Check if the user is a lecturer
        if (req.user.role !== 'Lecturer') {
            throw new ForbiddenError('Only lecturers can delete questions.');
        }

        // Find the question by ID and check if it exists
        const question = await QuizQuestion.findById(questionId);
        if (!question) {
            throw new NotFoundError(`Question with ID ${questionId} not found.`);
        }

        const objectId = new mongoose.Types.ObjectId(questionId);
        // Find the quiz that contains this question
        const quiz = await Quiz.findOne({ quiz_questions: objectId });
        if (!quiz) {
            throw new NotFoundError(`Quiz containing question ${questionId} not found.`);
        }

        // Find the course that contains this quiz
        const course = await Course.findOne({ quiz: quiz._id });
        if (!course) {
            throw new NotFoundError(`Course containing quiz ${quiz._id} not found.`);
        }

        // Verify that the lecturer has permission to delete this question
        const lecturer = await Lecturer.findOne({
            user: req.user.id,
            courses: { $in: [course._id] },
        });
        if (!lecturer) {
            throw new ForbiddenError('You do not have permission to delete this question.');
        }

        // Extract all answer IDs associated with this question
        const answerIds = question.quiz_answers;

        // Delete all answers associated with this question
        await QuizAnswer.deleteMany({ _id: { $in: answerIds } });

        // Delete the question itself
        await QuizQuestion.findByIdAndDelete(questionId);

        // Remove the question ID from any quizzes that reference it
        await Quiz.updateMany(
            { quiz_questions: objectId },
            { $pull: { quiz_questions: objectId } }
        );

        res.status(200).json({
            message: 'Question and associated answers have been deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizProgress = async (req, res, next) => {
    const { quizId } = req.params;

    try {
        // Check if quiz exists and populate the nested user data within students
        const quiz = await Quiz.findById(quizId)
            .populate({
                path: 'students',
                model: 'student',  // Ensure this matches the model name
                populate: {
                    path: 'user',
                    model: 'User' // Populate 'user' field within each student
                }
            });

        if (!quiz) {
            throw new NotFoundError('Quiz not found');
        }

        // Check if score_achieved and attempt_datetime exist and match the length of students array
        if (quiz.students.length === 0 || quiz.score_achieved.length !== quiz.students.length) {
            throw new Error("Data inconsistency: Students array is empty or score data is mismatched.");
        }

        // Gather student progress information
        const studentProgress = quiz.students.map((student, index) => {
            const scoreAchieved = quiz.score_achieved[index] || 0;
            const attemptDate = quiz.attempt_datetime[index] || null;

            return {
                student: student.user ? student.user.name : "Unknown Student",
                email: student.user.email,
                scoreAchieved,
                attemptDate,
                checkPassed: scoreAchieved >= quiz.min_pass_score
            };
        });

        res.status(200).json({
            quizId,
            quizName: quiz.name,
            studentProgress
        });
    } catch (error) {
        next(error);
    }
};