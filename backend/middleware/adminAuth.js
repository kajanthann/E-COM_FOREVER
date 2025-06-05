import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: 'No Authorized Login Again' });
    }
    const token_Decode = jwt.verify(token, process.env.JWT_SECRET); 
    if (token_Decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      res.json({ success: false, message: 'No Authorized Login Again' });
    }
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;
