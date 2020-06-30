const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.Promise = global.Promise;
const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose');
const { date } = require('faker');
const { text } = require('body-parser');
const slug = require('slugs')

const dogSchema = new Schema({
    name: {
        type: String, 
        required: 'Please supply a name',
        trim: true
    },
    breed: {
        type: String
    },
    traits: [String], 
    photo: {
        type: String
    }, 
    location: {
        type: String,
        default: "New York"
    },
    slug: {
        type: String
    }

})


//create unique slugs (pulled from store)!
dogSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next();
        return;
    }
    this.slug = slug(this.name);

    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
    const dogsWithSlug = await this.constructor.find({slug: slugRegEx })
    if(dogsWithSlug.length) {
        this.slug = `${this.slug}-${dogsWithSlug.length + 1}`
    }
     next()
   
})




dogSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'dog'
})

function autopopulate(next) {
    this.populate('applications')
    next()
}

dogSchema.pre('find', autopopulate)
dogSchema.pre('findOne', autopopulate)

dogSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('Dog', dogSchema)