import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Home from "./Components/Pages/Home";
import Listing from "./Components/Pages/Listing";
import ProductDetails from "./Components/Pages/ProductDetails";
import Cart from "./Components/Pages/Cart";
import SignIn from "./Components/Pages/SignIn";
import SignUp from "./Components/Pages/SignUp";
import Profile from "./Components/Pages/Profile";
import Orders from "./Components/Pages/Orders";
import Dashboard from "./Components/Pages/Dashboard";
import Contact from "./Components/Pages/Contact";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Main Routes */}
        <Route path="/" exact element={<Home />} />
        <Route path="/new-arrivals" element={<Listing category="new-arrivals" />} />
        
        {/* Men's Routes */}
        <Route path="/men/t-shirts" element={<Listing category="men-tshirts" />} />
        <Route path="/men/oversized" element={<Listing category="men-oversized" />} />
        <Route path="/men/bottom" element={<Listing category="men-bottom" />} />
        <Route path="/men/jackets" element={<Listing category="men-jackets" />} />
        <Route path="/men/polo" element={<Listing category="men-polo" />} />
        
        {/* Collection Routes */}
        <Route path="/collection/distress" element={<Listing category="distress-collection" />} />
        <Route path="/collection/untamed-wild" element={<Listing category="untamed-wild" />} />
        <Route path="/collection/festive" element={<Listing category="festive-collection" />} />
        <Route path="/collection/knit-wear" element={<Listing category="knit-wear" />} />
        
        {/* Women's Routes */}
        <Route path="/women/crop-tops" element={<Listing category="women-crop-tops" />} />
        <Route path="/women/sleeveless-crop-tops" element={<Listing category="women-sleeveless-tops" />} />
        <Route path="/women/cargo-pants" element={<Listing category="women-cargo-pants" />} />
        
        {/* Other Routes */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Dashboard />} />
        {/* <Route path="/admin/products" element={<ProductManagement/>} />
        <Route path="/admin/categories" element={<CategoryManagement/>} /> */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
