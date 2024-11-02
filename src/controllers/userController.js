import { createUserService, loginUserService } from "../services/userService.js";

const createUserController = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json({
        data
    })
}

const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginUserService(email, password);
    return res.status(200).json(data);
}

export { createUserController, loginUserController };