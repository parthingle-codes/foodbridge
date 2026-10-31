const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const listingController = require('../controllers/listingController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || '.jpg'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', authenticate, authorize('DONOR'), listingController.createListing);
router.get('/', authenticate, listingController.getListings);
router.get('/:id', authenticate, listingController.getListingById);
router.put('/:id', authenticate, authorize('DONOR'), listingController.updateListing);
router.delete('/:id', authenticate, authorize('DONOR'), listingController.deleteListing);
router.patch('/:id/status', authenticate, listingController.updateListingStatus);
router.post('/:id/image', authenticate, upload.single('image'), listingController.uploadListingImage);

module.exports = router;
