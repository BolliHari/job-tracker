const User = require('../models/User')
const bcrypt = require('bcrypt')

function formatProfile(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  }
}

const getProfile = async (req, res) => {
  try {
    return res.status(200).json(formatProfile(req.user))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body
    const trimmed = typeof name === 'string' ? name.trim() : ''

    if (!trimmed) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: trimmed },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(formatProfile(user))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

module.exports = { getProfile, updateProfile, changePassword }
