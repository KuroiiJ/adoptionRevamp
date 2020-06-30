const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const User = mongoose.model('User')
const Application = mongoose.model('Application')
const Dog = mongoose.model('Dog')


exports.homePage = (req, res) => {
    req.flash('error', 'Something Happened')
    req.flash('info', 'Something Happened')
    req.flash('warning', 'Something Happened')
    req.flash('success', 'Something Happened')
    res.render('index', {title: 'Home'})
}

exports.addApplication = async (req, res) => {
    const dogs = await Dog.find()
    res.render('addApplication', {title: 'Create Application', dogs})
}


exports.createApplication = async (req, res) => {
    console.log("APPPPPPPP", req.body)
    req.body.author = req.user._id
    await (new Application(req.body)).save()
    req.flash('success', `Successfully Sent Application.`)
    res.redirect('back')
}

exports.getApplications = async (req, res) => {
  if(req.user.isAdmin) {
   const applications = await Application.find()
   res.render('applications', {title: 'Current Applications', applications})
  }
  else {
  const applications = await Application.find({ author: req.user._id })
   res.render('applications', {title: 'Current Applications', applications})
  }
}

exports.getSingleApp = async (req, res, next) => {
    const app = await Application.findOne({id: req.params._id}).populate('author dog')
    if(!app) return next()
    res.render('application', {title: `${app.author.name} wants ${app.dog.name}`, app} )
}

const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)) {
        throw Error('You must own a store to edit it')
    }
}

// exports.editStore = async (req, res) => {
//     const store = await Store.findOne({_id: req.params.id})
//     confirmOwner(store, req.user)
//     res.render('editStore', {title: `Edit ${store.name}`, store} )
// }

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


exports.searchStores = async (req, res) => {
    const stores = await Store
      // find stores that match query
      .find(
        {
          $text: {
            $search: req.query.q
          }
        },
        {
          score: { $meta: 'textScore' }
        }
      )
      // sort based on textScore
      .sort({
        score: { $meta: 'textScore' }
      })
      // limit to 5 results
      .limit(5)
    res.json(stores)
  }

  exports.mapStores = async (req, res) => {
    const coordinates = [ req.query.lng, req.query.lat ].map(parseFloat)
    const q = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: 10000 // = 10km
        }
      }
    }
  
    const stores = await Store.find(q)
      // chain on the '.select' to specify which feilds you want
      // use '-' to exclude
      .select('slug name description location photo')
      .limit(10)
    res.json(stores)
  }

//   exports.mapStores = async (req, res) => {
//     const coordinates = [req.query.lng, req.query.lat].map(parseFloat)

//     const q = {
//         location: {
//             $geometry: {
//                 type: 'Point',
//                 coordinates
//             },
//             $maxDistance: 10000 //10km
//         }
//     }

//     const stores = await Store.find(q).select('slug name description location').limit(10)
//     res.json(stores)

//   }
  
  exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' })
  }
  
  exports.heartStore = async (req, res) => {
      const hearts = req.user.hearts.map(obj => obj.toString())
      const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'
      const user = await User.findByIdAndUpdate(req.user._id,
        { [operator]: { hearts: req.params.id }},
        { new: true }
        )
        res.json(user)
  }
  

  exports.getHearts = async (req, res) => {
    const stores = await Store.find({
      _id: { $in: req.user.hearts }
    })
    res.render('stores', {title: "Hearted Stores", stores})
  }

  exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores()
    res.render('topStores', { stores, title: ' ⭑ Top Stores' })
  }
