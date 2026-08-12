import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  pack: string;
  store: string;
  deliveryTime: string;
  price: number;
  originalPrice: number;
  discount: string;
  quantity: number;
  icon: string;
  selected: boolean;
  bestSeller?: boolean;
}

interface StoreState {
  cartCount: number;
  city: string;
  location: string;
  isLocationModalOpen: boolean;
  availableCities: string[];
  cartItems: CartItem[];
  isCartBouncing: boolean;
  toastMessage: string | null;
  isDarkMode: boolean;

  setCity: (city: string) => void;
  setLocation: (loc: string) => void;
  setIsLocationModalOpen: (open: boolean) => void;
  
  // Cart Actions
  incrementCart: (itemName?: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  removeSelected: () => void;
  clearToast: () => void;
  
  // Wishlist Actions
  wishlistItems: string[];
  toggleWishlist: (productName: string) => void;

  // Dark Mode Actions
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  cartCount: 4,
  city: "New Delhi",
  location: "Connaught Place, New Delhi 110001",
  isLocationModalOpen: false,
  availableCities: ["New Delhi", "Mumbai", "Bengaluru", "Kolkata", "Pune", "Hyderabad", "Jaipur", "Ahmedabad"],
  isCartBouncing: false,
  toastMessage: null,
  isDarkMode: false,

  cartItems: [
    {
      id: "1",
      name: "Aashirvaad Whole Wheat Atta",
      pack: "5 kg",
      store: "Gupta Kirana Store",
      deliveryTime: "Delivery in 20-30 min",
      price: 265,
      originalPrice: 300,
      discount: "12% OFF",
      quantity: 1,
      icon: "🌾",
      selected: true,
      bestSeller: true,
    },
    {
      id: "2",
      name: "Fortune Sunlite Refined Oil",
      pack: "1 L",
      store: "Fresh Mart",
      deliveryTime: "Delivery in 20-30 min",
      price: 145,
      originalPrice: 153,
      discount: "5% OFF",
      quantity: 1,
      icon: "🌻",
      selected: true,
    },
    {
      id: "3",
      name: "Mother Dairy Toned Milk",
      pack: "1 L",
      store: "Apollo Pharmacy",
      deliveryTime: "Delivery in 15-25 min",
      price: 54,
      originalPrice: 59,
      discount: "8% OFF",
      quantity: 2,
      icon: "🥛",
      selected: true,
    },
    {
      id: "4",
      name: "Colgate MaxFresh Toothpaste",
      pack: "150 g",
      store: "City Supermarket",
      deliveryTime: "Delivery in 25-35 min",
      price: 99,
      originalPrice: 110,
      discount: "10% OFF",
      quantity: 1,
      icon: "🪥",
      selected: true,
    },
  ],

  setCity: (city) => set({ city }),
  setLocation: (location) => set({ location }),
  setIsLocationModalOpen: (isLocationModalOpen) => set({ isLocationModalOpen }),

  incrementCart: (itemName = "Item") => {
    const currentCount = get().cartCount;
    set({
      cartCount: currentCount + 1,
      isCartBouncing: true,
      toastMessage: `Added "${itemName}" to cart! 🛍️`,
    });

    setTimeout(() => {
      set({ isCartBouncing: false });
    }, 800);
  },

  updateQuantity: (id, delta) => {
    const items = get().cartItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
    set({ cartItems: items, cartCount: totalCount });
  },

  removeItem: (id) => {
    const items = get().cartItems.filter((i) => i.id !== id);
    const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
    set({ cartItems: items, cartCount: totalCount });
  },

  toggleSelect: (id) => {
    const items = get().cartItems.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    set({ cartItems: items });
  },

  toggleSelectAll: (selected) => {
    const items = get().cartItems.map((item) => ({ ...item, selected }));
    set({ cartItems: items });
  },

  removeSelected: () => {
    const items = get().cartItems.filter((i) => !i.selected);
    const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
    set({ cartItems: items, cartCount: totalCount });
  },

  clearToast: () => set({ toastMessage: null }),

  wishlistItems: ["Aashirvaad Whole Wheat Atta", "Mother Dairy Toned Milk", "Red Label Black Tea"],
  toggleWishlist: (productName) => {
    const current = get().wishlistItems;
    if (current.includes(productName)) {
      set({ 
        wishlistItems: current.filter(item => item !== productName),
        toastMessage: `Removed "${productName}" from wishlist.` 
      });
    } else {
      set({ 
        wishlistItems: [...current, productName],
        toastMessage: `Added "${productName}" to wishlist! ❤️`
      });
    }
    
    // clear toast after a while
    setTimeout(() => {
      set({ toastMessage: null });
    }, 2000);
  },

  toggleDarkMode: () => {
    const isDark = !get().isDarkMode;
    set({ isDarkMode: isDark });
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  },

  setDarkMode: (isDark) => {
    set({ isDarkMode: isDark });
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
}));
