import { Request, Response } from 'express';
import Earning, { EarningType, PayoutStatus } from '../models/earnings.model';
import Doctor from '../models/doctor.model';
import mongoose from 'mongoose';

// @desc    Get doctor earnings
// @route   GET /api/earnings
// @access  Private (Doctor only)
export const getDoctorEarnings = async (req: Request, res: Response) => {
  try {
    // Find doctor profile by user ID
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Parse query parameters
    const { 
      fromDate, 
      toDate, 
      type, 
      isPaid, 
      limit = 25, 
      page = 1
    } = req.query;

    // Set up base query
    const query: any = { doctor: doctor._id };

    // Add date filter if provided
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate as string);
      if (toDate) query.date.$lte = new Date(toDate as string);
    }

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    // Add payment status filter if provided
    if (isPaid !== undefined) {
      query.isPaid = isPaid === 'true';
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get earnings
    const earnings = await Earning.find(query)
      .populate({
        path: 'appointment',
        populate: {
          path: 'patient',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        }
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Earning.countDocuments(query);

    // Calculate summary statistics
    const totalEarnings = await Earning.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    const paidEarnings = await Earning.aggregate([
      { $match: { doctor: doctor._id, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    const pendingEarnings = await Earning.aggregate([
      { $match: { doctor: doctor._id, isPaid: false } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    // Group earnings by type
    const earningsByType = await Earning.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: { _id: '$type', total: { $sum: '$netAmount' } } }
    ]);

    // Format the earnings by type
    const formattedEarningsByType = Object.values(EarningType).map(type => {
      const found = earningsByType.find(item => item._id === type);
      return {
        type,
        amount: found ? found.total : 0
      };
    });

    res.status(200).json({
      success: true,
      count: earnings.length,
      total,
      data: earnings,
      summary: {
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        paidEarnings: paidEarnings.length > 0 ? paidEarnings[0].total : 0,
        pendingEarnings: pendingEarnings.length > 0 ? pendingEarnings[0].total : 0,
        earningsByType: formattedEarningsByType
      },
      pagination: {
        current: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get doctor earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings'
    });
  }
};

// @desc    Get doctor earnings statistics
// @route   GET /api/earnings/stats
// @access  Private (Doctor only)
export const getEarningsStats = async (req: Request, res: Response) => {
  try {
    // Find doctor profile by user ID
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate date ranges
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate earnings for different periods
    const yearlyEarnings = await Earning.aggregate([
      { 
        $match: { 
          doctor: doctor._id,
          date: { $gte: startOfYear }
        } 
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const monthlyEarnings = await Earning.aggregate([
      { 
        $match: { 
          doctor: doctor._id,
          date: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const weeklyEarnings = await Earning.aggregate([
      { 
        $match: { 
          doctor: doctor._id,
          date: { $gte: startOfWeek }
        } 
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    // Get monthly earnings breakdown for chart
    const monthlyBreakdown = await Earning.aggregate([
      { 
        $match: { 
          doctor: doctor._id,
          date: { $gte: startOfYear }
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$netAmount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
    
    // Format monthly earnings for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    
    monthlyBreakdown.forEach(item => {
      const monthIndex = item._id.month - 1;
      monthlyData[monthIndex] = item.total;
    });
    
    const formattedMonthlyData = months.map((month, index) => ({
      name: month,
      amount: monthlyData[index]
    }));
    
    // Get earnings by type
    const earningsByType = await Earning.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: { _id: '$type', total: { $sum: '$netAmount' } } }
    ]);
    
    // Format earnings by type for chart
    const typeData = Object.values(EarningType).map(type => {
      const found = earningsByType.find(item => item._id === type);
      return {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: found ? found.total : 0
      };
    }).filter(item => item.value > 0);
    
    res.status(200).json({
      success: true,
      data: {
        yearly: yearlyEarnings.length > 0 ? yearlyEarnings[0].total : 0,
        monthly: monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0,
        weekly: weeklyEarnings.length > 0 ? weeklyEarnings[0].total : 0,
        monthlyChart: formattedMonthlyData,
        typeChart: typeData
      }
    });
  } catch (error) {
    console.error('Get earnings stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings statistics'
    });
  }
};

// @desc    Get earnings by ID
// @route   GET /api/earnings/:id
// @access  Private (Doctor only)
export const getEarningById = async (req: Request, res: Response) => {
  try {
    // Find doctor profile by user ID
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Find earning
    const earning = await Earning.findById(req.params.id)
      .populate({
        path: 'appointment',
        populate: [
          {
            path: 'patient',
            populate: {
              path: 'user',
              select: 'firstName lastName profilePicture'
            }
          }
        ]
      });
    
    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Earning not found'
      });
    }
    
    // Check if this earning belongs to the doctor
    if (earning.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this earning'
      });
    }
    
    res.status(200).json({
      success: true,
      data: earning
    });
  } catch (error) {
    console.error('Get earning by ID error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Earning not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching earning'
    });
  }
}; 