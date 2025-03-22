const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/coupon');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin Routes

// Get all coupons (admin)
router.get('/admin', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Error in GET /admin:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Get single coupon by ID
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error in GET /:id:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Create new coupon
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error in POST /:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create coupon'
        });
    }
});

// Update coupon
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error in PUT /:id:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update coupon'
        });
    }
});

// Delete coupon
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /:id:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete coupon'
        });
    }
});

// User Routes

// Validate coupon
router.post('/validate', authMiddleware, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit exceeded'
            });
        }

        // Check minimum purchase
        if (cartTotal < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase amount of ₹${coupon.minPurchase} required`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        res.json({
            success: true,
            coupon: {
                ...coupon.toObject(),
                calculatedDiscount: discount
            }
        });
    } catch (error) {
        console.error('Error in POST /validate:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to validate coupon'
        });
    }
});

// Apply coupon (increment usage count)
router.post('/apply', authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;
        
        const coupon = await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } },
            { new: true }
        );

        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        res.json({
            success: true,
            message: 'Coupon applied successfully'
        });
    } catch (error) {
        console.error('Error in POST /apply:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to apply coupon'
        });
    }
});

module.exports = router; 