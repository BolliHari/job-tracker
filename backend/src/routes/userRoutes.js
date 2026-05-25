const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController')

router.get('/me', protect, getProfile)
router.patch('/me', protect, updateProfile)
router.put('/me/password', protect, changePassword)

module.exports = router
