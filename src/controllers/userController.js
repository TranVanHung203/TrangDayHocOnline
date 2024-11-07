import crypto from 'crypto';
import nodemailer from 'nodemailer';
const saltRounds = 10;
import User from '../models/user.schema.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';


const createUserController = async (req, res) => {
    const { name, email, password } = req.body;
    // hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    //save password
    const data = await User.create({ name, email, password: hashPassword, role: 'user' });
    return res.status(200).json(data)
}

const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    //find user by email
    const user = await User.findOne({ email: email });
    if (user) {
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
                httpOnly: true,
            });
            res.cookie('refresh_token', refresh_token, {
                secure: false, // set to true if you're using https
                httpOnly: true,
            });
            return res.status(200).json({
                user: {
                    email: email,
                    name: user.name
                }
            })
        }
        else {
            res.status(200).json("Email hoặc Password không hợp lệ");
        }
    }
    else {
        res.status(200).json("Email hoặc Password không hợp lệ");
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
                res.status(500).send('Error sending email');
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).send('Check your email for instructions on resetting your password');
            }
        });
    } else {
        res.status(404).send('Email not found');
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
        res.status(200).send('Password updated successfully');
    } else {
        res.status(404).send('Invalid or expired token');
    }
}

export {
    createUserController, loginUserController, changePasswordController,
    forgotPasswordController, resetPasswordController
};

export const logout = (req, res, next) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).send()
  }