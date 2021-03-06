const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.Promise = global.Promise;
const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose');
const { date } = require('faker');
const { text } = require('body-parser');

const userSchema = new Schema({
    isAdmin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        unique: true, 
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        require: 'Please Supply An Email Address'
    },
    name: {
        type: String, 
        required: 'Please supply a name',
        trim: true
    },
    slug: {
        type: String
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
        // validate: [validator.isMobilePhone, 'Invalid Phone'],
        required: 'Please Supply A Phone Number'
    },
    birthDate: {
        type: Date,
        required: 'Please enter a date!'
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You Must Supply Coordinates!'
        }],
        address: {
            type: String,
            required: 'You Must Supply An Address'
        }
    },
    profile: {
        complete: {
            type: Boolean,
            default: false
        },
        occupation: {
            job: {
                type: String,
                trim: true,
                default: "Job work"
            },
            schedule: {
                type: String,
                default: "9-5 M-F in Office"
            }
        },
        allergies: {
            type: String,
            default: "Off"
        },
        animals: {
            have: {
                type: String
            },
            description: {
                type: String,
                default: "none"   
            }
        },
        householdAdults: {
            number: {
                type: Number,
                default: 1
            },
            description: {
                type: String,
                default: "Just me"   
            }

        },
        children: {
            have: {
                type: String
            },
            description: {
                type: String,
                default: "no children"   
            }
        }
    },
    fosterParent : {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    
})


//indexes
userSchema.index({
    location: '2dsphere',
    name: 'text',
    email: 'text'
})



//create unique slugs (pulled from store)!
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('name')) {
//         next();
//         return;
//     }
//     this.slug = slug(this.name);

//     const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
//     const storesWithSlug = await this.constructor.find({slug: slugRegEx })
//     if(storesWithSlug.length) {
//         this.slug = `${this.slug}-${storesWithSlug.length + 1}`
//     }
//      next()
   
// })

// userSchema.pre('save', async function(next) {
//     console.log(this) 
// })

// userSchema.pre('findOneAndUpdate', async function() {
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     docToUpdate.profile.complete = true
//  });


userSchema.virtual('gravatar').get(function() {
    const hash = md5(this.email)
    return `https://gravatar.com/avatar/${hash}?s=200`
})


userSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'user'
})

function autopopulate(next) {
    this.populate('applications')
    next()
}

userSchema.pre('find', autopopulate)
userSchema.pre('findOne', autopopulate)

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', userSchema)