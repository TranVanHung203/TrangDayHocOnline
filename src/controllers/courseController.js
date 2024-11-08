import Course from '../models/course.schema.js'; // Nhập model Course
import Student from '../models/student.schema.js'; // Nhập model Student
import Lecturer from '../models/lecturer.schema.js'; // Nhập model Lecturer
import NotFoundError from '../errors/notFoundError.js';
import ForbiddenError from '../errors/forbiddenError.js';
import UnauthorizedError from '../errors/unauthorizedError.js';
import User from '../models/user.schema.js';
import Quiz from '../models/quiz.schema.js'
import Lesson from '../models/lesson.schema.js'
import Module from '../models/module.schema.js';
import mongoose from 'mongoose';


import BadRequestError from '../errors/badRequestError.js';
import path from 'path';


export const getCoursesByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const { page = 1, limit = 9 } = req.query; // Default pagination values
    const parsedLimit = Math.min(parseInt(limit), 9); // Limit to a maximum of 9

    // Get the current date at midnight to filter courses by day only
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set currentDate to 00:00:00

    // Check if user is a student
    const student = await Student.findOne({ user: objectId }).populate({
      path: 'courses',
      match: { end_day: { $gte: currentDate } }, // Only courses with end_day >= today (date only)
    });

    if (student) {
      const totalCourses = student.courses.length;
      const courses = student.courses.slice((page - 1) * parsedLimit, page * parsedLimit);

      return res.status(200).json({
        totalCourses,
        currentPage: page,
        totalPages: Math.ceil(totalCourses / parsedLimit),
        courses,
      });
    }

    // Check if user is a lecturer
    const lecturer = await Lecturer.findOne({ user: objectId }).populate({
      path: 'courses',
      match: { end_day: { $gte: currentDate } }, // Only courses with end_day >= today (date only)
    });

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
      throw new ForbiddenError('You do not have permission to edit this course.');
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


//-------------------------------------------------------------

export const getCourseById = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to view courses.');
    }

    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: courseId,
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to view this course.');
    }
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          model: 'lesson'
        }
      })
      .populate('quiz');


    if (!course) {
      return res.status(404).json({ message: `Course with id ${req.params.courseId} doesn't exist` });
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};


//XÓA MODULES
export const deleteModule = async (req, res, next) => {
  const { moduleId } = req.params;

  try {
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to delete modules.');
    }

    // Lấy thông tin module để tìm khóa học mà nó thuộc về
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: `Module with id ${moduleId} doesn't exist` });
    }

    const moduleIdObject = new mongoose.Types.ObjectId(moduleId);
    // Find the course that includes the specified moduleId in its modules array
    const course = await Course.findOne({ modules: moduleIdObject }).populate('modules');

    // Kiểm tra xem giảng viên có quyền xóa module này không
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: { $in: [course._id] } // Check if the lecturer is associated with the course
    });



    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to delete this module.');
    }

    const lessonIds = module.lessons;
    // Xóa các tài liệu Lesson có ID nằm trong lessonIds
    await Lesson.deleteMany({ _id: { $in: lessonIds } });

    // Xóa module
    const deletedModule = await Module.findByIdAndDelete(moduleId);


    // Cập nhật khóa học để loại bỏ module đã xóa
    const course1 = await Course.findByIdAndUpdate(course._id, {
      $pull: { modules: moduleIdObject } // Loại bỏ module khỏi khóa học
    });


    res.status(200).json({ message: `Module with id ${moduleId} has been deleted` });
  } catch (error) {
    next(error);
  }
};


export const deleteLesson = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to delete lessons.');
    }

    // Lấy thông tin lesson để tìm module mà nó thuộc về
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with id ${lessonId} doesn't exist`);
    }

    // Tìm module chứa lesson này
    const module = await Module.findOne({ lessons: lessonId }).populate('lessons');
    if (!module) {
      throw new NotFoundError(`No module contains the lesson with id ${lessonId}`);
    }

    // Tìm course chứa module này
    const course = await Course.findOne({ modules: module._id });
    if (!course) {
      throw new NotFoundError(`No course contains the module with id ${module._id}`);
    }

    // Kiểm tra xem giảng viên có quyền xóa lesson này không
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: { $in: [course._id] } // Kiểm tra giảng viên có thuộc khóa học chứa module này không
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to delete this lesson.');
    }

    // Xóa lesson
    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

    // Cập nhật module để loại bỏ lesson đã xóa
    await Module.findByIdAndUpdate(module._id, {
      $pull: { lessons: lessonId } // Loại bỏ lesson khỏi module
    });

    res.status(200).json({ message: `Lesson with id ${lessonId} has been deleted` });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req, res, next) => {
  const { courseId } = req.params;
  const { name, number } = req.body; // Chỉ lấy tên và số lượng

  try {
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to add modules.');
    }

    // Kiểm tra xem giảng viên có quyền thêm module vào khóa học này không
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: { $in: [courseId] } // Kiểm tra giảng viên có thuộc khóa học này không
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to add a module to this course.');
    }

    // Tạo module mới với lessons khởi tạo là mảng rỗng
    const newModule = new Module({
      name,
      number,
      lessons: [] // Khởi tạo mảng lessons rỗng
    });

    // Lưu module vào cơ sở dữ liệu
    const savedModule = await newModule.save();

    // Cập nhật khóa học để thêm module vừa tạo
    await Course.findByIdAndUpdate(courseId, {
      $push: { modules: savedModule._id } // Thêm ID module vào khóa học
    });

    res.status(201).json({ message: 'Module created successfully', module: savedModule });
  } catch (error) {
    next(error);
  }
};



export const createLesson = async (req, res, next) => {
  const { moduleId } = req.params;
  const { name, number, lesson_details, type } = req.body;
  const document_url = req.file ? req.file.path : null;

  try {
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to create lessons.');
    }

    // Lấy thông tin module để tìm khóa học mà nó thuộc về
    const module = await Module.findById(moduleId);
    if (!module) {
      throw new NotFoundError(`Module with id ${moduleId} doesn't exist`);
    }

    // Lấy khóa học chứa module này
    const course = await Course.findOne({ modules: moduleId });

    // Kiểm tra xem giảng viên có quyền tạo bài học cho khóa học này không
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: { $in: [course._id] } // Kiểm tra giảng viên có thuộc khóa học này không
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to create a lesson in this module.');
    }

    // Tạo bài học mới
    const newLesson = new Lesson({
      name,
      number,
      document_url,
      lesson_details,
      type
    });

    // Lưu bài học vào cơ sở dữ liệu
    const savedLesson = await newLesson.save();

    // Cập nhật module để thêm bài học vừa tạo
    await Module.findByIdAndUpdate(moduleId, {
      $push: { lessons: savedLesson._id }
    });

    res.status(201).json({ message: 'Lesson created successfully', lesson: savedLesson });
  } catch (error) {
    next(error);
  }

};


export const getCourseStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Lấy `page` và `limit` từ query string, mặc định là trang 1 và 10 sinh viên mỗi trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Tính toán skip (số lượng bản ghi cần bỏ qua)
    const skip = (page - 1) * limit;

    // Lấy danh sách sinh viên có tham gia khóa học với ID tương ứng
    const students = await Student.find({ courses: courseId })
      .populate('user', 'name email') // Populate để lấy thông tin người dùng
      .skip(skip)
      .limit(limit)
      .exec();

    // Tính tổng số sinh viên cho khóa học đó
    const totalStudents = await Student.countDocuments({ courses: courseId });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      students,
      currentPage: page,
      totalPages,
      totalStudents,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  const { courseId } = req.params;
  const quizData = req.body;

  try {
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Only lecturers are allowed to create quizzes.');
    }

    // Kiểm tra xem giảng viên có quyền thêm quiz vào khóa học này không
    const lecturer = await Lecturer.findOne({
      user: req.user.id,
      courses: { $in: [courseId] } // Kiểm tra xem giảng viên có được liên kết với khóa học không
    });

    if (!lecturer) {
      throw new ForbiddenError('You do not have permission to add a quiz to this course.');
    }

    // Tạo một quiz mới với dữ liệu từ body request
    const newQuiz = new Quiz(quizData);
    await newQuiz.save();

    // Tìm khóa học và thêm quiz vào danh sách quiz
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    course.quiz.push(newQuiz._id);
    await course.save();

    res.status(201).json({
      message: 'Quiz created and added to course successfully',
      quiz: newQuiz
    });
  } catch (error) {
    next(error); // Sử dụng next để chuyển lỗi đến middleware xử lý lỗi
  }
};


export const getAllQuizzes = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    // Kiểm tra khóa học có tồn tại không
    const course = await Course.findById(courseId).populate('quiz'); // Giả định trường 'quiz' chứa danh sách các quiz ID
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Lấy danh sách quiz liên kết với khóa học
    const quizzes = await Quiz.find({ _id: { $in: course.quiz } });

    res.status(200).json({
      courseId,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};












