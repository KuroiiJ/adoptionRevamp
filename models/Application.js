const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs')

const applicationSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['New', 'Started','Rejected', 'Approved' ],
        default: 'New'
    },
    created: {
        type: Date,
        default: Date.now
    },
    landlordApproval: {
        type: Boolean,
        default: false
    },
    esa: {
        type: Boolean,
        default: false
    },
    crateTraining : {
        type: Boolean,
        default: false
    },
    surrendReturnRehome : {
        type: Boolean,
        default: false
    },
    timeOff : {
        type: Boolean,
        default: false
    },
    resources : {
        type: Boolean,
        default: false
    },
    training : {
        type: Boolean,
        default: false
    },
    otherRescues : {
        type: String,
        trim: true,
        required: false
    },
    food : {
        type: String,
        trim: true
    },
    
    notOkayBehavior: [String],

    author: {
        type: mongoose.Schema.ObjectId, 
        ref: 'User',
        required: 'You must supply an author'
    },
    dog: {
        type: mongoose.Schema.ObjectId, 
        ref: 'Dog',
        required: 'You must supply a dog'
    }
}, {
        //mongoose: do these to automatically include virtuals when calling stores
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    
})

//indexes

applicationSchema.index({
    name: 'text', 
    description: 'text'
})

applicationSchema.index({
    location: '2dsphere'
})


//hooks

// applicationSchema.pre('save', async function(next) {
//     console.log(this.author)
    
//      next()
   
// })







//link to reviews **This is Mongoose Specific** 

// applicationSchema.virtual('reviews', {
//     ref: 'Review',
//     localField: '_id',
//     foreignField: 'store'
// })

applicationSchema.virtual('dogs', {
    ref: 'Dog',
    localField: '_id',
    foreignField: 'application'
})

function autopopulate(next) {
    this.populate('author')
    // this.populate('dog')
    next()
}

applicationSchema.pre('find', autopopulate)
applicationSchema.pre('findOne', autopopulate)

module.exports = mongoose.model('Application', applicationSchema)