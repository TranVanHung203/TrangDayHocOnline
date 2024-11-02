import { User } from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

const createUserService = async (name, email, password) => {
    // hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    //save password
    const res = await User.create({ name, email, password: hashPassword });
    return res;
}

const loginUserService = async (email, password) => {
    //find user by email
    const user = await User.findOne({ email: email });
    if (user) {
        //compare password
        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (isMatchPassword) {
            const payload = {
                email: email,
                name: user.name
            }
            const access_token = jwt.sign(payload, "qwert", {
                expiresIn: "1d"
            })
            return {
                access_token,
                user: {
                    email: email,
                    name: user.name
                }
            };
        }
        else {
            return {
                EC: 1,
                EM: "Email hoặc Password không hợp lệ"
            }
        }
    }
    else {
        return {
            EC: 1,
            EM: "Email hoặc Password không hợp lệ"
        }
    }
}

export { createUserService, loginUserService };