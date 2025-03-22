const { User } = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 