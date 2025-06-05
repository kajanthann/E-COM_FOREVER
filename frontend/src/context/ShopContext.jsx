import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;  // Empty string since we're using Vite proxy

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  const clearUserData = () => {
    setToken("");
    setCartItems({});
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
  };

  // Helper to get Authorization headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      clearUserData();
      navigate('/login');
    }
    toast.error(error.response?.data?.message || error.message);
  };

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
  };

  const addToCart = async (itemId, size) => {
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (!size) {
      toast.error("Please select a size before adding to cart");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size },
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        await getUserCart(token);
        const product = products.find(p => p._id === itemId);
        toast.success(`${product?.name || 'Product'} added to cart`);
      } else {
        toast.error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      handleAuthError(error);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        const qty = cartItems[itemId][size];
        if (qty > 0) {
          totalCount += qty;
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) {
      toast.error("Please login to update cart");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity },
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        await getUserCart(token);
        const product = products.find(p => p._id === itemId);
        if (quantity === 0) {
          toast.info(`${product?.name || 'Product'} removed from cart`);
        } else {
          toast.success(`Cart updated successfully`);
        }
      } else {
        toast.error(response.data.message || "Failed to update cart");
      }
    } catch (error) {
      console.error('Update cart error:', error);
      handleAuthError(error);
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (!product) continue;
      for (const size in cartItems[itemId]) {
        const qty = cartItems[itemId][size];
        if (qty > 0) {
          totalAmount += product.price * qty;
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserCart = async (userToken) => {
    if (!userToken) {
      clearCart();
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/cart/get`,
        { 
          headers: { 
            Authorization: `Bearer ${userToken}` 
          }
        }
      );
      
      if (response.data.success) {
        // Only update cart if there are actual changes
        const newCartData = response.data.cartData || {};
        if (JSON.stringify(newCartData) !== JSON.stringify(cartItems)) {
          setCartItems(newCartData);
          // Update localStorage
          if (Object.keys(newCartData).length === 0) {
            localStorage.removeItem("cartItems");
          } else {
            localStorage.setItem("cartItems", JSON.stringify(newCartData));
          }
        }
      } else {
        console.error('Failed to fetch cart:', response.data);
        toast.error(response.data.message || "Failed to fetch cart");
        clearCart();
      }
    } catch (error) {
      console.error('Get cart error:', error);
      if (error.response?.status === 404) {
        // If the endpoint is not found, try to refresh the page
        toast.error("Cart service unavailable. Please refresh the page.");
      } else {
        handleAuthError(error);
      }
    }
  };

  // Clean up cart data when component unmounts or user logs out
  useEffect(() => {
    return () => {
      if (!token) {
        clearCart();
      }
    };
  }, [token]);

  // Refresh cart data periodically and after login
  useEffect(() => {
    if (token) {
      // Initial load
      getUserCart(token);

      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        getUserCart(token);
      }, 30000); // Refresh every 30 seconds

      // Cleanup on unmount
      return () => clearInterval(refreshInterval);
    } else {
      clearCart();
    }
  }, [token]);

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      getUserCart(storedToken);
    } else {
      setCartItems({});
    }
  }, []);

  const value = {
    products,
    loading,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    setCartItems,
    clearUserData,
    getAuthHeaders,
    handleAuthError,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
