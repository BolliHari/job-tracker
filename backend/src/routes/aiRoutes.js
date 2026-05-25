const express = require('express')
const router = express.Router()
const { summarizeJD, interviewPrep, resumeMatch } = require('../controllers/aiController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)
router.post('/summarize-jd', summarizeJD)
router.post('/interview-prep', interviewPrep)
router.post('/resume-match', resumeMatch)

module.exports = router
