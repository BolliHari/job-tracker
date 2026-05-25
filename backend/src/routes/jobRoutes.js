const express = require('express')
const router = express.Router()
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.route('/').get(getJobs).post(createJob)
router.route('/:id').get(getJob).put(updateJob).delete(deleteJob)

module.exports = router
