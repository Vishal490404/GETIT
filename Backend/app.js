import express from 'express';
import { connection } from './db.js';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import bcrypt from 'bcrypt';
import { getData } from './main.js';
import cors from 'cors'
configDotenv();
const app = express();
app.use(express.json());
app.use(cors())
connection.getConnection((err) => {
    if (err) {
        console.log("Unable to connect to db!");
    } else {
        console.log("Connected to db!");
    }
});

app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json("Some field is missing, please check!");
    }
    try {
        connection.execute(
            `SELECT * FROM users WHERE email=?;`,
            [email],
            (err, result) => {
                if (err) {
                    return res.status(500).json("Command was not executed properly!");
                }
                if (result.length > 0) {
                    const hashedPassword = result[0].password;
                    const isMatch = bcrypt.compareSync(password, hashedPassword);
                    if (isMatch) {
                        const token = jwt.sign({ email, password }, process.env.JWT_SECRET);
                        // console.log(result);
                        res.cookie('token', token);
                        return res.status(200).json({
                            message: "Successfully Logged In!",
                            token: token,
                            user_id : result[0]["id"]
                    });
                    } else {
                        return res.status(401).json("Incorrect email or password!");
                    }
                } else {
                    return res.status(401).json("Incorrect email or password!");
                }
            }
        );
    } catch (err) {
        next(err);
    }
});

app.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json("Some field is missing, please check!");
    }
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        connection.execute(
            `SELECT * FROM users WHERE email=?`,
            [email],
            (err, result) => {
                if (err) {
                    return res.status(500).json("Command was not executed properly!");
                }
                if (result.length > 0) {
                    return res.status(409).json("Email already exists!");
                }

                connection.execute(
                    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
                    [username, email, hashedPassword],
                    (err, _) => {
                        if (err) {
                            return res.status(500).json("Command was not executed properly!");
                        }
                        const token = jwt.sign({ email, password }, process.env.JWT_SECRET);
                        res.cookie('token', token);
                        res.status(201).json({
                            message: "Successfully registered!",
                            // token: token
                            user_id : result[0]["id"]
                    });
                    }
                );
            }
        );
    } catch (error) {
        next(error);
    }
});

app.get('/getData', authenticateToken, getData)
app.get('/home', authenticateToken, (req, res) => {
    return res.status(200).json("This is the Home");
});

app.get('/', (req, res) => {
    res.status(200).json("Hello from the backend!");
});

app.listen(9563, '0.0.0.0', () => {
    console.log("Running on PORT 9563! Don't Worry");
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json("An unexpected error occurred. Please try again later.");
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(403).json("Access Denied!");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json("Invalid or expired token!");
        const email = decoded.email;

        connection.execute(
            `SELECT id FROM users WHERE email=?`, 
            [email], 
            (err, result) => {
                if (err || result.length === 0) return res.status(400).json("User not found!");
                req.user_id = result[0].id;
                next();
            }
        );
    });
}
