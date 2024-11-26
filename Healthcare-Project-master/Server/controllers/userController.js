const asyncHandler=require("express-async-handler")
const bcrypt=require("bcrypt")
const User=require("../model/userModel")
require("dotenv").config()

const registerUser=asyncHandler(async(req,res)=>{
    const {firstname,lastname, gender, age, bloodgroup,email,password,phoneNumber}=req.body

    if(!firstname ||!lastname||!age||!bloodgroup||!gender || !email || !password || !phoneNumber){
        res.status(400);
        throw new Error("Please provide all fields")
    }

    //check if user already exists
    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User already exists"});
    }

    //Hash the password
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(password,salt);

    const user=await User.create({
        email,
        firstname,
        lastname,
        age,
        bloodgroup,
        gender,
        phoneNumber,
        password:hashedPassword,
    })

    res.status(201).json({message:"User registered successfully",user})
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill all fields");
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
        { userId: user._id, username: user.firstName },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
});

//MyAccount user
const MyAccount = async (req, res) => {
    const {email}= req.body;
    const user = await User.findOne({email});

    if (!user){
        return ("Not a Authentic User");
    }

    return res.status(200).json({msg:"Data Succesfull"})

};

module.exports = { registerUser, loginUser, MyAccount };