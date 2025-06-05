import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const { setShowSearch, getCartCount, token, setToken, navigate, setCartItems } = useContext(ShopContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    setDropdownOpen(false);
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between py-5 font-medium">
        <Link to="/">
          <img className="w-36" src={assets.logo} alt="Logo" />
        </Link>
        <ul className="hidden sm:flex gap-5 text-gray-700">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p>Home</p> <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink to="/collection" className="flex flex-col items-center gap-1">
            <p>Collection</p> <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p>About</p> <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink to="/contact" className="flex flex-col items-center gap-1">
            <p>Contact</p> <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </ul>

        <div className="flex items-center gap-6">
          <img
            onClick={() => setShowSearch(true)}
            className="w-5 cursor-pointer"
            src={assets.search_icon}
            alt="Search"
          />
          <div className="relative">
            <img
              onClick={() => {
                if (!token) navigate('/login');
                else setDropdownOpen((prev) => !prev);
              }}
              className="w-5 cursor-pointer"
              src={assets.profile_icon}
              alt="Profile"
            />
            {token && dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg z-10 flex flex-col gap-2"
              >
                <p onClick={() => navigate('/profile')} className="cursor-pointer hover:text-black">My Profile</p>
                <p onClick={() => navigate('/orders')} className="cursor-pointer hover:text-black">Orders</p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Log Out
                </p>
              </div>
            )}
          </div>

          <Link to="/cart" className="relative">
            <img className="w-5 min-w-5" src={assets.cart_icon} alt="Cart" />
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </p>
          </Link>
        </div>
      </div>

      <ul className="md:hidden mb-4 justify-between flex text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>Home</p> <hr className="hidden w-full border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>Collection</p> <hr className="hidden w-full border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>About</p> <hr className="hidden w-full border-none h-[1.5px] bg-gray-700" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>Contact</p> <hr className="hidden w-full border-none h-[1.5px] bg-gray-700" />
        </NavLink>
      </ul>
    </div>
  );
};

export default Navbar;
