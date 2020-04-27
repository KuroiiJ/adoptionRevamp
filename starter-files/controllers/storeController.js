const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

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

exports.homePage = (req, res) => {
    req.flash('error', 'Something Happened')
    req.flash('info', 'Something Happened')
    req.flash('warning', 'Something Happened')
    req.flash('success', 'Something Happened')
    res.render('index', {title: 'Home'})
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'})
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
    await photo.resize(800, jimp.AUTO)
    await photo.write(`./public/uploads/${req.body.photo}`)
    next()
}

exports.createStore = async (req, res) => {
        req.body.author = req.user._id
        const store = await (new Store(req.body)).save()
        req.flash('success', `Successfully Created ${store.name}. Care to leave a Review?`)
        res.redirect(`/stores/${store.slug}`)
}

exports.getStores = async (req, res) => {
   const stores = await Store.find()
   res.render('stores', {title: 'Stores', stores})
}

exports.getSingleStore = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug}).populate('author')
    if(!store) return next()
    res.render('store', {title: `${store.name}`, store} )
}

const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)) {
        throw Error('You must own a store to edit it')
    }
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({_id: req.params.id})
    confirmOwner(store, req.user)
    res.render('editStore', {title: `Edit ${store.name}`, store} )
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point'
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,
        runValidators: true,     
    }).exec()
    req.flash('success', `Successfully Updated ${store.name}. <a href="/stores/${store.slug}">View Store </>`)
    res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag
    const tagQuery = tag || { $exists: true }
    const tagsPromise = Store.getTagsList()
    const storesPromise = Store.find({ tags: tagQuery })
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise])
    res.render('tag', {tags, title: 'Tags', tag, stores })
}

