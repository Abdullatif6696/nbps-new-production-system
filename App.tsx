import React, { useEffect, useState } from 'react';
import { RawMaterial, OrderItem, ThemeMode, OptimizationPlan } from './types';
import { StorageService } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { PlanningStation } from './components/PlanningStation';
import { LayoutDashboard, Package, Scissors, Sun, Moon, Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Simple Router enum
enum View {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  PLANNING = 'planning'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [inventory, setInventory] = useState<RawMaterial[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialization
  useEffect(() => {
    setInventory(StorageService.getInventory());
    setOrders(StorageService.getOrders());
    const storedTheme = StorageService.getTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const applyTheme = (t: ThemeMode) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    StorageService.saveTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleAddInventory = (item: RawMaterial) => {
    const updated = [...inventory, item];
    setInventory(updated);
    StorageService.saveInventory(updated);
  };

  const handleDeleteInventory = (id: string) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    StorageService.saveInventory(updated);
  };

  const handleExecutePlan = (plan: OptimizationPlan) => {
    if (!window.confirm("Confirm production execution? This will:\n1. Mark selected orders as Fulfilled\n2. Remove the Used Roll from Inventory")) return;

    try {
      console.log("Executing Plan:", plan);

      // 1. Mark orders as fulfilled
      const fulfilledIds = new Set(plan.cuts.map(c => c.id));
      const updatedOrders = orders.map(o => fulfilledIds.has(o.id) ? { ...o, isFulfilled: true } : o);
      
      // 2. Consume Inventory
      // Remove the used master roll from inventory
      const newInventory = inventory.filter(r => r.id !== plan.rollId);
      
      let remnantMsg = "";
      // If waste is significant (e.g., > 100mm), create a Remnant item
      if (plan.wasteWidth > 100) { 
         const remnant: RawMaterial = {
           ...plan.selectedRoll,
           id: uuidv4(), // Generate unique ID for the offcut
           batchNumber: `${plan.selectedRoll.batchNumber}-REM`,
           width: plan.wasteWidth,
           // Approximate weight based on width ratio
           weight: Number((plan.selectedRoll.weight * (plan.wasteWidth / plan.selectedRoll.width)).toFixed(2)),
           isRemnant: true,
           entryDate: new Date().toISOString()
         };
         newInventory.push(remnant);
         remnantMsg = `\n(Created 1 Remnant Roll: ${remnant.batchNumber})`;
      }

      // Update State
      setOrders(updatedOrders);
      setInventory(newInventory);
      
      // Persist Data
      StorageService.saveOrders(updatedOrders);
      StorageService.saveInventory(newInventory);
      
      alert(`SUCCESS!\n\n- ${plan.cuts.length} Orders marked as Done.\n- Roll ${plan.selectedRoll.batchNumber} removed from stock.${remnantMsg}`);
      setCurrentView(View.DASHBOARD);
    } catch (error) {
      console.error("Failed to execute plan:", error);
      alert("An error occurred while executing the plan.");
    }
  };

  const NavItem = ({ view, label, icon: Icon }: any) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === view ? 'bg-biroea-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 no-print">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-biroea-600 to-biroea-500 bg-clip-text text-transparent">NBPS</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Production Planning</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem view={View.DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
          <NavItem view={View.INVENTORY} label="Inventory" icon={Package} />
          <NavItem view={View.PLANNING} label="Planning" icon={Scissors} />
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
           <button 
             onClick={toggleTheme}
             className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
           >
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 z-50 border-b dark:border-gray-700 p-4 flex justify-between items-center no-print">
         <span className="font-bold text-xl text-biroea-600">NBPS</span>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
           <Menu className="text-gray-700 dark:text-white" />
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
           <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 p-4 space-y-2 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="mb-8 mt-4 font-bold text-xl px-4 text-gray-800 dark:text-white">Menu</div>
              <NavItem view={View.DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
              <NavItem view={View.INVENTORY} label="Inventory" icon={Package} />
              <NavItem view={View.PLANNING} label="Planning" icon={Scissors} />
              <div className="pt-4 mt-4 border-t dark:border-gray-700">
                <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-600 dark:text-gray-300">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Toggle Theme</span>
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
          {currentView === View.DASHBOARD && <Dashboard inventory={inventory} orders={orders} />}
          {currentView === View.INVENTORY && <InventoryManager inventory={inventory} onAdd={handleAddInventory} onDelete={handleDeleteInventory} />}
          {currentView === View.PLANNING && <PlanningStation inventory={inventory} orders={orders} onExecute={handleExecutePlan} />}
        </div>
      </main>
    </div>
  );
};

export default App;