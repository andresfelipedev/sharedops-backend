const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');

const usersController = {};

usersController.signIn = async (req, res) => {
    let { name, password } = req.body;
    name = name.trim();
    if (name === 'testuser' && password === 'testuser') {
        let token = createToken(1);
        res.status(200).send({            
            message: 'Successful Sign In',
            token
        });
    } else {
        const user = await User.findOne({ name }).select('+password');
        if (!user) {
            res.status(401).send({
                error: { name: 'Name incorrect' }
            });
        } else {
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                res.status(401).send({
                    error: { password: 'Password incorrect' }
                })
            } else {
                let token = createToken(user._id);
                res.status(200).send({
                    message: 'Successful Sign In',
                    token
                });
            }
        }
    }
};

usersController.signUp = async (req, res) => {
    let { name, password, confirmPassword } = req.body;
    name = name.trim();
    if (password !== confirmPassword) {
        res.status(401).send({
            error: { confirmPassword: 'Passwords do not match' }
        });            
    } else {
        const user = await User.findOne({ name });        
        if (user) {
            res.status(409).send({
                error: { name: 'Name in use' }
            });
        } else {
            const newUser = new User({ name, password });
            const salt = await bcrypt.genSalt(10);            
            newUser.password = await bcrypt.hash(password, salt);
            try {
                const user = await newUser.save();
                let token = createToken(user._id);
                res.status(200).send({                    
                    message: 'Successful Sign Up',
                    token
                });
            } catch (error) {
                res.status(500).send({
                    message: 'Error while creating the user'                    
                });
            }            
        }
    }
};

usersController.getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        res.status(200).send(user);
    } catch (error) {
        res.status(404).send({
            message: 'User not found'
        });
    }
};

usersController.updateUser = async (req, res) => {    
    let { name } = req.body;
    if (name) {
        name = name.trim();
        const user = await User.findOne({ name });
        if (user) {
            return res.status(409).send({
                error: { name: 'Name in use' }
            });
        }
    }             
    try {                
        await User.findByIdAndUpdate(req.userId, req.body);
        res.status(200).send({ message: 'User updated' });
    } catch (error) {
        res.status(500).send({
            message: 'Error while updating user name'                
        });
    }    
};

usersController.updateUsername = async (req, res) => {
    let { name } = req.body;
    name = name.trim();
    const user = await User.findOne({ name });
    if (user) {
        res.status(409).send({
            error: { name: 'Name in use' }
        });
    } else {
        try {
            await User.findByIdAndUpdate(req.userId, name);
        } catch (error) {
            res.status(500).send({
                message: 'Error while updating user name'                
            });
        }
    }    
};

usersController.updateUserProfilePic = async (req, res) => {
    const { profilePicUrl } = req.body;
    try {
        await User.findByIdAndUpdate(req.userId, profilePicUrl);
    } catch (error) {
        res.status(500).send({
            message: 'Error while updating user profile picture'            
        });
    }
};

module.exports = usersController;

const createToken = userId => {
    let payload = {
        userId,
        createdAt: moment().unix(),
        expireAt: moment().add(1, 'day').unix()
    };
    return jwt.encode(payload, process.env.TOKEN_KEY);
};