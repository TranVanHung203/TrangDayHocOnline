import Quiz from '../models/quiz.schema.js';
import Student from '../models/student.schema.js';
import Course from '../models/course.schema.js';
import { addDays } from 'date-fns';

import NotFoundError from '../errors/notFoundError.js';
import ForbiddenError from '../errors/forbiddenError.js';
import UnauthorizedError from '../errors/unauthorizedError.js';
import BadRequestError from '../errors/badRequestError.js';

export const getTimelineTest = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Parse and validate `days` parameter
    const parsedDays = req.params;
    const dayAsInteger = parseInt(parsedDays.day, 10);

    if (isNaN(dayAsInteger) || dayAsInteger < 1) {
      throw new BadRequestError('Invalid number of days provided. Please ensure it is a positive integer.');
    }

    const now = new Date();
    const endDate = addDays(now, dayAsInteger);

    // Step 1: Find student's courses
    const student = await Student.findOne({ user: userId }).populate('courses');
    if (!student) {
      throw new NotFoundError('Student not found or has no courses');
    }

    // Step 2: Get quizzes associated with student's courses
    const courseIds = student.courses.map(course => course._id);
    const courses = await Course.find({ _id: { $in: courseIds } }).populate('quiz');

    // Step 3: Collect quizzes within the specified date range
    const quizzes = [];
    courses.forEach(course => {
      course.quiz.forEach(quiz => {
        if (quiz.end_deadline >= now && quiz.end_deadline <= endDate) {
          quizzes.push({
            name: quiz.name,
            end_deadline: quiz.end_deadline,
            days_remaining: Math.ceil((new Date(quiz.end_deadline) - now) / (1000 * 60 * 60 * 24)),
          });
        }
      });
    });

    // Step 4: Send the response with quizzes found
    res.status(200).json({
      quizzes,
      message: `Found ${quizzes.length} upcoming quizzes within the next ${dayAsInteger} days.`,
    });
  } catch (error) {
    // Pass the custom error to the error-handling middleware
    next(error);
  }
};
