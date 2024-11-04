import Quiz from '../models/quiz.schema.js';
import QuizQuestion from '../models/quizQuestion.schema.js';
import StudentQuizAnswer from '../models/studentQuizAnswer.schema.js';
import QuizAnswer from '../models/quizAnswer.schema.js';
import Course from '../models/course.schema.js'
import Student from '../models/student.schema.js';
import mongoose from 'mongoose';

import NotFoundError from '../errors/notFoundError.js';
import ForbiddenError from '../errors/forbiddenError.js';
import UnauthorizedError from '../errors/unauthorizedError.js';
import BadRequestError from '../errors/badRequestError.js'



export const submitQuiz = async (req, res, next) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  const { answers = [], startTime } = req.body;

  try {
    // Step 1: Find the quiz by ID
    const quiz = await Quiz.findById(quizId).populate('quiz_questions');
    if (!quiz) {
      throw new NotFoundError(`Quiz with ID ${quizId} not found`);
    }

    // Step 2: Check if the quiz deadline has passed
    const now = new Date();
    if (quiz.end_deadline < now) {
      throw new ForbiddenError('Cannot submit; quiz deadline has passed');
    }

    // Step 3: Find the student by user ID
    const student = await Student.findOne({ user: userId });
    if (!student) {
      throw new NotFoundError(`Student not found for user ID ${userId}`);
    }

    // Step 4: Check if the student has access to any course containing this quiz
    const coursesWithQuiz = await Course.find({ quiz: quizId });
    const courseIds = student.courses.map(course => course.toString());
    const hasAccessToCourse = coursesWithQuiz.some(course => courseIds.includes(course._id.toString()));

    if (!hasAccessToCourse) {
      throw new ForbiddenError('Student does not have access to this quiz');
    }

    // Step 5: Check if the student has already submitted this quiz
    const hasSubmitted = quiz.students.some(s => s.toString() === student._id.toString());
    if (hasSubmitted) {
      throw new ForbiddenError('Quiz has already been submitted by this student');
    }

    // Step 6: Verify the number of submitted answers matches the quiz question count
    const questionCount = quiz.quiz_questions.length;
    if (answers.length !== questionCount) {
      throw new BadRequestError('The number of submitted answers does not match the number of quiz questions');
    }

    // Step 7: Calculate the score for the quiz
    const pointsPerQuestion = 10 / questionCount;
    let score = 0;

    const processedQuestions = new Set(); // Tập hợp để lưu các questionId đã xử lý

    for (const { questionId, answerId } of answers) {
      // Log the received question and answer IDs
      console.log(`Processing questionId: ${questionId}, answerId: ${answerId}`);
    
      // Kiểm tra trùng lặp questionId
      if (processedQuestions.has(questionId)) {
        throw new BadRequestError(`Duplicate question ID ${questionId} detected`);
      }
      processedQuestions.add(questionId); // Thêm questionId vào tập hợp sau khi kiểm tra
    
      const question = await QuizQuestion.findById(questionId);
      if (!question) {
        throw new BadRequestError(`Question with ID ${questionId} not found`);
      }
    
      let isCorrect = false;
      let answerDoc = null;
    
      // Check if answerId is provided and not an empty string
      if (answerId && answerId.trim()) {
        // Check if answerId exists within quiz_answers of this question
        if (!question.quiz_answers.includes(answerId)) {
          throw new BadRequestError(`Answer with ID ${answerId} does not belong to question ID ${questionId}`);
        }
    
        // Fetch the answer document from QuizAnswer collection
        answerDoc = await QuizAnswer.findById(answerId);
        if (!answerDoc) {
          throw new BadRequestError(`Answer with ID ${answerId} not found`);
        }
        isCorrect = answerDoc.is_correct;
      }
    
      // Award points if the answer is correct
      if (isCorrect) {
        score += pointsPerQuestion;
      }
    
      // Prepare the answer value
      const answerValue = answerId && answerId.trim() ? answerId : null;
      console.log(`Saving answer: ${answerValue} for questionId: ${questionId}`);
    
      // Save the student's answer
      await StudentQuizAnswer.create({
        student: student._id,
        quiz: quizId,
        question: questionId,
        answer: answerValue, // This will be null if answerId was empty
        is_correct: isCorrect,
      });
    }
    
    
    
    
    

    // Step 8: Save the submission
    quiz.students.push(student._id);
    quiz.score_achieved.push(score);
    quiz.attempt_datetime.push(startTime || now);
    await quiz.save();

    res.status(200).json({ message: 'Quiz submitted successfully' });
  } catch (error) {
    next(error);
  }
};







export const getInfoQuiz = async (req, res, next) => {
  const { quizId } = req.params;
  const userId = req.user.id;

  try {
    // Tìm quiz theo quizId
    const quiz = await Quiz.findById(quizId).populate('students');

    if (!quiz) {
      throw new NotFoundError(`Quiz with ID ${quizId} not found`);
    }

    // Tìm student theo userId
    const student = await Student.findOne({ user: userId });
    if (!student) {
      throw new NotFoundError(`Student not found for user ID ${userId}`);
    }

    // Lấy danh sách các khóa học chứa quiz
    const coursesWithQuiz = await Course.find({ quiz: quizId });

    // Kiểm tra xem student có trong bất kỳ khóa học nào chứa quiz không
    const isEnrolledInCourse = coursesWithQuiz.some(course =>
      student.courses.includes(course._id)
    );

    if (!isEnrolledInCourse) {
      throw new ForbiddenError(`Student does not have access to this quiz`);
    }

    // Khởi tạo các biến để lưu điểm và thời gian
    let score = null;
    let attemptTime = null;

    // Tìm vị trí của student trong mảng students của quiz
    const studentIndex = quiz.students.findIndex(s => s._id.toString() === student._id.toString());

    // Nếu tìm thấy học sinh trong quiz, lấy điểm và thời gian
    if (studentIndex !== -1) {
      score = quiz.score_achieved[studentIndex] || null;
      attemptTime = quiz.attempt_datetime[studentIndex] || null;
    }

    // Lấy các thông tin cơ bản
    const quizInfo = {
      name: quiz.name,
      number: quiz.number,
      min_pass_score: quiz.min_pass_score,
      start_deadline: quiz.start_deadline,
      end_deadline: quiz.end_deadline,
      score,
      attemptTime,
    };

    // Trả về thông tin quiz
    res.status(200).json(quizInfo);
  } catch (error) {
    next(error);
  }
};







export const startQuiz = async (req, res, next) => {
  const { quizId } = req.params; // quizId từ request
  const userId = req.user.id;

  try {
    // Tìm sinh viên dựa trên userId
    const student = await Student.findOne({ user: userId });

    if (!student) {
      throw new NotFoundError(`Student not found for user ID ${userId}`);
    }

    // Tìm bài kiểm tra dựa trên quizId
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new NotFoundError(`Quiz with ID ${quizId} not found`);
    }

    // Tìm khóa học chứa quiz, sử dụng quizId dưới dạng chuỗi
    const coursesWithQuiz = await Course.find({ quiz: quizId });

    // Kiểm tra nếu sinh viên có thuộc khóa học nào không
    const courseIds = student.courses.map(course => course.toString());
    const hasAccessToCourse = coursesWithQuiz.some(course => courseIds.includes(course._id.toString()));

    if (!hasAccessToCourse) {
      throw new ForbiddenError(`Student does not have access to this quiz`);
    }

    // Kiểm tra thời hạn của bài kiểm tra
    const now = new Date();
    if (quiz.start_deadline > now || quiz.end_deadline < now) {
      throw new ForbiddenError('Quiz not available at this time');
    }

    // Lấy danh sách câu hỏi của bài kiểm tra từ bảng quiz_question
    const questions = await QuizQuestion.find({ _id: { $in: quiz.quiz_questions } });

    // Lấy thông tin câu hỏi và câu trả lời từ bảng quiz_answer
    const questionDetails = await Promise.all(
      questions.map(async (question) => {
        const answers = await QuizAnswer.find({ _id: { $in: question.quiz_answers } }).select('answer_text'); // chỉ lấy answer_text

        return {
          questionId: question._id,
          questionTitle: question.question_title,
          answers: answers.map(answer => ({
            answerId: answer._id,
            answerText: answer.answer_text
          })),
        };
      })
    );

    // Trả về thông tin câu hỏi, thời gian và câu trả lời nếu hợp lệ
    res.status(200).json({
      name: quiz.name,
      questions: questionDetails,
      min_pass_score: quiz.min_pass_score,
      start_deadline: quiz.start_deadline,
      end_deadline: quiz.end_deadline,
      is_pass_required: quiz.is_pass_required,
    });
  } catch (error) {
    next(error);
  }
};







