const { User } = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        console.log('Admin Middleware - Checking user:', req.user.userId);
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            console.log('Admin Middleware - User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (!user.isAdmin) {
            console.log('Admin Middleware - User is not admin');
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        console.log('Admin Middleware - Access granted');
        next();
    } catch (error) {
        console.error('Admin Middleware - Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error checking admin status'
        });
    }
}; 