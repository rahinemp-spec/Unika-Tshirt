
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, MessageSquare, Settings, 
  LogOut, Plus, Edit2, Trash2, Save, X, Truck, BarChart3, TrendingUp, Users,
  Upload, Link as LinkIcon, CheckCircle2, Clock, Loader2, Send, AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import Logo from './Logo';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6t7ea5QCdTITMFucAq-baDdBVUgUxJe-vJRvcQLtjKySHF_S8qUvuGpD0zfNKlG9l/exec';

interface AdminPanelProps {
  onLogout: () => void;
  onInventoryUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onInventoryUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'chat' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState(['Pathao', 'Steadfast', 'Paperfly', 'RedX']);
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState({ revenue: "৳0", totalOrders: 0, customers: 0, growth: "0%" });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData`);
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        if (data.products && Array.isArray(data.products)) {
          const mappedProducts: Product[] = data.products.map((p: any) => ({
            id: String(p.id),
            name: p.name || '',
            price: Number(p.price) || 0,
            description: p.description || '',
            image: p.image || '',
            category: (p.category as any) || 'Modern'
          }));

          setProducts(prev => {
            const combined = [...INITIAL_PRODUCTS];
            mappedProducts.forEach(cloudProd => {
              const existingIndex = combined.findIndex(p => p.id === cloudProd.id);
              if (existingIndex !== -1) {
                combined[existingIndex] = cloudProd;
              } else {
                combined.push(cloudProd);
              }
            });
            return combined;
          });
        }
        
        if (data.orders) setOrders(data.orders);
        if (data.chats) setChats(data.chats);
        if (data.stats) setStats(data.stats);
        if (data.couriers) setDeliveryCompanies(data.couriers);
      } else {
        const text = await response.text();
        console.warn("Received non-JSON response:", text);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      setErrorMsg("Connection error. Could not sync with cloud storage.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isEditingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIsEditingProduct({ ...isEditingProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProduct) return;
    setIsLoading(true);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ adminAction: 'saveProduct', product: isEditingProduct })
      });
      
      setProducts(prev => {
        const exists = prev.find(p => p.id === isEditingProduct.id);
        if (exists) return prev.map(p => p.id === isEditingProduct.id ? isEditingProduct : p);
        return [...prev, isEditingProduct];
      });
      
      setIsEditingProduct(null);
      onInventoryUpdate();
      setTimeout(fetchData, 1000);
    } catch (err) {
      alert("Save failed. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, courier: string) => {
    setIsLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ adminAction: 'updateOrder', orderId, status, courier })
      });
      setOrders(prev => prev.map(o => o.orderid === orderId ? { ...o, status, courier } : o));
    } catch (err) {
      alert("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedChatId || !adminReply.trim()) return;
    setIsLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ chatAction: 'saveMessage', sender: 'Admin', message: adminReply, customerId: selectedChatId })
      });
      setChats(prev => [...prev, { time: new Date().toISOString(), sender: 'Admin', message: adminReply, customeruid: selectedChatId }]);
      setAdminReply('');
    } catch (err) {
      alert("Message failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center space-x-3 text-amber-700 text-sm">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: stats.revenue, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Customers', value: stats.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Growth', value: stats.growth, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">Sales Activity</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-grow group relative">
                <div style={{ height: `${h}%` }} className="bg-black rounded-t-xl transition-all group-hover:bg-gray-700 cursor-help"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">Recent Orders</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-12">No recent orders yet.</p>
            ) : (
              orders.slice(0, 5).map((order, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold">{order.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{order.orderid} • {order.courier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">৳{order.total}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black">Manage Catalog</h3>
        <button 
          onClick={() => setIsEditingProduct({ id: `p-${Date.now()}`, name: '', price: 0, description: '', image: '', category: 'Modern' })}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group">
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
              <img src={product.image || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" alt={product.name} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button onClick={() => setIsEditingProduct(product)} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"><Edit2 size={20} /></button>
                <button className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={20} /></button>
              </div>
            </div>
            <h4 className="font-bold text-lg">{product.name}</h4>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-sm">{product.category}</span>
              <span className="font-black">৳{product.price}</span>
            </div>
          </div>
        ))}
      </div>

      {isEditingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h4 className="text-2xl font-black">Product Details</h4>
              <button onClick={() => setIsEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Product Name</label>
                    <input 
                      required
                      value={isEditingProduct.name}
                      onChange={e => setIsEditingProduct({...isEditingProduct, name: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Price (৳)</label>
                    <input 
                      required
                      type="number"
                      value={isEditingProduct.price}
                      onChange={e => setIsEditingProduct({...isEditingProduct, price: Number(e.target.value)})}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Category</label>
                    <select 
                      value={isEditingProduct.category}
                      onChange={e => setIsEditingProduct({...isEditingProduct, category: e.target.value as any})}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    >
                      <option>Modern</option>
                      <option>Vintage</option>
                      <option>Abstract</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
                    {isEditingProduct.image ? (
                      <>
                        <img src={isEditingProduct.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button type="button" onClick={() => setIsEditingProduct({...isEditingProduct, image: ''})} className="text-white bg-red-50 p-2 rounded-full"><Trash2 size={16} /></button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400 font-bold">Upload File or Paste Link below</p>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      placeholder="Image URL..."
                      value={isEditingProduct.image.startsWith('data:') ? '' : isEditingProduct.image}
                      onChange={e => setIsEditingProduct({...isEditingProduct, image: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
              <textarea 
                placeholder="Description"
                value={isEditingProduct.description}
                onChange={e => setIsEditingProduct({...isEditingProduct, description: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-xl h-24 outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <button disabled={isLoading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                <span>Save Product</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Items</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Provider</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
               <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic">No orders found in database.</td></tr>
            ) : (
              orders.map((order, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-sm">{order.orderid}</td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm">{order.name}</p>
                    <p className="text-[10px] text-gray-400">{order.phone}</p>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 truncate max-w-[200px]">{order.items}</td>
                  <td className="px-8 py-6">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderid, e.target.value, order.courier)}
                      className="text-[10px] font-bold bg-white border border-gray-100 p-2 rounded-lg outline-none"
                    >
                      <option>Order Placed</option>
                      <option>Processing</option>
                      <option>In Transit</option>
                      <option>Delivered</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={order.courier}
                      onChange={(e) => updateOrderStatus(order.orderid, order.status, e.target.value)}
                      className="text-[10px] font-bold bg-white border border-gray-100 p-2 rounded-lg outline-none"
                    >
                      <option value="None">Assign Courier</option>
                      {deliveryCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-6 font-black text-sm">৳{order.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChat = () => {
    const groupedChats = chats.reduce((acc: any, chat: any) => {
      const id = chat.customeruid || 'anonymous';
      if (!acc[id]) acc[id] = [];
      acc[id].push(chat);
      return acc;
    }, {});

    const activeChat = selectedChatId ? groupedChats[selectedChatId] : null;

    return (
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden h-[70vh] flex">
        <div className="w-1/3 border-r border-gray-50 flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h4 className="font-black text-lg">Inquiries</h4>
          </div>
          <div className="flex-grow overflow-y-auto">
            {Object.keys(groupedChats).length === 0 ? (
               <p className="p-8 text-center text-xs text-gray-400">No messages yet.</p>
            ) : (
              Object.keys(groupedChats).map((id) => {
                const lastMsg = groupedChats[id][groupedChats[id].length - 1];
                return (
                  <div 
                    key={id} 
                    onClick={() => setSelectedChatId(id)}
                    className={`p-6 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-center space-x-4 ${selectedChatId === id ? 'bg-black text-white' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${selectedChatId === id ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      {id[0].toUpperCase()}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm truncate">{id}</span>
                      </div>
                      <p className={`text-xs truncate ${selectedChatId === id ? 'text-gray-300' : 'text-gray-500'}`}>{lastMsg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          {selectedChatId ? (
            <>
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="font-black">{selectedChatId}</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
              </div>
              <div className="flex-grow p-8 space-y-4 overflow-y-auto">
                {activeChat.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-md text-sm ${msg.sender === 'Admin' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                      {msg.message}
                      <p className={`text-[8px] mt-1 ${msg.sender === 'Admin' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(msg.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-50">
                <div className="flex space-x-4">
                  <input 
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    className="flex-grow bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black" 
                    placeholder="Type a message..." 
                  />
                  <button 
                    onClick={sendReply}
                    disabled={isLoading || !adminReply.trim()}
                    className="bg-black text-white px-8 rounded-xl font-bold flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>Reply</span>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">Select an inquiry to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renders the settings panel. Using a block body and explicit return to prevent scope/parsing errors.
   */
  const renderSettings = () => {
    return (
      <div className="max-w-2xl bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
        <div>
          <h3 className="text-xl font-black mb-6">Delivery Partners</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {deliveryCompanies.map((c, i) => (
              <div key={i} className="bg-gray-100 px-4 py-2 rounded-full flex items-center space-x-2">
                <span className="text-sm font-bold">{c}</span>
                <button onClick={() => setDeliveryCompanies(deliveryCompanies.filter(comp => comp !== c))} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
              </div>
            ))}
          </div>
          <div className="flex space-x-4">
            <input id="new-courier" className="flex-grow bg-gray-50 p-4 rounded-xl outline-none" placeholder="Add new company name..." />
            <button 
              onClick={() => {
                const input = document.getElementById('new-courier') as HTMLInputElement;
                if (input.value) {
                  setDeliveryCompanies([...deliveryCompanies, input.value]);
                  input.value = '';
                }
              }}
              className="bg-black text-white px-6 rounded-xl font-bold"
            >
              Add
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50">
          <h3 className="text-xl font-black mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3 text-green-700">
                <CheckCircle2 size={20} />
                <span className="font-bold">Backend Communication Live</span>
              </div>
            </div>
            <button onClick={fetchData} className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Clock size={20} />
              <span>Force System Sync</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col fixed h-full z-50">
        <div className="p-10 flex flex-col items-center">
          <Logo className="w-32 mb-8" />
          <div className="h-[1px] w-full bg-gray-100"></div>
        </div>
        
        <nav className="flex-grow px-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'chat', label: 'Messages', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-black text-white shadow-xl translate-x-2' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <item.icon size={20} />
              <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow ml-80 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black capitalize tracking-tighter">{activeTab}</h2>
            <p className="text-gray-400 text-sm">Managing UNIKA TSHIRTS system as <strong>Rahin</strong></p>
          </div>
          <div className="flex items-center space-x-4">
             {isLoading && <Loader2 className="animate-spin text-black" size={24} />}
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
               <Clock size={16} className="text-gray-400" />
               <span className="text-xs font-black uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default AdminPanel;
