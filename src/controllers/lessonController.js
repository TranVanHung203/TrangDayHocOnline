// controllers/lessonController.js
import Lesson from '../models/lesson.schema.js';
import path from 'path';
import BadRequestError from '../errors/badRequestError.js';
import ForbiddenError from '../errors/forbiddenError.js';
import NotFoundError from '../errors/notFoundError.js';
import UnauthorizedError from '../errors/unauthorizedError.js'

export const getLesson = async (req, res, next) => {
    const { lessonId } = req.params;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new NotFoundError(`Lesson with id ${lessonId} not found`);
        }

        res.status(200).json(lesson);
    } catch (error) {
        next(error);
    }
};

export const downloadLessonFile = async (req, res, next) => {
    const { lessonId } = req.params;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson || !lesson.document_url) {
            throw new NotFoundError(`Lesson with id ${lessonId} or document URL not found`);
        }

        // Đường dẫn đầy đủ đến file cần tải
        const filePath = path.resolve(lesson.document_url);

        // Gửi file để người dùng tải về
        res.download(filePath, (err) => {
            if (err) {
                console.error("File download error:", err);
                res.status(500).json({ message: "Error downloading file" });
            }
        });
    } catch (error) {
        next(error);
    }
};
