import User from "../models/user.schema.js";
import Lecturer from "../models/lecturer.schema.js";
import Student from "../models/student.schema.js";
import bcrypt from 'bcrypt';
const saltRounds = 10;

const updateUserController = async (req, res) => {
    const { name, email, role } = req.body;

    // Kiểm tra quyền Admin
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        // Tìm người dùng theo email
        const user = await User.findOneAndUpdate({ email: email }, { name, role });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Cập nhật bảng liên quan dựa trên role mới
        if (role === "Student") {
            // Thêm người dùng vào bảng Student nếu chưa có
            await Student.findOneAndUpdate(
                { user: user._id },
                { user: user._id },
                { upsert: true, new: true }
            );
            // Xóa người dùng khỏi bảng Lecturer nếu có
            await Lecturer.deleteOne({ user: user._id });
        } else if (role === "Lecturer") {
            // Thêm người dùng vào bảng Lecturer nếu chưa có
            await Lecturer.findOneAndUpdate(
                { user: user._id },
                { user: user._id },
                { upsert: true, new: true }
            );
            // Xóa người dùng khỏi bảng Student nếu có
            await Student.deleteOne({ user: user._id });
        } else if (role === "Admin") {
            // Xóa người dùng khỏi cả hai bảng Student và Lecturer
            await Student.deleteOne({ user: user._id });
            await Lecturer.deleteOne({ user: user._id });
        }

        return res.status(200).json({ message: "User updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const deleteUserController = async (req, res) => {
    const idUser = req.params.iduser;

    // Kiểm tra quyền Admin
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        // Tìm người dùng để lấy role trước khi xóa
        const user = await User.findById(idUser);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Xóa khỏi bảng tương ứng dựa trên role
        if (user.role === "Student") {
            await Student.deleteOne({ user: idUser });
        } else if (user.role === "Lecturer") {
            await Lecturer.deleteOne({ user: idUser });
        }

        // Xóa người dùng khỏi bảng User
        const deleteUserResult = await User.deleteOne({ _id: idUser });



        return res.status(200).json({ message: "User and related records deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


const getAllUserController = async (req, res) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const data = await User.find({});
    return res.status(200).json(data);
}

const getUserController = async (req, res) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const idUser = req.params.iduser;
    const data = await User.find({ _id: idUser });
    return res.status(200).json(data);
}

const createLecturerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //Validate email unique
        const isExistUser = await User.findOne({ email: email })
        if (isExistUser) {
            return res.status(200).json("User's email is exist");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const user = await User.create({ name, email, password: hashedPassword, role: 'Lecturer', is_verify_email: false });

        // Create a new lecturer referencing the newly created user
        const lecturer = await Lecturer.create({ user: user._id, courses: [] });

        // Respond with both user and lecturer data
        return res.status(200).json("Tạo tài khoản thành công");
    } catch (error) {
        console.error("Error creating user and lecturer:", error);
        return res.status(500).json({ error: "An error occurred while creating the user and lecturer" });
    }
}

export {
    updateUserController, deleteUserController, getAllUserController,
    getUserController, createLecturerController
};
