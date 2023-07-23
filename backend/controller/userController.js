const User = require("../model/userModel");
const generateToken = require("../config/generateToken")
/* register user */
const signupUser = async (req, res) => {

    const { name, email, password, img } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        img,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            img: user.img,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
}

/* loginuser controller */
const loginuser = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            img: user.img,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
}

/* search user */
const allUsers = (async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    // ignore login user 
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});
module.exports = { signupUser, loginuser, allUsers }