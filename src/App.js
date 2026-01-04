import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ShoppingCart, Menu, X, Instagram, Search, ChevronRight, Minus, Plus, Trash2, User, Package, BarChart3, Settings, LogOut, MessageSquare, Eye } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Context for Cart
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("luxuryshop_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("luxuryshop_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, color, quantity = 1, selectedOptions = [], flocageText = "") => {
    setCart(prev => {
      // Create a unique key based on product, size, color, and options
      const optionsKey = selectedOptions.map(o => o.name).sort().join(",");
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && 
                item.size === size && 
                item.color === color &&
                (item.selectedOptions || []).map(o => o.name).sort().join(",") === optionsKey &&
                item.flocageText === flocageText
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { 
        product_id: product.id, 
        product, 
        size, 
        color, 
        quantity,
        selectedOptions,
        flocageText
      }];
    });
    toast.success("Ajouté au panier");
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const clearCart = () => setCart([]);

  // Calculate total with options
  const cartTotal = cart.reduce((sum, item) => {
    const optionsTotal = (item.selectedOptions || []).reduce((s, opt) => s + opt.price, 0);
    return sum + ((item.product.price + optionsTotal) * item.quantity);
  }, 0);
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Auth Context for Admin
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [admin, setAdmin] = useState(null);

  const login = async (username, password) => {
    const res = await axios.post(`${API}/admin/login`, { username, password });
    localStorage.setItem("admin_token", res.data.token);
    setToken(res.data.token);
    setAdmin(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
  };

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== COMPONENTS ====================

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.get(`${API}/settings`).then(res => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <nav className="nav-glass sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold tracking-wider">
              {settings.site_name || "LUXURYSHOP76K"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-gold transition-colors font-medium" data-testid="nav-home">Accueil</Link>
            <Link to="/shop" className="text-white hover:text-gold transition-colors font-medium" data-testid="nav-shop">Boutique</Link>
            <Link to="/contact" className="text-white hover:text-gold transition-colors font-medium" data-testid="nav-contact">Contact</Link>
            <Link to="/cart" className="relative" data-testid="nav-cart">
              <ShoppingCart className="w-6 h-6 text-white hover:text-gold transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-black text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative" data-testid="mobile-cart">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-black text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white" data-testid="mobile-menu-btn">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-white hover:text-gold transition-colors font-medium">Accueil</Link>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="text-white hover:text-gold transition-colors font-medium">Boutique</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="text-white hover:text-gold transition-colors font-medium">Contact</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.get(`${API}/settings`).then(res => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-card border-t border-gold/20 mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif text-3xl font-bold text-gold mb-4">{settings.site_name || "LUXURYSHOP76K"}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {settings.tagline || "L'Excellence du Sport & du Style"}
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href={`https://snapchat.com/add/${settings.social_snapchat || "Luxury961x213"}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-black transition-all" data-testid="social-snapchat">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.327.327 0 01.337.029c.154.12.183.312.09.471-.123.197-.336.383-.555.508-.314.177-.786.3-1.38.3-.345 0-.654-.045-.882-.12-.148-.045-.237-.075-.353-.195-.156-.165-.24-.375-.24-.593 0-.075.015-.15.03-.225l.002-.01c.009-.054.018-.109.025-.164l.003-.024c.09-.63.16-1.62.003-2.4-.51-2.505-2.505-3.375-4.365-3.375-.465 0-1.125.06-1.785.285-1.095.375-1.89 1.125-2.37 2.19-.18.39-.285.795-.36 1.2-.06.315-.075.63-.06.945.12 2.13 1.11 3.6 2.505 4.53.615.405 1.32.69 2.085.87.33.09.675.15 1.02.195.18.015.36.03.54.03.645 0 1.275-.135 1.83-.39.555-.255 1.035-.615 1.38-1.065.39-.51.615-1.125.615-1.785 0-.225-.03-.45-.09-.675-.12-.465-.375-.9-.72-1.26-.3-.3-.69-.555-1.125-.72-.435-.165-.915-.255-1.44-.255-.465 0-.87.075-1.215.21-.255.105-.48.24-.66.39-.165.135-.3.285-.42.435-.09.12-.165.24-.225.36-.045.09-.075.18-.105.27-.015.06-.03.12-.03.18-.015.06-.015.12-.015.18 0 .18.03.345.09.495.06.15.135.27.24.375.09.09.195.165.315.225.09.045.195.09.3.12.03.015.075.015.105.03.03 0 .06.015.09.015h.09c.06 0 .12-.015.18-.015.03-.015.06-.015.09-.03.03 0 .06-.015.09-.03.03-.015.06-.03.09-.045.03-.015.06-.03.075-.045.015-.015.045-.03.06-.045.015-.015.03-.03.045-.045l.03-.03c.015-.015.03-.03.03-.045.015-.015.015-.03.03-.045 0-.015.015-.03.015-.03.015-.03.015-.045.03-.06 0-.015.015-.03.015-.045s0-.03.015-.045c0-.015 0-.03.015-.045v-.015c0-.015 0-.03-.015-.045v-.015l-.015-.03c0-.015-.015-.03-.015-.03-.015-.015-.015-.03-.03-.045l-.015-.015c-.015-.015-.03-.03-.045-.045l-.03-.03-.045-.03c-.015-.015-.045-.03-.06-.045l-.045-.03-.06-.03c-.03-.015-.045-.03-.075-.03l-.06-.03c-.03-.015-.06-.015-.09-.03-.03-.015-.06-.015-.09-.015-.03-.015-.06-.015-.09-.015-.045-.015-.075-.015-.12-.015-.03 0-.075 0-.105.015-.045 0-.075.015-.12.015-.03.015-.075.015-.105.03-.03.015-.06.03-.09.03-.03.015-.075.03-.105.045-.03.015-.06.03-.09.06l-.09.06c-.03.015-.06.045-.09.06-.015.03-.045.045-.06.075-.03.03-.045.045-.075.075-.015.03-.045.06-.06.09-.015.03-.03.06-.045.09-.015.03-.045.06-.06.105-.015.03-.03.075-.045.105-.015.045-.03.075-.03.12-.015.03-.015.075-.03.12 0 .045-.015.075-.015.12v.135c0 .03 0 .075.015.105 0 .045.015.075.015.12.015.03.015.075.03.105.015.045.03.075.045.12.015.03.03.075.045.105.015.03.045.075.06.105.03.03.045.075.075.105.03.03.06.075.09.105.03.03.06.06.09.09.03.03.075.06.105.09.03.03.075.06.12.09.045.015.09.045.135.075.045.015.09.045.135.06.045.015.09.03.135.045l.15.045c.045.015.105.03.15.03.06.015.105.015.165.03.045 0 .105.015.165.015h.165c.06 0 .12-.015.18-.015.06 0 .12-.015.18-.03.045-.015.105-.015.15-.03.06-.015.105-.03.15-.045.06-.015.105-.03.15-.06.045-.015.105-.045.15-.06.045-.03.105-.045.15-.075.045-.03.09-.06.135-.09.045-.03.09-.06.135-.105.045-.03.09-.075.12-.105.045-.045.075-.09.12-.135.03-.045.075-.09.105-.135.03-.045.06-.09.09-.15.03-.045.06-.105.075-.15.03-.06.045-.105.06-.165.015-.06.03-.105.045-.165.015-.06.015-.12.03-.18 0-.06.015-.12.015-.195 0-.06-.015-.135-.015-.195 0-.06-.015-.135-.03-.195-.015-.06-.03-.135-.045-.195-.015-.06-.045-.135-.075-.195-.03-.06-.06-.135-.09-.195-.045-.06-.075-.135-.12-.195-.045-.06-.105-.12-.15-.18-.06-.06-.12-.12-.18-.165-.075-.06-.15-.105-.225-.15-.09-.06-.18-.09-.27-.135-.105-.03-.21-.06-.315-.09-.12-.03-.24-.045-.36-.045-.06 0-.12 0-.18.015-.075 0-.135.015-.21.03-.06.015-.135.03-.195.06-.075.03-.15.06-.21.105-.075.03-.135.075-.195.12-.06.045-.12.09-.165.15-.06.045-.105.105-.15.165-.045.06-.09.12-.12.195-.045.06-.075.135-.105.21-.03.075-.045.15-.06.225-.015.075-.03.15-.03.24 0 .075 0 .15.015.24.015.075.03.165.06.24.03.075.06.15.105.225.045.075.09.135.15.195.045.06.105.12.165.165.06.045.135.09.21.135.075.03.15.06.24.09.075.015.165.03.255.045.09 0 .18.015.27 0 .09 0 .18-.015.27-.03.09-.015.165-.045.255-.075.075-.03.15-.06.225-.105.06-.045.135-.09.195-.15.06-.045.105-.105.15-.165.045-.06.09-.135.12-.21.03-.075.045-.15.06-.24.015-.075.015-.165.015-.255 0-.075-.015-.165-.03-.24-.03-.09-.06-.165-.105-.24-.045-.075-.105-.15-.165-.21-.075-.06-.15-.12-.24-.165-.09-.045-.18-.075-.285-.09-.09-.015-.195-.03-.3-.015-.105 0-.195.03-.3.06-.09.03-.18.075-.27.135-.075.06-.15.135-.21.21-.06.09-.105.18-.135.285-.03.09-.045.195-.045.3 0 .09.015.18.045.27.03.09.075.165.135.24.06.06.135.12.21.165.09.045.18.075.27.09.105.015.195.015.3 0 .09-.015.18-.045.27-.09.075-.045.15-.105.21-.165.06-.075.105-.15.135-.24.03-.09.045-.18.045-.27 0-.105-.015-.21-.045-.3-.03-.105-.075-.195-.135-.285-.06-.075-.135-.15-.21-.21-.09-.06-.18-.105-.27-.135-.105-.03-.195-.06-.3-.06-.105-.015-.21 0-.3.015-.105.015-.195.045-.285.09-.09.045-.165.105-.24.165-.06.06-.12.135-.165.21-.045.075-.075.15-.105.24-.015.075-.03.165-.03.24 0 .09 0 .18.015.255.015.09.03.165.06.24.03.075.075.15.12.21.045.06.09.12.15.165.06.06.135.105.195.15.075.045.15.075.225.105.09.03.165.06.255.075.09.015.18.03.27.03.09.015.18 0 .27 0 .09-.015.18-.03.255-.045.09-.03.165-.06.24-.09.075-.045.15-.09.21-.135.06-.045.12-.105.165-.165.06-.06.105-.12.15-.195.045-.075.075-.15.105-.225.03-.075.045-.165.06-.24.015-.09.015-.165.015-.24 0-.09-.015-.165-.03-.24-.015-.075-.03-.15-.06-.225-.03-.075-.06-.15-.105-.21-.03-.075-.075-.135-.12-.195-.045-.06-.09-.12-.15-.165-.045-.06-.105-.105-.165-.15-.06-.045-.12-.09-.195-.12-.075-.045-.135-.075-.21-.105-.06-.03-.135-.045-.195-.06-.075-.015-.135-.03-.21-.03-.06-.015-.12-.015-.18-.015-.12 0-.24.015-.36.045-.105.03-.21.06-.315.09-.09.045-.18.075-.27.135-.075.045-.15.09-.225.15-.06.045-.12.105-.18.165-.045.06-.105.12-.15.18-.045.06-.075.135-.12.195-.03.06-.06.135-.09.195-.03.06-.06.135-.075.195-.015.06-.03.135-.045.195-.015.06-.03.135-.03.195 0 .06-.015.135-.015.195 0 .075.015.135.015.195.015.06.015.12.03.18.015.06.03.105.045.165.015.06.03.105.06.165.015.045.045.105.075.15.03.06.06.105.09.15.03.045.075.09.105.135.045.045.075.09.12.135.03.03.075.075.12.105.045.045.09.075.135.105.045.03.09.06.135.09.045.03.09.045.15.075.045.015.09.045.15.06.045.03.09.045.15.06.045.015.09.03.15.045.06.015.105.015.15.03.06.015.12.03.18.03.06 0 .12.015.18.015h.165c.06 0 .12-.015.165-.015.06-.015.105-.015.165-.03.045-.015.105-.015.15-.03.045-.015.105-.03.15-.045.045-.015.105-.045.15-.06.045-.03.105-.045.15-.075.045-.03.09-.06.135-.09.045-.03.09-.075.135-.105.03-.045.075-.075.12-.12.03-.045.075-.09.105-.135.03-.045.06-.09.09-.15.015-.045.045-.105.06-.15.015-.06.03-.105.045-.165.015-.06.015-.105.015-.165V14.7c.015-.045 0-.09 0-.135 0-.06-.015-.12-.015-.18-.015-.06-.015-.12-.03-.18l-.045-.18c-.015-.06-.03-.12-.06-.18-.015-.06-.045-.12-.075-.18-.03-.06-.06-.12-.09-.18-.03-.06-.075-.12-.12-.18-.045-.06-.09-.12-.135-.18-.06-.06-.12-.12-.18-.165-.075-.06-.15-.12-.225-.165-.09-.06-.18-.12-.285-.165-.09-.045-.195-.09-.3-.12-.105-.03-.21-.06-.315-.075-.12-.015-.24-.03-.36-.03-.135 0-.27.015-.405.045-.12.03-.24.06-.36.12-.12.045-.225.105-.33.18-.105.075-.195.15-.285.255-.09.09-.165.195-.225.315-.06.105-.12.225-.15.36-.03.12-.045.255-.045.39 0 .12.015.24.045.36.03.12.075.24.135.345.075.12.15.225.255.315.09.09.195.165.315.24.12.06.255.12.39.15.12.03.255.045.39.045s.27-.015.39-.045c.135-.03.27-.09.39-.15.12-.075.225-.15.315-.24.105-.09.18-.195.255-.315.06-.105.105-.225.135-.345.03-.12.045-.24.045-.36 0-.135-.015-.27-.045-.39-.03-.135-.09-.255-.15-.36-.06-.12-.135-.225-.225-.315-.09-.105-.18-.18-.285-.255-.105-.075-.21-.135-.33-.18-.12-.06-.24-.09-.36-.12-.135-.03-.27-.045-.405-.045-.12 0-.24.015-.36.03-.105.015-.21.045-.315.075-.105.03-.21.075-.3.12-.105.045-.195.105-.285.165-.075.045-.15.105-.225.165-.06.045-.12.105-.18.165-.045.06-.09.12-.135.18-.045.06-.09.12-.12.18-.03.06-.06.12-.09.18-.03.06-.06.12-.075.18-.015.06-.045.12-.06.18l-.045.18c-.015.06-.015.12-.03.18 0 .06-.015.12-.015.18 0 .045-.015.09 0 .135z"/></svg>
              </a>
              <a href={`https://tiktok.com/@${settings.social_tiktok || "LuxuryShop76k"}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-black transition-all" data-testid="social-tiktok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
              <a href={`https://instagram.com/${settings.social_instagram || "LuxuryShop76k"}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-black transition-all" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-gold transition-colors">Accueil</Link></li>
              <li><Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">Boutique</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>{settings.contact_email || "Amicheilane2@gmail.com"}</li>
              {settings.contact_phone && <li>{settings.contact_phone}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings.site_name || "LUXURYSHOP76K"}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

// ==================== PAGES ====================

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track visit
    axios.post(`${API}/visit?page=home`).catch(() => {});
    // Init database if needed
    axios.post(`${API}/init`).catch(() => {});
    
    Promise.all([
      axios.get(`${API}/categories`),
      axios.get(`${API}/products?featured=true&limit=8`),
      axios.get(`${API}/settings`)
    ]).then(([catRes, prodRes, settingsRes]) => {
      setCategories(catRes.data);
      setFeaturedProducts(prodRes.data);
      setSettings(settingsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img 
            src={settings.hero_image || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
            alt="Hero" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl animate-fade-in">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {settings.site_name || "LUXURYSHOP76K"}
              </h1>
              <p className="text-xl sm:text-2xl text-gold mb-8">
                {settings.tagline || "L'Excellence du Sport & du Style"}
              </p>
              <Link to="/shop" className="btn-primary inline-flex items-center space-x-2" data-testid="shop-now-btn">
                <span>Découvrir la Collection</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="categories-section">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Nos <span className="text-gold">Catégories</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <Link 
              key={cat.id} 
              to={`/shop?category=${cat.id}`}
              className="card-luxury group relative aspect-square overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
              data-testid={`category-${cat.slug}`}
            >
              <img 
                src={cat.image || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-gold transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-card" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Produits <span className="text-gold">Vedettes</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-outline inline-flex items-center space-x-2" data-testid="view-all-btn">
              <span>Voir Tout</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="features-section">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Pourquoi <span className="text-gold">Nous Choisir</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-luxury p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border border-gold/30 flex items-center justify-center">
              <Package className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">Qualité Premium</h3>
            <p className="text-muted-foreground">Produits authentiques des plus grandes marques</p>
          </div>
          <div className="card-luxury p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border border-gold/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">Livraison Rapide</h3>
            <p className="text-muted-foreground">Expédition soignée sous 48h</p>
          </div>
          <div className="card-luxury p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border border-gold/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">Paiement Sécurisé</h3>
            <p className="text-muted-foreground">Transactions 100% sécurisées</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="card-luxury group overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.images?.[0] || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-gold text-xs uppercase tracking-wider mb-1">{product.brand}</p>
        )}
        <h3 className="font-serif text-base sm:text-lg font-semibold text-white group-hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gold font-bold text-lg mt-2">{product.price.toFixed(2)} €</p>
      </div>
    </Link>
  );
};

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    axios.post(`${API}/visit?page=shop`).catch(() => {});
    axios.get(`${API}/categories`).then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API}/products?limit=50`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    
    axios.get(url).then(res => {
      setProducts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen py-8" data-testid="shop-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-white mb-8">
          Notre <span className="text-gold">Boutique</span>
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-gold/20 text-white"
              data-testid="search-input"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              if (e.target.value) {
                setSearchParams({ category: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            className="px-4 py-3 bg-secondary border border-gold/20 text-white"
            data-testid="category-filter"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-luxury aspect-[3/4] shimmer"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [flocageText, setFlocageText] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    axios.post(`${API}/visit?page=product`).catch(() => {});
    axios.get(`${API}/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        if (res.data.sizes?.length) setSelectedSize(res.data.sizes[0]);
        if (res.data.colors?.length) setSelectedColor(res.data.colors[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const toggleOption = (option) => {
    setSelectedOptions(prev => {
      const exists = prev.find(o => o.name === option.name);
      if (exists) {
        return prev.filter(o => o.name !== option.name);
      }
      return [...prev, option];
    });
  };

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = product ? (product.price + optionsTotal) * quantity : 0;

  // Check if any flocage option is selected
  const hasFlocageSelected = selectedOptions.some(o => o.type === "flocage");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Produit non trouvé</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (hasFlocageSelected && !flocageText.trim()) {
      toast.error("Veuillez entrer le nom/numéro pour le flocage");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity, selectedOptions, flocageText);
  };

  return (
    <div className="min-h-screen py-8" data-testid="product-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden bg-card border border-gold/20">
              <img 
                src={product.images?.[0] || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-main-image"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden bg-card border border-gold/20">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-gold uppercase tracking-widest text-sm">{product.brand}</p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white" data-testid="product-name">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <p className="text-gold text-3xl font-bold" data-testid="product-price">{product.price.toFixed(2)} €</p>
              {optionsTotal > 0 && (
                <p className="text-muted-foreground">+ {optionsTotal.toFixed(2)} € d'options</p>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed" data-testid="product-description">{product.description}</p>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="block text-white font-medium mb-2">Taille</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border transition-all ${
                        selectedSize === size 
                          ? "border-gold bg-gold text-black" 
                          : "border-gold/30 text-white hover:border-gold"
                      }`}
                      data-testid={`size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <label className="block text-white font-medium mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border transition-all ${
                        selectedColor === color 
                          ? "border-gold bg-gold text-black" 
                          : "border-gold/30 text-white hover:border-gold"
                      }`}
                      data-testid={`color-${color}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {product.customization_options?.length > 0 && (
              <div className="space-y-4">
                <label className="block text-white font-medium">Personnalisation (optionnel)</label>
                
                {/* Patches */}
                {product.customization_options.filter(o => o.type === "patch").length > 0 && (
                  <div>
                    <p className="text-gold text-sm mb-2">Patchs (+3€)</p>
                    <div className="space-y-2">
                      {product.customization_options.filter(o => o.type === "patch").map((opt, i) => (
                        <label 
                          key={i} 
                          className={`flex items-center p-3 border cursor-pointer transition-all ${
                            selectedOptions.find(o => o.name === opt.name)
                              ? "border-gold bg-gold/10"
                              : "border-gold/20 hover:border-gold/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedOptions.find(o => o.name === opt.name)}
                            onChange={() => toggleOption(opt)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{opt.name}</p>
                            {opt.description && <p className="text-muted-foreground text-xs">{opt.description}</p>}
                          </div>
                          <span className="text-gold font-bold">+{opt.price.toFixed(2)}€</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flocages */}
                {product.customization_options.filter(o => o.type === "flocage").length > 0 && (
                  <div>
                    <p className="text-gold text-sm mb-2">Flocages (+5€)</p>
                    <div className="space-y-2">
                      {product.customization_options.filter(o => o.type === "flocage").map((opt, i) => (
                        <label 
                          key={i} 
                          className={`flex items-center p-3 border cursor-pointer transition-all ${
                            selectedOptions.find(o => o.name === opt.name)
                              ? "border-gold bg-gold/10"
                              : "border-gold/20 hover:border-gold/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedOptions.find(o => o.name === opt.name)}
                            onChange={() => toggleOption(opt)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{opt.name}</p>
                            {opt.description && <p className="text-muted-foreground text-xs">{opt.description}</p>}
                          </div>
                          <span className="text-gold font-bold">+{opt.price.toFixed(2)}€</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flocage Text Input */}
                {hasFlocageSelected && (
                  <div className="p-4 bg-secondary border border-gold/20">
                    <label className="block text-white text-sm font-medium mb-2">
                      Nom et numéro pour le flocage *
                    </label>
                    <input
                      type="text"
                      value={flocageText}
                      onChange={(e) => setFlocageText(e.target.value)}
                      placeholder="Ex: MBAPPE 7"
                      className="w-full px-4 py-2"
                      data-testid="flocage-input"
                    />
                    <p className="text-muted-foreground text-xs mt-1">Format: NOM NUMÉRO</p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-white font-medium mb-2">Quantité</label>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-white hover:border-gold"
                  data-testid="quantity-minus"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white text-xl font-medium w-12 text-center" data-testid="quantity-value">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-white hover:border-gold"
                  data-testid="quantity-plus"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="p-4 bg-secondary border border-gold/20">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-gold text-2xl font-bold">{totalPrice.toFixed(2)} €</span>
              </div>
              {selectedOptions.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {product.price.toFixed(2)}€ + {optionsTotal.toFixed(2)}€ (options) × {quantity}
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button 
              onClick={handleAddToCart}
              className="btn-primary w-full flex items-center justify-center space-x-2"
              data-testid="add-to-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Ajouter au Panier</span>
            </button>

            {/* Stock info */}
            <p className="text-muted-foreground text-sm">
              {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-8" data-testid="cart-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-8">
            Votre <span className="text-gold">Panier</span>
          </h1>
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-8">Votre panier est vide</p>
            <Link to="/shop" className="btn-primary" data-testid="continue-shopping-btn">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-white mb-8">
          Votre <span className="text-gold">Panier</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const optionsTotal = (item.selectedOptions || []).reduce((s, opt) => s + opt.price, 0);
              const itemPrice = item.product.price + optionsTotal;
              
              return (
                <div key={index} className="card-luxury p-4 flex gap-4" data-testid={`cart-item-${index}`}>
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.product.images?.[0] || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-white truncate">{item.product.name}</h3>
                    <p className="text-gold font-bold">{itemPrice.toFixed(2)} €</p>
                    {item.size && <p className="text-muted-foreground text-sm">Taille: {item.size}</p>}
                    {item.color && <p className="text-muted-foreground text-sm">Couleur: {item.color}</p>}
                    
                    {/* Display selected options */}
                    {item.selectedOptions?.length > 0 && (
                      <div className="mt-1">
                        {item.selectedOptions.map((opt, i) => (
                          <p key={i} className="text-gold text-xs">+ {opt.name} (+{opt.price.toFixed(2)}€)</p>
                        ))}
                      </div>
                    )}
                    
                    {/* Display flocage text */}
                    {item.flocageText && (
                      <p className="text-white text-sm mt-1">Flocage: <span className="text-gold">{item.flocageText}</span></p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 border border-gold/30 flex items-center justify-center text-white hover:border-gold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 border border-gold/30 flex items-center justify-center text-white hover:border-gold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-400"
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Récapitulatif</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{cartTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span>Calculée à l'étape suivante</span>
                </div>
              </div>
              <div className="border-t border-gold/20 pt-4 mb-6">
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold">{cartTotal.toFixed(2)} €</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full"
                data-testid="checkout-btn"
              >
                Passer la Commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal: "",
    payment_method: "card",
    notes: ""
  });

  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.get(`${API}/settings`).then(res => setSettings(res.data)).catch(() => {});
    if (cart.length === 0) navigate("/cart");
  }, [cart.length, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...form,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          selected_options: item.selectedOptions || [],
          flocage_text: item.flocageText || ""
        }))
      };

      const res = await axios.post(`${API}/orders`, orderData, {
        headers: { 'Origin': window.location.origin }
      });

      if (res.data.checkout_url) {
        // Redirect to Stripe
        window.location.href = res.data.checkout_url;
      } else {
        // Bank transfer or PayPal
        clearCart();
        navigate(`/order-confirmation/${res.data.order_id}`);
      }
    } catch (error) {
      toast.error("Erreur lors de la commande");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid="checkout-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-white mb-8">
          <span className="text-gold">Checkout</span>
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Info */}
          <div className="space-y-6">
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Informations</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm({...form, customer_name: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => setForm({...form, customer_email: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => setForm({...form, customer_phone: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>

            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Adresse de Livraison</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Adresse *</label>
                  <input
                    type="text"
                    required
                    value={form.shipping_address}
                    onChange={(e) => setForm({...form, shipping_address: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="input-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      value={form.shipping_city}
                      onChange={(e) => setForm({...form, shipping_city: e.target.value})}
                      className="w-full px-4 py-3"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Code Postal *</label>
                    <input
                      type="text"
                      required
                      value={form.shipping_postal}
                      onChange={(e) => setForm({...form, shipping_postal: e.target.value})}
                      className="w-full px-4 py-3"
                      data-testid="input-postal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Mode de Paiement</h2>
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => setForm({...form, payment_method: "card"})}
                  className={`w-full flex items-center p-4 border cursor-pointer transition-all text-left ${form.payment_method === "card" ? "border-gold bg-gold/10" : "border-gold/20"}`}
                  data-testid="payment-card"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">Carte Bancaire / Apple Pay</p>
                    <p className="text-muted-foreground text-sm">Paiement sécurisé via Stripe</p>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setForm({...form, payment_method: "paypal"})}
                  className={`w-full flex items-center p-4 border cursor-pointer transition-all text-left ${form.payment_method === "paypal" ? "border-gold bg-gold/10" : "border-gold/20"}`}
                  data-testid="payment-paypal"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">PayPal</p>
                    <p className="text-muted-foreground text-sm">Instructions envoyées par email</p>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setForm({...form, payment_method: "bank"})}
                  className={`w-full flex items-center p-4 border cursor-pointer transition-all text-left ${form.payment_method === "bank" ? "border-gold bg-gold/10" : "border-gold/20"}`}
                  data-testid="payment-bank"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">Virement Bancaire</p>
                    <p className="text-muted-foreground text-sm">IBAN fourni après confirmation</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="card-luxury p-6">
              <label className="block text-white text-sm font-medium mb-1">Notes (optionnel)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                rows="3"
                className="w-full px-4 py-3"
                placeholder="Instructions spéciales..."
                data-testid="input-notes"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card-luxury p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Votre Commande</h2>
              <div className="space-y-4 mb-4">
                {cart.map((item, index) => {
                  const optionsTotal = (item.selectedOptions || []).reduce((s, opt) => s + opt.price, 0);
                  const itemPrice = item.product.price + optionsTotal;
                  
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={item.product.images?.[0] || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{item.product.name}</p>
                        <p className="text-muted-foreground text-xs">Qté: {item.quantity}</p>
                        {item.size && <p className="text-muted-foreground text-xs">Taille: {item.size}</p>}
                        {item.selectedOptions?.length > 0 && (
                          <div className="text-gold text-xs">
                            {item.selectedOptions.map((opt, i) => (
                              <span key={i}>+ {opt.name} </span>
                            ))}
                          </div>
                        )}
                        {item.flocageText && (
                          <p className="text-gold text-xs">Flocage: {item.flocageText}</p>
                        )}
                      </div>
                      <p className="text-gold font-bold">{(itemPrice * item.quantity).toFixed(2)} €</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gold/20 pt-4 mb-6">
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold">{cartTotal.toFixed(2)} €</span>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
                data-testid="submit-order-btn"
              >
                {loading ? "Traitement..." : "Confirmer la Commande"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/orders/${orderId}`),
      axios.get(`${API}/settings`)
    ]).then(([orderRes, settingsRes]) => {
      setOrder(orderRes.data);
      setSettings(settingsRes.data);
    }).catch(() => {});
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-testid="order-confirmation-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-luxury p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 border-2 border-gold flex items-center justify-center">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-4">Commande Confirmée!</h1>
          <p className="text-muted-foreground mb-6">Merci pour votre commande #{order.id.slice(0, 8)}</p>

          {order.payment_method === "bank" && (
            <div className="card-luxury bg-secondary p-6 text-left mb-6">
              <h2 className="font-serif text-xl font-bold text-gold mb-4">Virement Bancaire</h2>
              <p className="text-white mb-2">Veuillez effectuer un virement de <span className="text-gold font-bold">{order.total.toFixed(2)} €</span></p>
              <p className="text-muted-foreground mb-4">à l'IBAN suivant:</p>
              <p className="text-gold font-mono text-lg break-all">{settings.iban || "FR7616598000014000111984142"}</p>
              <p className="text-muted-foreground mt-4 text-sm">Référence: {order.id.slice(0, 8)}</p>
            </div>
          )}

          {order.payment_method === "paypal" && (
            <div className="card-luxury bg-secondary p-6 text-left mb-6">
              <h2 className="font-serif text-xl font-bold text-gold mb-4">Paiement PayPal</h2>
              <p className="text-white mb-2">Veuillez envoyer <span className="text-gold font-bold">{order.total.toFixed(2)} €</span></p>
              <p className="text-muted-foreground mb-4">Un email avec les instructions vous sera envoyé.</p>
            </div>
          )}

          <Link to="/shop" className="btn-outline inline-block">
            Continuer les Achats
          </Link>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("checking");
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API}/payments/status/${sessionId}`);
        if (res.data.payment_status === "paid") {
          setStatus("success");
          clearCart();
        } else if (res.data.status === "expired") {
          setStatus("failed");
        } else if (attempts < 5) {
          setTimeout(() => setAttempts(a => a + 1), 2000);
        } else {
          setStatus("pending");
        }
      } catch {
        if (attempts < 5) {
          setTimeout(() => setAttempts(a => a + 1), 2000);
        } else {
          setStatus("failed");
        }
      }
    };

    checkStatus();
  }, [sessionId, attempts, clearCart, navigate]);

  return (
    <div className="min-h-screen py-8 flex items-center justify-center" data-testid="order-success-page">
      <div className="max-w-md mx-auto px-4">
        <div className="card-luxury p-8 text-center">
          {status === "checking" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-gold border-t-transparent animate-spin"></div>
              <p className="text-white">Vérification du paiement...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 border-2 border-gold flex items-center justify-center">
                <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl font-bold text-white mb-4">Paiement Réussi!</h1>
              <p className="text-muted-foreground mb-6">Merci pour votre achat. Vous recevrez une confirmation par email.</p>
              <Link to="/shop" className="btn-primary inline-block">
                Continuer les Achats
              </Link>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 border-2 border-red-500 flex items-center justify-center">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-white mb-4">Paiement Échoué</h1>
              <p className="text-muted-foreground mb-6">Le paiement n'a pas abouti. Veuillez réessayer.</p>
              <Link to="/checkout" className="btn-primary inline-block">
                Réessayer
              </Link>
            </>
          )}
          {status === "pending" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 border-2 border-yellow-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl font-bold text-white mb-4">En Attente</h1>
              <p className="text-muted-foreground mb-6">Votre paiement est en cours de traitement.</p>
              <Link to="/shop" className="btn-outline inline-block">
                Retour à la Boutique
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.post(`${API}/visit?page=contact`).catch(() => {});
    axios.get(`${API}/settings`).then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message envoyé avec succès!");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-8" data-testid="contact-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-white mb-8 text-center">
          <span className="text-gold">Contactez</span>-nous
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-luxury p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 border-2 border-gold flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-4">Message Envoyé!</h2>
                <p className="text-muted-foreground mb-6">Nous vous répondrons dans les plus brefs délais.</p>
                <button onClick={() => setSent(false)} className="btn-outline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="contact-email"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Sujet *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="contact-subject"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Message *</label>
                  <textarea
                    required
                    rows="5"
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    className="w-full px-4 py-3"
                    data-testid="contact-message"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary w-full disabled:opacity-50"
                  data-testid="contact-submit"
                >
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="card-luxury p-8">
              <h2 className="font-serif text-2xl font-bold text-white mb-6">Informations</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gold font-medium mb-1">Email</p>
                  <p className="text-white">{settings.contact_email || "Amicheilane2@gmail.com"}</p>
                </div>
                {settings.contact_phone && (
                  <div>
                    <p className="text-gold font-medium mb-1">Téléphone</p>
                    <p className="text-white">{settings.contact_phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-luxury p-8">
              <h2 className="font-serif text-2xl font-bold text-white mb-6">Réseaux Sociaux</h2>
              <div className="space-y-4">
                <a 
                  href={`https://snapchat.com/add/${settings.social_snapchat || "Luxury961x213"}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-white hover:text-gold transition-colors"
                >
                  <span className="w-10 h-10 border border-gold/30 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.327.327 0 01.337.029c.154.12.183.312.09.471-.123.197-.336.383-.555.508-.314.177-.786.3-1.38.3-.345 0-.654-.045-.882-.12-.148-.045-.237-.075-.353-.195-.156-.165-.24-.375-.24-.593 0-.075.015-.15.03-.225l.002-.01c.009-.054.018-.109.025-.164l.003-.024c.09-.63.16-1.62.003-2.4-.51-2.505-2.505-3.375-4.365-3.375-.465 0-1.125.06-1.785.285-1.095.375-1.89 1.125-2.37 2.19-.18.39-.285.795-.36 1.2-.06.315-.075.63-.06.945.12 2.13 1.11 3.6 2.505 4.53.615.405 1.32.69 2.085.87.33.09.675.15 1.02.195.18.015.36.03.54.03.645 0 1.275-.135 1.83-.39.555-.255 1.035-.615 1.38-1.065.39-.51.615-1.125.615-1.785 0-.225-.03-.45-.09-.675z"/></svg>
                  </span>
                  Snapchat: {settings.social_snapchat || "Luxury961x213"}
                </a>
                <a 
                  href={`https://tiktok.com/@${settings.social_tiktok || "LuxuryShop76k"}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-white hover:text-gold transition-colors"
                >
                  <span className="w-10 h-10 border border-gold/30 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </span>
                  TikTok: @{settings.social_tiktok || "LuxuryShop76k"}
                </a>
                <a 
                  href={`https://instagram.com/${settings.social_instagram || "LuxuryShop76k"}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-white hover:text-gold transition-colors"
                >
                  <span className="w-10 h-10 border border-gold/30 flex items-center justify-center mr-3">
                    <Instagram className="w-5 h-5" />
                  </span>
                  Instagram: @{settings.social_instagram || "LuxuryShop76k"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ADMIN PAGES ====================

const AdminLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/admin");
    } catch {
      toast.error("Identifiants incorrects");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8" data-testid="admin-login-page">
      <div className="max-w-md w-full mx-4">
        <div className="card-luxury p-8">
          <h1 className="font-serif text-3xl font-bold text-white text-center mb-8">
            Admin <span className="text-gold">Panel</span>
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-1">Identifiant</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full px-4 py-3"
                data-testid="admin-username"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3"
                data-testid="admin-password"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full disabled:opacity-50"
              data-testid="admin-login-btn"
            >
              {loading ? "Connexion..." : "Se Connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { token, logout, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    axios.get(`${API}/admin/stats`, { headers: authHeaders })
      .then(res => setStats(res.data))
      .catch(() => navigate("/admin/login"));
  }, [token, navigate, authHeaders]);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {/* Admin Header */}
      <header className="bg-card border-b border-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="font-serif text-xl font-bold text-gold">LUXURYSHOP76K Admin</h1>
            <button onClick={logout} className="flex items-center text-muted-foreground hover:text-white transition-colors">
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
            { id: "products", label: "Produits", icon: Package },
            { id: "orders", label: "Commandes", icon: ShoppingCart },
            { id: "messages", label: "Messages", icon: MessageSquare },
            { id: "settings", label: "Paramètres", icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 transition-all ${
                activeTab === tab.id 
                  ? "bg-gold text-black" 
                  : "bg-card border border-gold/20 text-white hover:border-gold"
              }`}
              data-testid={`admin-tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-luxury p-6">
                <p className="text-muted-foreground text-sm">Commandes</p>
                <p className="text-3xl font-bold text-white">{stats.total_orders}</p>
              </div>
              <div className="card-luxury p-6">
                <p className="text-muted-foreground text-sm">Revenus</p>
                <p className="text-3xl font-bold text-gold">{stats.total_revenue.toFixed(2)} €</p>
              </div>
              <div className="card-luxury p-6">
                <p className="text-muted-foreground text-sm">Produits</p>
                <p className="text-3xl font-bold text-white">{stats.total_products}</p>
              </div>
              <div className="card-luxury p-6">
                <p className="text-muted-foreground text-sm">Visites</p>
                <p className="text-3xl font-bold text-white">{stats.total_visits}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card-luxury p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-4">Commandes Récentes</h2>
              <div className="space-y-4">
                {stats.recent_orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-4 bg-secondary/50 border border-gold/10">
                    <div>
                      <p className="text-white font-medium">{order.customer_name}</p>
                      <p className="text-muted-foreground text-sm">{order.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-bold">{order.total.toFixed(2)} €</p>
                      <span className={`text-xs px-2 py-1 ${
                        order.payment_status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {order.payment_status === "paid" ? "Payé" : "En attente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && <AdminProducts authHeaders={authHeaders} />}

        {/* Orders Tab */}
        {activeTab === "orders" && <AdminOrders authHeaders={authHeaders} />}

        {/* Messages Tab */}
        {activeTab === "messages" && <AdminMessages authHeaders={authHeaders} />}

        {/* Settings Tab */}
        {activeTab === "settings" && <AdminSettings authHeaders={authHeaders} />}
      </div>
    </div>
  );
};

const AdminProducts = ({ authHeaders }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: 0, images: [], category_id: "",
    sizes: [], colors: [], brand: "", stock: 0, featured: false, active: true
  });

  const loadData = () => {
    Promise.all([
      axios.get(`${API}/admin/products`, { headers: authHeaders }),
      axios.get(`${API}/categories`)
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [authHeaders]);

  const confirmDelete = async (productId) => {
    try {
      await axios.delete(`${API}/admin/products/${productId}`, { headers: authHeaders });
      toast.success("Produit supprimé !");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await axios.post(`${API}/admin/upload`, formData, {
          headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(`${BACKEND_URL}${res.data.url}`);
      } catch (err) {
        toast.error(`Erreur upload: ${file.name}`);
      }
    }
    
    setForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    toast.success(`${uploadedUrls.length} image(s) uploadée(s)`);
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, form, { headers: authHeaders });
        toast.success("Produit mis à jour");
      } else {
        await axios.post(`${API}/admin/products`, form, { headers: authHeaders });
        toast.success("Produit créé");
      }
      setShowForm(false);
      setEditingProduct(null);
      loadData();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit?")) return;
    try {
      await axios.delete(`${API}/admin/products/${id}`, { headers: authHeaders });
      toast.success("Produit supprimé");
      loadData();
    } catch {
      toast.error("Erreur");
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images || [],
      category_id: product.category_id,
      sizes: product.sizes || [],
      colors: product.colors || [],
      brand: product.brand || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      active: product.active !== false
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-8"><div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-luxury p-6 max-w-md w-full">
            <h3 className="font-serif text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
            <p className="text-muted-foreground mb-6">
              Voulez-vous vraiment supprimer <span className="text-gold">"{deleteConfirm.name}"</span> ?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => confirmDelete(deleteConfirm.id)}
                className="flex-1 bg-red-500 text-white py-3 font-bold hover:bg-red-600 transition-colors"
              >
                OUI, SUPPRIMER
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-outline py-3"
              >
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-white">Produits ({products.length})</h2>
        <button 
          onClick={() => { setEditingProduct(null); setForm({ name: "", slug: "", description: "", price: 0, images: [], category_id: categories[0]?.id || "", sizes: [], colors: [], brand: "", stock: 0, featured: false, active: true }); setShowForm(true); }}
          className="btn-primary"
          data-testid="add-product-btn"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="card-luxury p-6">
          <h3 className="font-serif text-xl font-bold text-white mb-4">{editingProduct ? "Modifier" : "Nouveau"} Produit</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Nom *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Slug *</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="w-full px-3 py-2" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Prix (€) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} required className="w-full px-3 py-2" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Catégorie *</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required className="w-full px-3 py-2">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-white text-sm mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows="3" className="w-full px-3 py-2" />
            </div>
            
            {/* Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-white text-sm mb-2">Images du produit</label>
              
              {/* Upload Button */}
              <div className="flex items-center gap-4 mb-4">
                <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="image-upload-input"
                  />
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gold border-t-transparent animate-spin"></div>
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Importer des images
                    </>
                  )}
                </label>
                <span className="text-muted-foreground text-sm">JPG, PNG, WebP (max 5MB)</span>
              </div>
              
              {/* Image Preview Grid */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {form.images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover border border-gold/20" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-gold text-black text-xs px-1">Principal</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* URL Input as fallback */}
              <details className="mt-3">
                <summary className="text-muted-foreground text-sm cursor-pointer hover:text-gold">Ou ajouter via URL</summary>
                <textarea 
                  value={form.images.join("\n")} 
                  onChange={e => setForm({...form, images: e.target.value.split("\n").filter(Boolean)})} 
                  rows="2" 
                  placeholder="Une URL par ligne"
                  className="w-full px-3 py-2 mt-2 text-sm" 
                />
              </details>
            </div>
            
            <div>
              <label className="block text-white text-sm mb-1">Tailles (séparées par virgule)</label>
              <input value={form.sizes.join(", ")} onChange={e => setForm({...form, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} className="w-full px-3 py-2" placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Couleurs (séparées par virgule)</label>
              <input value={form.colors.join(", ")} onChange={e => setForm({...form, colors: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} className="w-full px-3 py-2" placeholder="Noir, Blanc, Rouge" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Marque</label>
              <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full px-3 py-2" placeholder="Nike, Adidas..." />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} className="w-full px-3 py-2" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center text-white">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="mr-2" />
                Vedette
              </label>
              <label className="flex items-center text-white">
                <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="mr-2" />
                Actif
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Sauvegarder</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="card-luxury p-4">
            <div className="aspect-video overflow-hidden mb-3">
              <img src={product.images?.[0] || "https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white truncate">{product.name}</h3>
            <p className="text-gold font-bold">{product.price.toFixed(2)} €</p>
            <p className="text-muted-foreground text-sm">Stock: {product.stock}</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => openEdit(product)} 
                className="btn-outline text-sm py-2 px-4"
              >
                Modifier
              </button>
              <button 
                onClick={() => setDeleteConfirm(product)}
                className="bg-red-500 text-white px-4 py-2 text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminOrders = ({ authHeaders }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    axios.get(`${API}/admin/orders`, { headers: authHeaders })
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [authHeaders]);

  const updateStatus = async (orderId, field, value) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}`, { [field]: value }, { headers: authHeaders });
      toast.success("Statut mis à jour");
      loadOrders();
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) return <div className="text-center py-8"><div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-white">Commandes ({orders.length})</h2>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card-luxury p-6">
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div>
                <p className="text-gold font-medium">#{order.id.slice(0, 8)}</p>
                <p className="text-white font-bold">{order.customer_name}</p>
                <p className="text-muted-foreground text-sm">{order.customer_email}</p>
                <p className="text-muted-foreground text-sm">{order.customer_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-gold text-2xl font-bold">{order.total.toFixed(2)} €</p>
                <p className="text-muted-foreground text-sm">{order.payment_method}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-muted-foreground text-sm mb-1">Adresse de livraison:</p>
              <p className="text-white">{order.shipping_address}, {order.shipping_postal} {order.shipping_city}</p>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground text-sm mb-2">Articles:</p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white">{item.quantity}x {item.product_name} {item.size && `(${item.size})`}</span>
                    <span className="text-gold">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-muted-foreground text-xs mb-1">Statut Paiement</label>
                <select 
                  value={order.payment_status} 
                  onChange={e => updateStatus(order.id, "payment_status", e.target.value)}
                  className="px-3 py-1 text-sm"
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="failed">Échoué</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground text-xs mb-1">Statut Commande</label>
                <select 
                  value={order.order_status} 
                  onChange={e => updateStatus(order.id, "order_status", e.target.value)}
                  className="px-3 py-1 text-sm"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminMessages = ({ authHeaders }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/contacts`, { headers: authHeaders })
      .then(res => { setMessages(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authHeaders]);

  const markRead = async (id) => {
    await axios.put(`${API}/admin/contacts/${id}/read`, {}, { headers: authHeaders });
    setMessages(prev => prev.map(m => m.id === id ? {...m, read: true} : m));
  };

  if (loading) return <div className="text-center py-8"><div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-white">Messages ({messages.length})</h2>
      
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`card-luxury p-6 ${!msg.read ? "border-gold/50" : ""}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white font-bold">{msg.name}</p>
                <p className="text-muted-foreground text-sm">{msg.email}</p>
              </div>
              {!msg.read && (
                <button onClick={() => markRead(msg.id)} className="text-gold text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-1" /> Marquer lu
                </button>
              )}
            </div>
            <p className="text-gold font-medium mb-2">{msg.subject}</p>
            <p className="text-white whitespace-pre-wrap">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminSettings = ({ authHeaders }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/settings`, { headers: authHeaders })
      .then(res => { setSettings(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authHeaders]);

  const handleSave = async () => {
    try {
      await axios.put(`${API}/admin/settings`, settings, { headers: authHeaders });
      toast.success("Paramètres sauvegardés");
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading || !settings) return <div className="text-center py-8"><div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-white">Paramètres du Site</h2>
      
      <div className="card-luxury p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Nom du Site</label>
            <input value={settings.site_name || ""} onChange={e => setSettings({...settings, site_name: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Slogan</label>
            <input value={settings.tagline || ""} onChange={e => setSettings({...settings, tagline: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white text-sm mb-1">Image Hero (URL)</label>
            <input value={settings.hero_image || ""} onChange={e => setSettings({...settings, hero_image: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Email Contact</label>
            <input value={settings.contact_email || ""} onChange={e => setSettings({...settings, contact_email: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Téléphone</label>
            <input value={settings.contact_phone || ""} onChange={e => setSettings({...settings, contact_phone: e.target.value})} className="w-full px-3 py-2" />
          </div>
        </div>
        
        <h3 className="font-serif text-lg font-bold text-gold pt-4">Réseaux Sociaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Snapchat</label>
            <input value={settings.social_snapchat || ""} onChange={e => setSettings({...settings, social_snapchat: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">TikTok</label>
            <input value={settings.social_tiktok || ""} onChange={e => setSettings({...settings, social_tiktok: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Instagram</label>
            <input value={settings.social_instagram || ""} onChange={e => setSettings({...settings, social_instagram: e.target.value})} className="w-full px-3 py-2" />
          </div>
        </div>

        <h3 className="font-serif text-lg font-bold text-gold pt-4">Paiement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-1">IBAN</label>
            <input value={settings.iban || ""} onChange={e => setSettings({...settings, iban: e.target.value})} className="w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Email PayPal</label>
            <input value={settings.paypal_email || ""} onChange={e => setSettings({...settings, paypal_email: e.target.value})} className="w-full px-3 py-2" />
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary mt-4">Sauvegarder</button>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Toaster position="top-right" richColors />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
              <Route path="/shop" element={<><Navbar /><ShopPage /><Footer /></>} />
              <Route path="/product/:productId" element={<><Navbar /><ProductPage /><Footer /></>} />
              <Route path="/cart" element={<><Navbar /><CartPage /><Footer /></>} />
              <Route path="/checkout" element={<><Navbar /><CheckoutPage /><Footer /></>} />
              <Route path="/order-confirmation/:orderId" element={<><Navbar /><OrderConfirmationPage /><Footer /></>} />
              <Route path="/order-success" element={<><Navbar /><OrderSuccessPage /><Footer /></>} />
              <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
