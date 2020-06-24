const mongoose = require('mongoose')
const User = mongoose.model('User')
const Application = mongoose.model('Application')
const promisify = require('es6-promisify');
const { Store } = require('express-session');


exports.loginForm = (req, res) => {
    res.render('login', {title: 'Login'})
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register'})
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name')
    req.checkBody('name', 'You must supply a name!').notEmpty()
    req.checkBody('email', 'That Email is not valid!').isEmail()
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false, 
        remove_extension: false, 
        gmail_remove_subaddress: false
    })
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty()
    req.checkBody('password-confirm', 'Please Confirm Password!').notEmpty()
    req.checkBody('password-confirm', "Your passwords do not match").equals(req.body.password)
    const errors = req.validationErrors()
    if(errors) {
        req.flash('error', errors.map(err => err.msg))
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })
        return
    } next()
}

exports.registerUser = async (req, res, next) => {
    console.log(req.body)
    const user = new User({email: req.body.email, name: req.body.name, occupation: req.body.occupation, phone: req.body.phone, birthDate: req.body.birthDate, location: req.body.location, allergies: req.body.allergies, otherAnimals: req.body.otherAnimals, household: req.body.household, children: req.body.children })
    const register = promisify(User.register, User)
    await register(user, req.body.password)
    next()
}

exports.account = async (req, res) => {
    console.log(req.user._id)
    const applications = await Application.find({ author: req.user._id })
    console.log(applications)
    res.render('account', {applications, title: 'Edit Your Account'})
}

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' }
    )
    req.flash('success', 'Updated Your Information!')
    res.redirect('back')
}