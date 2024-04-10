const exp = require('constants');
const express = require('express')
const mongoose = require('mongoose')
const upload = require('./multer/multerConfig')
const nodemailer = require('nodemailer')
const cors = require('cors')

const PORT = 8080;
const app = express()

app.use(express.json())
app.use(cors())


mongoose.connect('mongodb+srv://mikebasith73:rishabdul73@cluster0.mepqm.mongodb.net/dribble_users')
.then(()=>{console.log('Connected to MongoDB')})
.catch(err => console.error("MongoDB Connection Error:", err));

const userSchema = mongoose.Schema({
    name:String,
    username:String,
    location:String,
    password:String,
    emailId:String,
    profileImage:[String],
    role:[String],
    emailVerified:{type:Boolean,default:false},
    termAndCond:{type:Boolean,default:false}
})

const Users = mongoose.model("users",userSchema);

app.post('/signup', async (req, res) => {
    const { name, username, password, email, termAndCond } = req.body;
    try {
        // Check if the username already exists
        const existingUser = await Users.findOne({ username });
        if (existingUser) {
           return res.status(400).json({ error: 'Username already exists' });
        }

        // Create a new user object
        const newUser = new Users({
            name,
            username,
            password,
            emailId: email,
            termAndCond
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message and user data
        res.status(200).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json('Internal server error');
    }
});



app.put('/signup/role', upload.single('profileImage'), async (req, res) => {
    try {
        const { location, role, emailId, username } = req.body;
        
        let profileImage = '';
        if (req.file) {
            profileImage = req.file.filename;
        }

        // const sendConfirmationEmail = async (emailId, username, role) => {
        //     let transporter = nodemailer.createTransport({
        //         service: 'Gmail',
        //         auth: {
        //             user: 'mikebasith74@gmail.com',
        //             pass: 'rishabdul73'
        //         }
        //     });
        
        //     let mailOptions = {
        //         from: 'mikebasith74@gmail.com',
        //         to: emailId,
        //         subject: 'Signup Confirmation',
        //         text: `Thank you for signing up! Your account has been successfully created.\n\nUsername: ${username}\nRole: ${role}`
        //     };
        
        //     await transporter.sendMail(mailOptions);
        // };
        
        // await sendConfirmationEmail(emailId, username, role);        

        const updateUser = await Users.updateOne(
            { username: username },
            {
                $set: {
                    profileImage: profileImage,
                    location: location,
                    role: role,
                }
            }
        );

        if (updateUser) {
            res.status(200).json({ message: 'User information updated successfully' });
        } else {
            res.status(404).json({ error: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT,()=>{
    console.log(`Server is connected     in Port ${PORT}`)
})
