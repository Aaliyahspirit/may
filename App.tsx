import React, { useState } from 'react';
import { TradeForm } from './components/TradeForm';
import { TradeDashboard } from './components/TradeDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'application' | 'dashboard'>('application');

  return (
    <div className="min-h-screen bg-white text-primary">
      {/* Navigation */}
      <nav className="border-b border-gray-100 py-5 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
        <div className="text-xl tracking-[0.2em] font-bold uppercase text-primary cursor-pointer" onClick={() => setView('application')}>TwoPages</div>
        <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest text-primary/70 items-center">
            <a href="#" className="hover:text-primary transition-colors">Shop</a>
            <a href="#" className="hover:text-primary transition-colors">Collections</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <button 
                onClick={() => setView('application')} 
                className={`transition-colors border-b ${view === 'application' ? 'text-primary border-primary' : 'text-primary/70 border-transparent hover:text-primary'}`}
            >
                Trade Application
            </button>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <button 
                onClick={() => setView('dashboard')} 
                className={`transition-colors hover:text-primary ${view === 'dashboard' ? 'text-primary' : 'text-primary/70'}`}
            >
                Log In
            </button>
        </div>
      </nav>

      {view === 'dashboard' ? (
        <TradeDashboard />
      ) : (
        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-light mb-6 tracking-wide leading-tight text-primary">
              BECOME OUR <br/><span className="font-semibold">TRADE PARTNER</span>
            </h1>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-8"></div>
            <p className="text-primary/80 font-light leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
              If you're an architect, designer, developer, or any other professional working with interior design, 
              you're in the right place! Our Trade Program gives you exclusive access to fantastic window treatments at great prices.
            </p>
          </div>

          <TradeForm />
        </main>
      )}

      <footer className="border-t border-gray-100 mt-0 py-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
             <p className="text-xs text-primary/60 uppercase tracking-widest">
                © {new Date().getFullYear()} TwoPages. All rights reserved.
             </p>
        </div>
      </footer>
    </div>
  );
};

export default App;