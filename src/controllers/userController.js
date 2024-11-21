import crypto from 'crypto';
import nodemailer from 'nodemailer';
const saltRounds = 10;
import User from '../models/user.schema.js'
import Student from '../models/student.schema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const getUserRole = async (req, res) => {
    try {
        const userId = req.user.id; // ID của người dùng đã đăng nhập từ req.user

        // Tìm người dùng theo userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Trả về role của người dùng
        return res.json({ role: user.role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi lấy role người dùng' });
    }
};
const createUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //Validate email unique
        const isExistUser = await User.findOne({ email: email })
        console.log('exist user', isExistUser);
        if (isExistUser) {
            return res.status(200).json({
                EC: 1,
                EM: "User's email is exist"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const user = await User.create({ name, email, password: hashedPassword, role: 'Student', is_verify_email: false });

        // Create a new student referencing the newly created user
        const student = await Student.create({ user: user._id, courses: [] });

        // Respond with both user and student data
        return res.status(200).json({
            EC: 0,
            EM: "Tạo tài khoản thành công"
        });
    } catch (error) {
        console.error("Error creating user and student:", error);
        return res.status(500).json({
            EC: 1,
            EM: "An error occurred while creating the user and student"
        });
    }
}


const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    //find user by email
    const user = await User.findOne({ email: email });
    if (user) {
        //check email verification
        if (!user.is_verify_email) {
            return res.status(200).json({
                EC: 1,
                EM: "Email is not verify"
            });
        }
        //compare password
        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (isMatchPassword) {
            //create access token
            const payload = {
                email: email,
                name: user.name,
                id: user._id,
                role: user.role
            }
            const access_token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: process.env.EXPIRES_ACCESS_TOKEN
            })
            //create refresh token
            const refresh_token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: process.env.EXPIRES_REFRESH_TOKEN
            })
            res.cookie('access_token', access_token, {
                secure: false, // set to true if you're using https
                httpOnly: false,
            });
            res.cookie('refresh_token', refresh_token, {
                secure: false, // set to true if you're using https
                httpOnly: false,
            });
            return res.status(200).json({
                EC: 0,
                user: {
                    email: email,
                    name: user.name,
                    role: user.role,
                    access_token, refresh_token,
                },
                EM: "Đăng nhập thành công"
            })
        }
        else {
            res.status(200).json({
                EC: 1,
                EM: "Email hoặc Password không hợp lệ"
            });
        }
    }
    else {
        res.status(200).json({
            EC: 1,
            EM: "Email hoặc Password không hợp lệ"
        });
    }
}

const changePasswordController = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
        const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
        if (isMatchPassword) {
            // hash new password
            const hashPassword = await bcrypt.hash(newPassword, saltRounds);
            //save new password
            user.password = hashPassword;
            await user.save();
            return res.status(200).json("Change password succeed");
        }
        else {
            return res.status(200).json("Mật khẩu không hợp lệ");
        }
    }
    else {
        return res.status(200).json("Không có user");
    }


}

const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    // Check if the email exists in your user database
    const user = await User.findOne({ email: email });
    if (user) {
        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');
        // Store the token with the user's email in a database or in-memory store
        user.reset_token = token;
        await user.save();
        // Send the reset token to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chututmusic@gmail.com',
                pass: 'mwfl repn ehlq tond',
            },
        });
        const mailOptions = {
            from: 'chututmusic@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`, //link ở front end
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send({
                    EC: 1,
                    EM: 'Error sending email'
                });
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).send({
                    EC: 0,
                    EM: 'Check your email for instructions on resetting your password'
                });
            }
        });
    } else {
        res.status(404).send({
            EC: 1,
            EM: 'Email not found'
        });
    }
}

const resetPasswordController = async (req, res) => {
    const { token, password } = req.body;
    // Find the user with the given token and update their password
    // const user = User.find(user => user.resetToken === token);
    const user = await User.findOne({ reset_token: token });
    if (user) {
        // hash new password
        const hashPassword = await bcrypt.hash(password, saltRounds);
        //save new password
        user.password = hashPassword;
        user.reset_token = ""; // Remove the reset token after the password is updated
        await user.save();
        res.status(200).json({
            EC: 0,
            EM: 'Password updated successfully'
        });
    } else {
        res.status(404).json({
            EC: 1,
            EM: 'Invalid or expired token'
        });
    }
}

const verifyAccountController = async (req, res) => {
    const { email } = req.body;
    // Check if the email exists in your user database
    const user = await User.findOne({ email: email });
    if (user) {
        // Generate a vertification token
        const token = crypto.randomBytes(20).toString('hex');
        // Store the token with the user's email in a database or in-memory store
        user.verify_token = token;
        await user.save();
        // Send the vertification token to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chututmusic@gmail.com',
                pass: 'mwfl repn ehlq tond',
            },
        });
        const mailOptions = {
            from: 'chututmusic@gmail.com',
            to: email,
            subject: 'Verify Email',
            text: `Click the following link to verify your email: http://localhost:3000/verify-email/${token}`, //link ở front end
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error sending email');
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).send('Check your email for instructions on verify your email');
            }
        });
    } else {
        res.status(404).send('Email not found');
    }
}

const verifyEmailController = async (req, res) => {
    const { token } = req.body;
    // Find the user with the given token and verify their email
    const user = await User.findOne({ verify_token: token });
    if (user) {
        user.is_verify_email = true;
        user.verify_token = "";
        await user.save();
        res.status(200).send('Password updated successfully');
    } else {
        res.status(404).send('Invalid or expired token');
    }
}

export {
    createUserController, loginUserController, changePasswordController,
    forgotPasswordController, resetPasswordController, verifyAccountController,
    verifyEmailController
};

export const logout = (req, res, next) => {

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).send()
}