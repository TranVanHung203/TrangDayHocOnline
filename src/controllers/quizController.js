// controllers/quizController.js
import Quiz from '../models/quiz.schema.js';
import QuizQuestion from '../models/quizQuestion.schema.js';
import QuizAnswer from '../models/quizAnswer.schema.js';
import StudentQuizAnswer from '../models/studentQuizAnswer.schema.js';
import Course from '../models/course.schema.js';
import Lecturer from '../models/lecturer.schema.js';
import Student from '../models/student.schema.js';



import ForbiddenError from '../errors/forbiddenError.js';
import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import UnauthorizedError from '../errors/unauthorizedError.js';
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
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const limit = parseInt(req.query.limit) || 10; // Số mục mỗi trang
    const skip = (page - 1) * limit; // Số mục cần bỏ qua
    const { search } = req.query; // Tìm kiếm theo tên

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId)
      .populate({
        path: 'students',
        model: 'student',
        populate: {
          path: 'user',
          model: 'User', // Populate 'user' field within each student
        },
      });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Lọc danh sách học sinh theo tên nếu tham số `search` được cung cấp
    let filteredStudents = quiz.students;
    if (search) {
      filteredStudents = filteredStudents.filter((student) =>
        student.user?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Tính tổng số học sinh tham gia quiz sau khi lọc
    const totalStudents = filteredStudents.length;

    // Lấy danh sách học sinh theo phân trang
    const paginatedStudents = filteredStudents.slice(skip, skip + limit);

    // Gather student progress information
    const studentProgress = paginatedStudents.map((student, index) => {
      const globalIndex = skip + index; // Chỉ số toàn cục
      const scoreAchieved = quiz.score_achieved[globalIndex] || 0;
      const attemptDate = quiz.attempt_datetime[globalIndex] || null;

      return {
        student: student.user ? student.user.name : 'Unknown Student',
        email: student.user.email,
        scoreAchieved,
        attemptDate,
        checkPassed: scoreAchieved >= quiz.min_pass_score,
      };
    });

    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      quizId,
      quizName: quiz.name,
      studentProgress,
      currentPage: page,
      totalPages,
      totalStudents,
    });
  } catch (error) {
    next(error);
  }
};


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
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    now.setHours(now.getHours() + 7);
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
    console.log("day ne:", answers)
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
    console.log(student._id)
    // Tìm vị trí của student trong mảng students của quiz
    const studentIndex = quiz.students.findIndex(s => s._id.toString() === student._id.toString());
    console.log(studentIndex)
    // Nếu tìm thấy học sinh trong quiz, lấy điểm và thời gian
    if (studentIndex !== -1) {
      score = quiz.score_achieved[studentIndex];
      attemptTime = quiz.attempt_datetime[studentIndex] || null;
    }
    console.log(quiz.score_achieved[studentIndex])
    console.log(score, attemptTime)
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
    console.log("aaa", student);

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
    // Step 5: Check if the student has already submitted this quiz
    const hasSubmitted = quiz.students.some(s => s.toString() === student._id.toString());
    if (hasSubmitted) {
      throw new ForbiddenError('Bạn đã làm bài này rồi');
    }
    // Kiểm tra thời hạn của bài kiểm tra
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    now.setHours(now.getHours() + 7);
    console.log(now)
    console.log(quiz.end_deadline)
    console.log(quiz.start_deadline)
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
      number: quiz.number,
      min_pass_score: quiz.min_pass_score,
      start_deadline: quiz.start_deadline,
      end_deadline: quiz.end_deadline,
      is_pass_required: quiz.is_pass_required,
    });
  } catch (error) {
    next(error);
  }
};





export const updateQuiz = async (req, res, next) => {
  try {
    // Step 1: Check if the user is a Lecturer
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Access denied. Only lecturers can update quizzes.');
    }

    const { quizId } = req.params;
    const { name, number, min_pass_score, start_deadline, end_deadline } = req.body;


    // Hàm để cộng thêm 7 giờ vào thời gian
    const addHours = (dateString, hoursToAdd) => {
      const date = new Date(dateString);  // Chuyển đổi chuỗi ISO thành Date object
      date.setHours(date.getHours() + hoursToAdd);  // Cộng thêm số giờ vào thời gian
      return date.toISOString();  // Trả về chuỗi ISO sau khi cộng giờ
    };

    // Cộng 7 giờ vào start_deadline và end_deadline
    const updatedStartDeadline = addHours(start_deadline, 7);
    const updatedEndDeadline = addHours(end_deadline, 7);



    // Thực hiện các bước xử lý tiếp theo với updatedQuiz, ví dụ lưu vào database


    // Step 2: Validate the quiz ID
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new BadRequestError('Invalid quiz ID.');
    }

    // Step 3: Find the course associated with the quiz
    const course = await Course.findOne({ quiz: quizId });
    if (!course) {
      throw new NotFoundError('Quiz or associated course not found.');
    }

    // Step 4: Check if the lecturer is associated with the course
    const lecturer = await Lecturer.findOne({ user: req.user.id, courses: course._id });
    if (!lecturer) {
      throw new ForbiddenError('Access denied. You are not associated with this course.');
    }

    // Step 5: Update the quiz fields
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        name, number, min_pass_score, start_deadline: updatedStartDeadline,
        end_deadline: updatedEndDeadline,
      },
      { new: true, runValidators: true }
    );

    // Step 6: Send the updated quiz as the response
    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    next(error);
  }
};






export const updateQuestionandAnswer = async (req, res, next) => {
  try {
    // Step 1: Check if the user is a Lecturer
    if (req.user.role !== 'Lecturer') {
      throw new ForbiddenError('Access denied. Only lecturers can update quiz questions.');
    }

    const { quizId, questionId } = req.params;
    const { question_title, answers } = req.body;

    // Step 2: Validate IDs
    if (!mongoose.Types.ObjectId.isValid(quizId) || !mongoose.Types.ObjectId.isValid(questionId)) {
      throw new BadRequestError('Invalid quiz or question ID.');
    }

    // Step 3: Check if the question belongs to the quiz
    const quiz = await Quiz.findById(quizId).populate('quiz_questions');
    if (!quiz) {
      throw new NotFoundError('Quiz not found.');
    }

    const questionExistsInQuiz = quiz.quiz_questions.some(
      (question) => question._id.toString() === questionId
    );

    if (!questionExistsInQuiz) {
      throw new NotFoundError('Question does not belong to the specified quiz.');
    }

    // Step 4: Verify that the lecturer is associated with the course containing the quiz
    const course = await Course.findOne({ quiz: quizId });
    if (!course) {
      throw new NotFoundError('Associated course not found.');
    }

    const lecturer = await Lecturer.findOne({ user: req.user.id, courses: course._id });
    if (!lecturer) {
      throw new ForbiddenError('Access denied. You are not associated with the course containing this quiz.');
    }

    // Step 5: Find the question and delete existing answers
    const question = await QuizQuestion.findById(questionId);
    if (!question) {
      throw new NotFoundError('Question not found.');
    }

    // Delete all existing answers associated with this question
    await QuizAnswer.deleteMany({ _id: { $in: question.quiz_answers } });

    // Step 6: Update the question title
    question.question_title = question_title;

    // Step 7: Save new answers and associate them with the question
    const updatedAnswers = [];
    for (const answer of answers) {
      const newAnswer = new QuizAnswer({
        answer_text: answer.answer_text,
        is_correct: answer.is_correct
      });
      await newAnswer.save();
      updatedAnswers.push(newAnswer._id);
    }

    // Update quiz question with new answers
    question.quiz_answers = updatedAnswers;

    await question.save();

    // Step 8: Send the response with the updated question and answers
    res.status(200).json({
      message: 'Question and answers updated successfully',
      question: {
        _id: question._id,
        question_title: question.question_title,
        quiz_answers: answers
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getQuestionAndAnswer = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id; // ID người dùng hiện tại từ token hoặc session

    // Lấy thông tin phân trang từ query params (mặc định là trang 1 và giới hạn 3 items mỗi trang)
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 3; // Số lượng item mỗi trang, mặc định là 3

    // Tính toán skip và limit cho phân trang
    const skip = (page - 1) * limit;

    // Tìm quiz với quizId
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz không tồn tại!' });
    }

    // Bước 2: Tìm giảng viên của người dùng hiện tại
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer) {
      return res.status(404).json({ message: 'Giảng viên không tồn tại!' });
    }

    // Bước 3: Kiểm tra xem giảng viên có khóa học chứa quiz này không
    const course = await Course.findOne({ quiz: quizId });
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học chứa quiz này!' });
    }

    // Kiểm tra xem giảng viên có phải là giảng viên của khóa học chứa quiz này không
    if (!lecturer.courses.includes(course._id)) {
      return res.status(403).json({ message: 'Bạn không phải là giảng viên của khóa học này!' });
    }

    // Bước 4: Lấy các câu hỏi của quiz và phân trang
    const quizQuestions = await QuizQuestion.find({ _id: { $in: quiz.quiz_questions } })
      .skip(skip) // Bỏ qua số lượng câu hỏi đã hiển thị trước đó
      .limit(limit) // Giới hạn số lượng câu hỏi mỗi trang
      .populate({
        path: 'quiz_answers',
        model: 'quiz_answer',
        select: 'answer_text is_correct'
      });

    // Bước 5: Trả về câu hỏi và câu trả lời
    const result = quizQuestions.map(question => ({
      question_id: question._id,
      question_title: question.question_title,
      answers: question.quiz_answers.map(answer => ({
        answer_text: answer.answer_text,
        is_correct: answer.is_correct
      }))
    }));

    // Lấy tổng số câu hỏi để tính số trang
    const totalQuestions = await QuizQuestion.countDocuments({ _id: { $in: quiz.quiz_questions } });

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalQuestions / limit);

    // Trả về kết quả phân trang
    return res.json({
      quizId,
      questions: result,
      page,
      totalPages,
      totalQuestions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi lấy câu hỏi và câu trả lời' });
  }
};
