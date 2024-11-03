import Course from '../models/course.schema.js'; // Nhập model Course
import Student from '../models/student.schema.js'; // Nhập model Student
import Lecturer from '../models/lecturer.schema.js'; // Nhập model Lecturer
import NotFoundError from '../errors/notFoundError.js';
import ForbiddenError from '../errors/forbiddenError.js';
import UnauthorizedError from '../errors/unauthorizedError.js';
import User from '../models/user.schema.js';

import mongoose from 'mongoose';


//http://localhost:5000/courses/?page=1&limit=5
export const getCoursesByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    
    const { page = 1, limit = 9 } = req.query; // Default pagination values
    const parsedLimit = Math.min(parseInt(limit), 9); // Limit to a maximum of 9

    // Check if user is a student
    const student = await Student.findOne({ user: objectId }).populate('courses');

    if (student) {
      const totalCourses = student.courses.length; // Count total courses
      const courses = student.courses.slice((page - 1) * parsedLimit, page * parsedLimit); // Paginate courses

      return res.status(200).json({
        totalCourses,
        currentPage: page,
        totalPages: Math.ceil(totalCourses / parsedLimit),
        courses,
      });
    }

    // Check if user is a lecturer
    const lecturer = await Lecturer.findOne({ user: objectId }).populate('courses');
    if (lecturer) {
      const totalCourses = lecturer.courses.length;
      const courses = lecturer.courses.slice((page - 1) * parsedLimit, page * parsedLimit);

      return res.status(200).json({
        totalCourses,
        currentPage: page,
        totalPages: Math.ceil(totalCourses / parsedLimit),
        courses,
      });
    }

    throw new NotFoundError(`User with ID ${userId} doesn't exist in either Student or Lecturer`);
  } catch (error) {
    next(error);
  }
};


export const createCourse = async (req, res, next) => {
  try {
    const { courseName, description, startDate, endDate, emails } = req.body;

    // Check if the user role is Lecturer
    if (req.user.role !== 'Lecturer') {
      return res.status(403).json({
        status: 403,
        message: 'Only lecturers are allowed to create courses.',
        timestamp: new Date().toISOString(),
      });
    }

    // Create the new course
    const newCourse = new Course({
      name: courseName,
      description,
      start_day: new Date(startDate),
      end_day: new Date(endDate),
    });

    // Save the new course to get its ID
    await newCourse.save();

    // Update the lecturer's courses using req.user.id
    await Lecturer.findOneAndUpdate(
      { user: req.user.id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // Get user IDs from the provided emails
    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map(user => user._id);

    // Find students with these user IDs and add the course to their course list
    await Student.updateMany(
      { user: { $in: userIds } },
      { $push: { courses: newCourse._id } }
    );

    // Send response with the created course data
    res.status(201).json({
      status: 201,
      message: 'Course created successfully.',
      course: newCourse,
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    next(error);
  }
};




export const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { courseName, description, startDate, endDate, emails } = req.body;

    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to edit courses.');
    }

    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: courseId,
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to edit this course.');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        name: courseName,
        description,
        start_day: new Date(startDate),
        end_day: new Date(endDate),
      },
      { new: true }
    );

    if (!updatedCourse) {
      throw new NotFoundError('Course not found.');
    }

    const users = await User.find({ email: { $in: emails } });
    const userIds = users.map(user => user._id);

    await Student.updateMany(
      { user: { $in: userIds } },
      { $addToSet: { courses: updatedCourse._id } }
    );

    await Student.updateMany(
      { user: { $nin: userIds } },
      { $pull: { courses: updatedCourse._id } }
    );

    res.status(200).json({
      status: 200,
      message: 'Course updated successfully.',
      course: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseToUpdate = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Ensure the user has a Lecturer role
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to view course information for editing.');
    }

    // Check if the course belongs to the lecturer
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: courseId,
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to view this course.');
    }

    // Retrieve course information from the database
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found.');
    }

    // Get all students associated with this course
    const students = await Student.find({ courses: courseId }).populate('user', 'email');
    const emails = students.map(student => student.user.email);

    // Construct response with required fields
    res.status(200).json({
      status: 200,
      message: 'Course retrieved successfully.',
      course: {
        courseName: course.name,
        description: course.description,
        startDate: course.start_day.toISOString().split('T')[0],  // Format to "YYYY-MM-DD"
        endDate: course.end_day.toISOString().split('T')[0],      // Format to "YYYY-MM-DD"
        emails
      }
    });
  } catch (error) {
    next(error);
  }
};














