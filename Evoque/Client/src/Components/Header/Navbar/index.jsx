import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../config/api";
import "./Navbar.css";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/category`);
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      } else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  // Filter categories by type
  const getMenCategories = () => categories.filter(cat => 
    cat.name.toLowerCase().includes('men') || 
    ['t-shirts', 'oversized', 'bottom', 'jackets', 'polo'].some(type => 
      cat.name.toLowerCase().includes(type)
    )
  );

  const getWomenCategories = () => categories.filter(cat => 
    cat.name.toLowerCase().includes('women') || 
    ['crop tops', 'sleeveless', 'cargo'].some(type => 
      cat.name.toLowerCase().includes(type)
    )
  );

  const getCollectionCategories = () => categories.filter(cat => 
    ['collection', 'distress', 'untamed', 'festive', 'knit'].some(type => 
      cat.name.toLowerCase().includes(type)
    )
  );

  return (
    <div className="navbar">
      <div className="burger-icon" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <ul className={`nav-list ${isMenuVisible ? "show" : ""}`}>
        <li className="nav-item">
          <Link to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/new-arrivals">New Arrivals</Link>
        </li>

        {/* Shop Men Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("shopMen")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("shopMen")}>Shop Men</span>
          {activeDropdown === "shopMen" && (
            <ul className="dropdown-menu">
              {getMenCategories().map((category) => (
                <li key={category._id} className="dropdown-item">
                  <Link to={`/cat/${category._id}`}>{category.name}</Link>
                </li>
              ))}
              {getMenCategories().length === 0 && (
                <li className="dropdown-item">No categories available</li>
              )}
            </ul>
          )}
        </li>

        {/* Collection Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("collection")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("collection")}>Collection</span>
          {activeDropdown === "collection" && (
            <ul className="dropdown-menu">
              {getCollectionCategories().map((category) => (
                <li key={category._id} className="dropdown-item">
                  <Link to={`/cat/${category._id}`}>{category.name}</Link>
                </li>
              ))}
              {getCollectionCategories().length === 0 && (
                <li className="dropdown-item">No collections available</li>
              )}
            </ul>
          )}
        </li>

        {/* Shop Women Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("shopWomen")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("shopWomen")}>Shop Women</span>
          {activeDropdown === "shopWomen" && (
            <ul className="dropdown-menu">
              {getWomenCategories().map((category) => (
                <li key={category._id} className="dropdown-item">
                  <Link to={`/cat/${category._id}`}>{category.name}</Link>
                </li>
              ))}
              {getWomenCategories().length === 0 && (
                <li className="dropdown-item">No categories available</li>
              )}
            </ul>
          )}
        </li>

        <li className="nav-item">
          <Link to="/contact">Contact Us</Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
