import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

const DEFAULT_MENU = [
  { id: 'c1', name: 'Café de Especialidad', description: 'Origen Colombia, notas a chocolate y nuez', price: 2500, category: 'cafeteria', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80', isActive: true },
  { id: 'c2', name: 'Latte Patagonia', description: 'Espresso con leche texturizada y syrup de lavanda', price: 3200, category: 'cafeteria', image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80', isActive: true },
  { id: 'c3', name: 'Chocolate Caliente Submarino', description: 'Leche hirviendo con barra de chocolate amargo 70%', price: 3500, category: 'cafeteria', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80', isActive: true },
  { id: 'h1', name: 'Helado Artesanal', description: 'Sabores a elección: Calafate, Dulce de Leche, Chocolate', price: 2000, category: 'heladeria', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&q=80', isActive: true },
  { id: 'p1', name: 'Torta Galesa', description: 'Porción de receta tradicional del sur con frutos secos', price: 4000, category: 'pasteleria', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80', isActive: true },
];

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('patagonia_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('patagonia_menu');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });

  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem('patagonia_active_order_id') || null;
  });

  const activeOrderIdRef = React.useRef(activeOrderId);
  activeOrderIdRef.current = activeOrderId;

  const [cart, setCart] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch helpers
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setHasFetched(true);
        const currentActiveId = activeOrderIdRef.current;
        setOrders(prevOrders => {
          const activeLocalOrder = prevOrders.find(o => o.id === currentActiveId);
          
          // 1. Mapeamos las órdenes del servidor y combinamos con la local si coincide
          let merged = data.map(serverOrder => {
            if (activeLocalOrder && serverOrder.id === currentActiveId) {
              return {
                ...serverOrder,
                // Preservar billRequested si se activó localmente
                billRequested: serverOrder.billRequested || activeLocalOrder.billRequested
              };
            }
            return serverOrder;
          });

          // 2. Si la orden activa local no está en el listado del servidor, la agregamos al principio
          if (activeLocalOrder && !data.some(o => o.id === currentActiveId)) {
            merged = [activeLocalOrder, ...merged];
          }

          return merged;
        });
      }
    } catch (e) {
      // Quiet fail to fall back to localStorage
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (e) {
      // Quiet fail to fall back to localStorage
    }
  };

  // Sync with API and poll
  useEffect(() => {
    fetchOrders();
    fetchMenu();

    const interval = setInterval(() => {
      fetchOrders();
      fetchMenu();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('patagonia_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('patagonia_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('patagonia_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('patagonia_active_order_id');
    }
  }, [activeOrderId]);

  // Limpiar ID de pedido activo si se ha sincronizado con el servidor y ya no existe (p. ej. base de datos limpia)
  useEffect(() => {
    if (hasFetched && activeOrderId) {
      const exists = orders.some(o => o.id === activeOrderId);
      if (!exists) {
        setActiveOrderId(null);
      }
    }
  }, [hasFetched, orders, activeOrderId]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const submitOrder = async (customerName) => {
    const newId = Date.now().toString();
    const newOrder = {
      id: newId,
      customerName,
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'para_despachar', // estados: para_despachar, visto_en_despacho, despachado, finalizado
      billRequested: false,
      createdAt: new Date().toISOString()
    };
    
    // 1. Enviar primero la comanda a la API del servidor y esperar su respuesta
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.status}`);
      }
    } catch (e) {
      console.error('Error al enviar el pedido a la API:', e);
      // Continuamos con el flujo local como fallback para que no quede bloqueado en caso de corte de red temporal
    }

    // 2. Una vez completado el fetch, actualizamos el estado local del cliente
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newId);
    clearCart();

    return newId;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('Failed to update status on API', e);
    }
  };

  const requestBill = async (orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, billRequested: true } : order
    ));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billRequested: true })
      });
    } catch (e) {
      console.warn('Failed to request bill on API', e);
    }
  };

  const clearActiveOrder = () => {
    setActiveOrderId(null);
  };

  // CRUD Menu Items
  const addMenuItem = async (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      price: Number(item.price),
      isActive: true
    };
    setMenuItems(prev => [...prev, newItem]);

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (e) {
      console.warn('Failed to add menu item on API', e);
    }
  };

  const updateMenuItem = async (updatedItem) => {
    setMenuItems(prev => prev.map(item => 
      item.id === updatedItem.id ? { ...updatedItem, price: Number(updatedItem.price) } : item
    ));

    try {
      await fetch(`/api/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
    } catch (e) {
      console.warn('Failed to update menu item on API', e);
    }
  };

  const toggleMenuItemActive = async (itemId) => {
    let isNowActive = true;
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        isNowActive = !item.isActive;
        return { ...item, isActive: isNowActive };
      }
      return item;
    }));

    try {
      await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: isNowActive })
      });
    } catch (e) {
      console.warn('Failed to toggle menu item status on API', e);
    }
  };

  const deleteMenuItem = async (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    setCart(prev => prev.filter(item => item.id !== itemId));

    try {
      await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Failed to delete menu item on API', e);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      menuItems,
      activeOrderId,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      submitOrder,
      updateOrderStatus,
      requestBill,
      clearActiveOrder,
      addMenuItem,
      updateMenuItem,
      toggleMenuItemActive,
      deleteMenuItem
    }}>
      {children}
    </OrderContext.Provider>
  );
};
