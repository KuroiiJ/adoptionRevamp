const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const applicationController = require('../controllers/applicationController')
const dogController = require('../controllers/dogController')

// Do work here

 const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', authController.isLoggedIn, catchErrors(applicationController.getApplications));
router.get('/applications', authController.isLoggedIn, catchErrors(applicationController.getApplications));
router.get('/applications/:id', catchErrors(applicationController.getSingleApp));
// router.get('/stores', catchErrors(storeController.getStores));
// router.get('/stores/:slug', catchErrors(storeController.getSingleStore));
router.get('/add', authController.isLoggedIn, authController.hasCompleteProfile, applicationController.addApplication)
router.post('/add/application', 
    catchErrors(applicationController.createApplication)
    )
router.get('/add/dog', authController.isLoggedIn, authController.isAdmin, dogController.addDog)
router.post('/add/dog/', 
    authController.isLoggedIn, 
    authController.isAdmin, 
    dogController.upload,
    catchErrors(dogController.resize),
    dogController.createDog
    )

// router.post('/add/:id', 
//     storeController.upload,
//     catchErrors(storeController.resize),
//     catchErrors(storeController.updateStore)
//     )
// router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/tags/', catchErrors(applicationController.getAppsByDog))
router.get('/tags/:tag', catchErrors(applicationController.getAppsByDog))

router.get('/login', userController.loginForm)
router.post('/login', authController.login)

router.get('/register', userController.registerForm)
router.post('/register', 
    userController.validateRegister,
    catchErrors(userController.registerUser),
    authController.login
    )
router.get('/logout', authController.logout)
router.get('/account', authController.isLoggedIn, userController.account)
router.post('/account', catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgot))
router.get('/account/reset/:token', catchErrors(authController.reset))
router.post('/account/reset/:token', 
    authController.confirmedPasswords,
    catchErrors(authController.update)
    )
router.get('/map', storeController.mapPage)
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts))
router.post('/reviews/:id', 
    authController.isLoggedIn,
    catchErrors(reviewController.addReview))
router.get('/top', catchErrors(storeController.getTopStores))
/* 
    API
*/

router.get('/api/search', catchErrors(storeController.searchStores))
router.get('/api/applications/near', catchErrors(applicationController.mapApplications))
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore))



module.exports = router;
