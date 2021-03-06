const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');

const usersController = {};

usersController.signIn = async (req, res) => {
    let { name, password } = req.body;
    name = name.trim();    
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

usersController.getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id}).select('-favoriteOpinions -updatedAt');
        res.status(200).send(user);
    } catch (error) {
        res.status(404).send({
            message: 'User not found'
        });
    }
};

usersController.updateUser = async (req, res) => {        
    let { name, password, newPassword, confirmNewPassword } = req.body;    
    try {  
        if (name) {
            name = name.trim();
            const user = await User.findOne({ name });
            if (user) {            
                if (String(user._id) !== req.userId) {
                    return res.status(409).send({
                        error: { name: 'Name in use' }
                    });
                } else {
                    delete req.body.name;
                }
            }
        }
        if (password) {
            const user = await User.findById(req.userId).select('+password');            
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                delete req.body.password;
                return res.status(401).send({ 
                    error: { password: 'Password incorrect' } 
                });                
            } else {
                if (newPassword !== confirmNewPassword) {
                    delete req.body.password;
                    return res.status(401).send({
                        error: { confirmNewPassword: 'New password does not match' }
                    });
                } else {
                    const salt = await bcrypt.genSalt(10);            
                    req.body.password = await bcrypt.hash(newPassword, salt);
                    delete req.body.newPassword;
                    delete req.body.confirmNewPassword;
                }
            }
        }           
        if (req.body !== {}) {
            await User.findByIdAndUpdate(req.userId, req.body);
            res.status(200).send({ message: 'User updated' });
        }        
    } catch (error) {        
        res.status(500).send({
            message: 'Error while updating user'                
        });
    }    
};

usersController.updateUserFavoriteOpinions = async (req, res) => {    
    const { opinionId } = req.body;
    try {    
        const user = await User.findById(req.userId);        
        if (user.favoriteOpinions.some(e => e === opinionId)) {
            user.favoriteOpinions.splice(user.favoriteOpinions.indexOf(opinionId), 1);
        } else {            
            user.favoriteOpinions.unshift(opinionId);
        }        
        await User.findByIdAndUpdate(req.userId, user);
        res.status(200).send({ message: 'User\'s favorite opinions updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error while updating user favorite opinions'            
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