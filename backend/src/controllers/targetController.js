const User = require('../models/User')

const DEFAULT_TARGETS = {
  targetRole: '',
  targetDate: '',
  salary: '',
  applicationTarget: 20,
}

function normalizeTargets(targets) {
  return {
    targetRole: targets?.targetRole?.trim() ?? DEFAULT_TARGETS.targetRole,
    targetDate: targets?.targetDate ?? DEFAULT_TARGETS.targetDate,
    salary: targets?.salary?.trim() ?? DEFAULT_TARGETS.salary,
    applicationTarget:
      targets?.applicationTarget ?? DEFAULT_TARGETS.applicationTarget,
  }
}

function validateTargetsBody(body) {
  const { targetRole, targetDate, salary, applicationTarget } = body

  if (applicationTarget === undefined || applicationTarget === null) {
    return { valid: false, message: 'Application target is required' }
  }

  const parsedTarget = Number(applicationTarget)
  if (Number.isNaN(parsedTarget) || parsedTarget < 1) {
    return { valid: false, message: 'Application target must be at least 1' }
  }

  if (
    targetDate &&
    typeof targetDate === 'string' &&
    !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)
  ) {
    return { valid: false, message: 'Target date must be YYYY-MM-DD' }
  }

  return {
    valid: true,
    data: {
      targetRole: typeof targetRole === 'string' ? targetRole.trim() : '',
      targetDate: typeof targetDate === 'string' ? targetDate : '',
      salary: typeof salary === 'string' ? salary.trim() : '',
      applicationTarget: parsedTarget,
    },
  }
}

const getTargets = async (req, res) => {
  try {
    return res.status(200).json(normalizeTargets(req.user.targets))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const updateTargets = async (req, res) => {
  try {
    const validation = validateTargetsBody(req.body)
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { targets: validation.data } },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(normalizeTargets(user.targets))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

module.exports = { getTargets, updateTargets }
