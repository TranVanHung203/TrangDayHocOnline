import User from "../models/user.schema.js";

const updateUserController = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const data = await User.findOneAndUpdate({ email: email }, {
            name: name,
            role: role
        });
        return res.status(200).json(data)
    } catch (error) {
        console.log(error);
        return res.status(200).json(error.name);
    }
}

const deleteUserController = async (req, res) => {
    const idUser = req.params.iduser;
    try {
        const data = await User.deleteOne({ _id: idUser });
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json(error.name);
    }
}

const getAllUserController = async (req, res) => {
    const data = await User.find({});
    return res.status(200).json(data);
}

const getUserController = async (req, res) => {
    const idUser = req.params.iduser;
    const data = await User.find({ _id: idUser });
    return res.status(200).json(data);
}

export {
    updateUserController, deleteUserController, getAllUserController,
    getUserController
};