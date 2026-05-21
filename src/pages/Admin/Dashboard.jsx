import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Clock, ChefHat, CheckSquare, CheckCircle, Plus, Edit2, Trash2, Eye, EyeOff, Receipt, DollarSign, Lock, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { 
    orders, 
    updateOrderStatus, 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    toggleMenuItemActive, 
    deleteMenuItem 
  } = useOrders();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('patagonia_admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'patagonia2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('patagonia_admin_authenticated', 'true');
      setLoginError('');
      window.dispatchEvent(new Event('admin-auth-change'));
    } else {
      setLoginError('Usuario o clave incorrectos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('patagonia_admin_authenticated');
    window.dispatchEvent(new Event('admin-auth-change'));
  };

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu' o 'history'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'cafeteria',
    image: ''
  });

  const getOrdersByStatus = (status) => orders.filter(order => order.status === status);

  const columns = [
    { 
      id: 'para_despachar', 
      title: 'Para Despachar', 
      icon: <Clock size={20} style={{ color: '#f97316' }} />,
      nextStatus: 'visto_en_despacho',
      btnText: 'Preparar'
    },
    { 
      id: 'visto_en_despacho', 
      title: 'Visto en Despacho', 
      icon: <ChefHat size={20} style={{ color: '#3b82f6' }} />,
      nextStatus: 'despachado',
      btnText: 'Despachar'
    },
    { 
      id: 'despachado', 
      title: 'Despachado', 
      icon: <CheckSquare size={20} style={{ color: '#22c55e' }} />,
      nextStatus: null,
      btnText: ''
    }
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: 'cafeteria', image: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingProduct(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Por favor, ingresa un nombre y un precio válidos.');
      return;
    }

    let finalImage = formData.image.trim();
    if (!finalImage) {
      // Defaults de Unsplash si no se define imagen
      if (formData.category === 'cafeteria') {
        finalImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80';
      } else if (formData.category === 'heladeria') {
        finalImage = 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80';
      } else {
        finalImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80';
      }
    }

    if (editingProduct) {
      updateMenuItem({
        ...editingProduct,
        ...formData,
        price: Number(formData.price),
        image: finalImage
      });
    } else {
      addMenuItem({
        ...formData,
        price: Number(formData.price),
        image: finalImage
      });
    }

    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: 'cafeteria', image: '' });
  };

  const handleDelete = (itemId, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${name}"?`)) {
      deleteMenuItem(itemId);
    }
  };

  const activeOrdersCount = getOrdersByStatus('para_despachar').length + 
                           getOrdersByStatus('visto_en_despacho').length + 
                           getOrdersByStatus('despachado').length;

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        padding: '2rem 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          border: '1px solid #e5e0d8',
          padding: '3rem 2rem',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 16px rgba(44, 62, 45, 0.15)'
          }}>
            <Lock size={28} />
          </div>

          <h2 style={{
            fontSize: '1.6rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-primary)',
            margin: '0 0 0.5rem 0'
          }}>
            Acceso de Caja
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.85rem',
            margin: '0 0 2rem 0'
          }}>
            Ingresa tus credenciales para administrar comandas y carta.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loginError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textAlign: 'left'
              }}>
                {loginError}
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '0.375rem'
              }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '0.375rem'
              }}>
                Clave de Seguridad
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
                boxShadow: '0 4px 10px rgba(44, 62, 45, 0.15)'
              }}
            >
              Iniciar Sesión 🔓
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Usuario: <strong>admin</strong> | Clave: <strong>patagonia2026</strong>
          </div>
        </div>
      </div>
    );
  }

  const finalizedOrders = orders.filter(o => o.status === 'finalizado');
  const totalRevenue = finalizedOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* CSS interno temporal para animar el pulso de la cuenta solicitada */}
      <style>{`
        @keyframes borderPulse {
          0% { border-color: #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          50% { border-color: #d97706; box-shadow: 0 0 12px rgba(217, 119, 6, 0.4); }
          100% { border-color: #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        }
        @keyframes textPulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .order-card-pulse {
          animation: borderPulse 2s infinite ease-in-out;
        }
        .badge-pulse {
          animation: textPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header Premium */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: 0 }}>Caja y Despacho</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Panel de administración de la cafetería</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            fontSize: '0.875rem', 
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            padding: '0.375rem 1rem', 
            borderRadius: '9999px',
            fontWeight: '500'
          }}>
            {orders.length} pedidos registrados
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '0.375rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem', 
        borderBottom: '2px solid #e5e7eb', 
        paddingBottom: '0.25rem',
        overflowX: 'auto'
      }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--color-primary)' : '#6b7280',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          Comandas ({activeOrdersCount} activas)
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'menu' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'menu' ? 'var(--color-primary)' : '#6b7280',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          Gestionar Carta ({menuItems.length} productos)
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--color-primary)' : '#6b7280',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          Historial de Caja ({finalizedOrders.length} cobros)
        </button>
      </div>

      {/* Contenido de la pestaña de COMANDAS */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem' }}>
          {columns.map(column => {
            const colOrders = getOrdersByStatus(column.id);
            return (
              <div 
                key={column.id} 
                style={{ 
                  flex: '1 1 300px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '16px', 
                  padding: '1.25rem', 
                  minHeight: '600px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  {column.icon}
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{column.title}</h2>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#e5e7eb', color: '#4b5563', fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontWeight: '600' }}>
                    {colOrders.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {colOrders.map(order => (
                    <div 
                      key={order.id} 
                      className={order.billRequested ? "order-card-pulse" : ""}
                      style={{ 
                        backgroundColor: order.billRequested ? '#fffdf5' : 'white', 
                        borderRadius: '12px', 
                        padding: '1.25rem', 
                        border: order.billRequested ? '2px solid #d97706' : '1px solid #e5e7eb', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s'
                      }}
                    >
                      {/* Badge parpadeante de cuenta solicitada */}
                      {order.billRequested && (
                        <div 
                          className="badge-pulse"
                          style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#d97706',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Receipt size={12} /> CUENTA SOLICITADA
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>{order.customerName}</h3>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>#{order.id.slice(-4)}</span>
                      </div>
                      
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx} style={{ padding: '0.375rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid #f3f4f6' }}>
                            <span>
                              <span style={{ fontWeight: 'bold', color: 'var(--color-accent)', marginRight: '0.5rem' }}>{item.quantity}x</span> 
                              {item.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>${order.total}</span>
                        
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {order.billRequested && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Registrar cobro del pedido de ${order.customerName} por $${order.total}?`)) {
                                  updateOrderStatus(order.id, 'finalizado');
                                }
                              }}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                            >
                              Cobrar 💵
                            </button>
                          )}
                          
                          {column.nextStatus && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, column.nextStatus)}
                              style={{ 
                                padding: '0.375rem 0.75rem', 
                                backgroundColor: 'var(--color-primary)', 
                                color: 'white', 
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                            >
                              {column.btnText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {colOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af', fontSize: '0.875rem' }}>
                      No hay pedidos en cola
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contenido de la pestaña de GESTIÓN DE PRODUCTOS */}
      {activeTab === 'menu' && (
        <div>
          {/* Subheader con botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: 0 }}>Carta del Establecimiento</h2>
            <button 
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0.625rem 1.25rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              <Plus size={18} /> Cargar Producto
            </button>
          </div>

          {/* Grilla de productos */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {menuItems.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '14px', 
                  border: '1px solid #e5e7eb', 
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  opacity: item.isActive ? 1 : 0.65,
                  transition: 'opacity 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #f3f4f6' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        backgroundColor: '#f3f4f6', 
                        color: '#4b5563', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '6px',
                        textTransform: 'capitalize',
                        fontWeight: '500'
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                        ${item.price}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0.375rem 0 0.125rem 0', color: '#111827' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Acciones en la tarjeta */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid #f3f4f6', 
                  paddingTop: '0.75rem',
                  marginTop: 'auto'
                }}>
                  {/* Botón de Alta / Baja */}
                  <button
                    onClick={() => toggleMenuItemActive(item.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: item.isActive ? '#e2f0d9' : '#fee2e2',
                      color: item.isActive ? '#385723' : '#991b1b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.isActive ? (
                      <>
                        <Eye size={14} /> Visible (Alta)
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} /> Oculto (Baja)
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb',
                        color: '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.color = '#4b5563';
                      }}
                      title="Modificar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #fee2e2',
                        borderRadius: '8px',
                        backgroundColor: '#fff5f5',
                        color: '#dc2626',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                      }}
                      title="Eliminar permanentemente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {menuItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '16px', backgroundColor: '#f9fafb' }}>
              No hay productos registrados en la carta.
            </div>
          )}
        </div>
      )}

      {/* Contenido de la pestaña de HISTORIAL DE VENTAS */}
      {activeTab === 'history' && (
        <div>
          {/* Tarjeta de Resumen */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#e2f0d9', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            marginBottom: '2rem', 
            border: '1px solid #c8e2b8', 
            color: '#2c5e1b' 
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#274e13', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={20} /> Recaudación de Caja
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#385723' }}>Ingresos totales por comandas abonadas</p>
            </div>
            <span style={{ fontSize: '2.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
              ${totalRevenue}
            </span>
          </div>

          {/* Listado de cobros completados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {finalizedOrders.map(order => (
              <div 
                key={order.id} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '14px', 
                  padding: '1.25rem', 
                  border: '1px solid #e5e7eb', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>{order.customerName}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>#{order.id.slice(-4)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                    Cobrado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {order.items.map((item, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '0.75rem', 
                          backgroundColor: '#f3f4f6', 
                          color: '#4b5563', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}
                      >
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>${order.total}</span>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                    <CheckCircle size={12} /> COBRADO
                  </div>
                </div>
              </div>
            ))}

            {finalizedOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '16px', backgroundColor: '#f9fafb' }}>
                Aún no hay cobros registrados en el historial de hoy.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FORM (Añadir / Editar) */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative',
            maxHeight: '90dvh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '1.35rem', 
              fontFamily: 'var(--font-serif)', 
              color: 'var(--color-primary)', 
              marginBottom: '1.5rem',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '0.5rem'
            }}>
              {editingProduct ? 'Modificar Producto' : 'Cargar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.375rem' }}>
                  Nombre del Producto *
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Medialuna con Dulce de Leche"
                  required
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.375rem' }}>
                    Precio ($) *
                  </label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2500"
                    min="0"
                    required
                    className="input"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.375rem' }}>
                    Categoría *
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    style={{ height: '100%', cursor: 'pointer' }}
                  >
                    <option value="cafeteria">Cafetería</option>
                    <option value="heladeria">Heladería</option>
                    <option value="pasteleria">Pastelería</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.375rem' }}>
                  Descripción
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre el producto, ingredientes o porción..."
                  className="input"
                  rows="3"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.375rem' }}>
                  URL de Imagen (Opcional)
                </label>
                <input 
                  type="url" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="input"
                />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  Si se deja en blanco, se asignará una foto por defecto según la categoría.
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '0.75rem', 
                borderTop: '1px solid #f3f4f6', 
                paddingTop: '1.25rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {editingProduct ? 'Modificar' : 'Cargar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
