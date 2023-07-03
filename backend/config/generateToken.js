const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    /* token genrated for particlar user id */
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = generateToken;