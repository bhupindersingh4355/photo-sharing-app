const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/shared');
    },
    filename: (req, file, cb) => {
      var filetype = '';
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'photo-' + Date.now() + '.' + filetype);
    }
});

var upload = multer({storage: storage});

const ctrlUser = require('../controllers/user.controller');

const ctrlPhoto = require('../controllers/photo.controller');

const jwtHelper = require('../config/jwtHelper');

// user routes
router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);

// photo routes
router.post('/photo', upload.single('file'), ctrlPhoto.create);
router.get('/photo', ctrlPhoto.get);
router.delete('/photo/:id', ctrlPhoto.delete);

module.exports = router;



