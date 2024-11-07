import 'dotenv/config';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authToken = (req, res, next) => {
    const white_lists = ["/", "/register", "/login", "/forgot-password", "/reset-password"];

    if (white_lists.find(item => '/v1/api' + item === req.originalUrl)) {
        next();
    }
    else if (req?.cookies?.access_token) {
        const accessToken = req?.cookies?.access_token;
        //verify access token
        try {
            const decode = jwt.verify(accessToken, process.env.SECRET_KEY);
            req.user = {
                id: decode.id,
                role: decode.role,
                email: decode.email,
                name: decode.name,
            }
            console.log(decode);
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                //verify refresh token
                if (req?.cookies?.refresh_token) {
                    const refreshToken = req?.cookies?.refresh_token;
                    try {
                        const decoderefresh = jwt.verify(refreshToken, process.env.SECRET_KEY);
                        //create new access token
                        const payload = {
                            email: decoderefresh.email,
                            name: decoderefresh.name,
                            id: decoderefresh.id,
                            role: decoderefresh.role
                        }
                        const new_access_token = jwt.sign(payload, process.env.SECRET_KEY, {
                            expiresIn: process.env.EXPIRES_ACCESS_TOKEN
                        })
                        res.cookie('access_token', new_access_token, {
                            secure: false, // set to true if you're using https
                            httpOnly: true,
                        });
                        req.user = {
                            id: decoderefresh.id,
                            role: decoderefresh.role,
                            email: decoderefresh.email,
                            name: decoderefresh.name,
                        }
                        next()
                    } catch (error) {
                        return res.status(401).json({
                            message: "Token không hợp lệ"
                        })
                    }
                }
                else {
                    return res.status(401).json({
                        message: "Token không hợp lệ"
                    })
                }
            }
            else {
                return res.status(401).json({
                    message: "Token không hợp lệ"
                })
            }
        }

    }
    else {
        // return exception
        return res.status(401).json({
            message: "Token không hợp lệ"
        })
    }
}

export { authToken };