const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const checker = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) {
            return res.status(401).json({ msg: "Unauthorized!", isOk: false });
        }

        const decoded = jwt.verify(token, process.env.secretKey);
        if (decoded) {
            req.body.email = decoded.email;
            next();
        } else {
            return res.status(400).send({ msg: "Session Expired! Please Login again", isOk: false });
        }
    } catch (error) {
        return res.status(400).send({ msg: "Something went wrong!", isOk: false });
    }
};

module.exports = { checker };
