import userModel from "../models/userModel.js";
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const createToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            isAdmin: user.isAdmin 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// User login
const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const user = await userModel.findOne({email});

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "User doesn't exist" 
            });
        }

        const isMatch = await bcrypt.compare(String(password), user.password);
        if (isMatch) {
            const token = createToken(user);
            return res.status(200).json({ 
                success: true, 
                token,
                isAdmin: user.isAdmin
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}

// user reg
const regUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check if user exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // validate email & password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" });
        }
        if (String(password).length < 8) {
            return res.json({ success: false, message: "Enter strong password (min 8 characters)" });
        }

        // hash password (convert to string to avoid crash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        // save new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            isAdmin: false // Ensure new users are not admins by default
        });

        const user = await newUser.save();

        const token = createToken(user);

        res.json({ 
            success: true, 
            token,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Create admin user
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Only allow creation if there are no existing admin users
        const existingAdmin = await userModel.findOne({ isAdmin: true });
        if (existingAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: "Admin user already exists" 
            });
        }

        // Validate email & password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Enter a valid email" 
            });
        }
        if (String(password).length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: "Enter strong password (min 8 characters)" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        // Create admin user
        const adminUser = new userModel({
            name,
            email,
            password: hashedPassword,
            isAdmin: true
        });

        const user = await adminUser.save();
        const token = createToken(user);

        res.json({ 
            success: true, 
            token,
            isAdmin: true,
            message: "Admin user created successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export { loginUser,regUser,createAdmin }