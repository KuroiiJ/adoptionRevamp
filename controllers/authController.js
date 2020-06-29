const passport = require('passport')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const crypto = require('crypto')
const promisify = require('es6-promisify');
const mail = require('../handlers/mail')


exports.login = passport.authenticate('local', {
    failureRedirect: '/login/',
    failureFlash: 'Failed Login',
    successRedirect: '/account',
    successFlash: 'You are logged in!'
}) 

exports.logout = (req,res) => {
    req.logout()
    req.flash('success', "You are logged out! Byyyyeeee")
    res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next()
        return
    } req.flash('error', 'You must be logged in to do that!')
    res.redirect('/login')
}

exports.hasCompleteProfile = (req, res, next) => {
    if(req.user.profile.complete) {
        next()
        return
    } req.flash('error', 'You must complete your profile before filling out an application')
    res.redirect('/account')
}

exports.isAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        next()
        return
    } req.flash('error', 'Only Admins can view this page')
    res.redirect('/account')
}

exports.forgot = async (req, res) => {
   const user = await User.findOne({ email: req.body.email })
   if(!user) {
       req.flash('error', 'A password reset has been mailed to you')
       return res.redirect('/login')
   }

   user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
   user.resetPasswordExpires = Date.now() + 3600000
   await user.save()

   const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`

   await mail.send({
       user, 
       subject: 'Password Reset',
       resetURL, 
       filename: 'password-reset'
   })

   req.flash('success', `You have been emailed a password reset link. ${resetURL}`)

   res.redirect('/login')
}

exports.reset = async (req, res) => {
    const user = User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })
    if(!user) {
        req.flash('error', 'Password reset token is expired or invalid')
        return res.redirect('/login')
    }
    res.render('reset', { title: 'Reset your Password' })
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body['password-confirm']) {
    next()
    return }
    else {
        req.flash('error', 'Passwords do not match')
        res.redirect('back')
    }
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })
    if(!user) {
        req.flash('error', 'Password reset token is expired or invalid')
        return res.redirect('/login')
    }

    const setPassword = promisify(user.setPassword, user)
    await setPassword(req.body.password)

    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    const updatedUser = await user.save()
    await req.login(updatedUser)
    req.flash('Success', 'Your password has been reset and you are now logged in!')
    res.redirect('/')
}