import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod } = req.body;

    // Validate required fields
    if (!userId || !items || !amount || !address || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order',
      });
    }

    // Validate address fields
    const requiredAddressFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missingFields = requiredAddressFields.filter(field => !address[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing address fields: ${missingFields.join(', ')}`,
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod,
      payment: paymentMethod === 'COD' ? false : true,
      status: paymentMethod === 'COD' ? 'Order placed' : 'Payment pending',
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear cart only for COD orders or successful online payments
    if (paymentMethod === 'COD') {
      await userModel.findByIdAndUpdate(userId, {cartData: {}});
    }

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id,
    });
    
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error placing order',
    });
  }
};

// Placeholder for Stripe
const placeOrderStripe = async (req, res) => {
  res.json({ success: false, message: 'Stripe payment not implemented yet' });
};

// Placeholder for Razorpay
const placeOrderRazorpay = async (req, res) => {
  res.json({ success: false, message: 'Razorpay payment not implemented yet' });
};

// Admin: Get all orders
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
      .sort({ date: -1 }); // Sort by date descending
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders',
    });
  }
};

// User: Get their own orders
const userorders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    const orders = await orderModel.find({ userId })
      .sort({ date: -1 }); // Sort by date descending
    
    if (!orders) {
      return res.json({ 
        success: true, 
        orders: [] 
      });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your orders',
    });
  }
};

// Admin: Update Order Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required',
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status',
    });
  }
};

export {
  placeOrder,
  allOrders,
  userorders,
  updateStatus,
};
