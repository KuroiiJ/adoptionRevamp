const mongoose = require('mongoose')
const Dog = mongoose.model('Dog')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

exports.addDog = async (req, res) => {
    res.render('addDog', {title: 'Create Dog'})
}


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/')
        if(isPhoto) {
            next(null, true)
        } else {
            next({ message: 'That filetype is not allowed!'}, false)
        }
    }
}


exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
    if(!req.file) {
        next()
        return
    } 
    const extension = req.file.mimetype.split('/')[1]
    req.body.photo = `${uuid.v4()}.${extension}`
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(200, jimp.AUTO)
    await photo.write(`./public/uploads/${req.body.photo}`)
    next()
}

exports.createDog = async (req, res) => {
    console.log("IN CREATE DOG", req.body)
    const newDog = new Dog(req.body)
    await newDog.save()
    req.flash('success', 'Dog Saved!')
    res.redirect('/')
}