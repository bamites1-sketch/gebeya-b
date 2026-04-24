import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch {}
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const toggle = async (productId) => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      toast.success(data.message);
      fetchWishlist();
      return data.added;
    } catch {}
  };

  const isInWishlist = (productId) =>
    wishlist?.items?.some((i) => i.productId === productId) || false;

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
