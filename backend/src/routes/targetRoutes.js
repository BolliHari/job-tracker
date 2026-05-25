const express = require('express')
const router = express.Router()
const { getTargets, updateTargets } = require('../controllers/targetController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getTargets)
router.put('/', protect, updateTargets)

module.exports = router
