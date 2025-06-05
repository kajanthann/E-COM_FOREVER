import express from 'express';
import {
  allOrders,
  placeOrder,
  updateStatus,
  userorders
} from '../controllers/orderController.js';
import authAdmin from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin routes
orderRouter.get('/orders', authAdmin, allOrders);
orderRouter.post('/update-status', authAdmin, updateStatus);

// User routes
orderRouter.post('/place-order', authUser, placeOrder);
orderRouter.get('/user-orders', authUser, userorders);

export default orderRouter;