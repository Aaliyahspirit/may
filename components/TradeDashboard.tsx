import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { DraggableAnnotation, AnnotationData } from './DraggableAnnotation';

// --- Mock Data Definitions ---

const ROLES_DATA: Record<string, DashboardData> = {
  general: {
    user: { name: "Gary General", tier: "General Customer", points: 50, vipStatus: "Member" },
    quarterlyProgress: { currentSpend: 0, nextTierThreshold: 0, currency: "$", currentDiscount: 0, discountCode: "" }
  },
  trade: {
    user: { name: "Alex Trade", tier: "Trade", points: 1250, vipStatus: "Gold Member" },
    quarterlyProgress: { currentSpend: 3200, nextTierThreshold: 5000, currency: "$", currentDiscount: 30, discountCode: "TD30" }
  },
  plus: {
    user: { name: "Patty Plus", tier: "Trade Plus", points: 8500, vipStatus: "Platinum Member" },
    quarterlyProgress: { currentSpend: 7500, nextTierThreshold: 10000, currency: "$", currentDiscount: 35, discountCode: "TD35" }
  },
  elite: {
    user: { name: "Eli Elite", tier: "Trade Elite", points: 25000, vipStatus: "Diamond Member" },
    quarterlyProgress: { currentSpend: 15000, nextTierThreshold: 10000, currency: "$", currentDiscount: 38, discountCode: "TD38" }
  }
};

const DEFAULT_ANNOTATIONS: AnnotationData[] = [
    {
        id: '1',
        boxPos: { x: 280, y: 150 },
        anchorPos: { x: 220, y: 120 },
        content: "**导航逻辑：**\nIF `user.tier` == 'General'：\n  操作：隐藏仪表盘入口\n  跳转：重定向至 '我的账户'"
    },
    {
        id: '2',
        boxPos: { x: 900, y: 220 },
        anchorPos: { x: 750, y: 350 },
        content: "**状态处理：**\n进度条宽度 = `(当前消费 / 下一级门槛) * 100`\n边界处理：最大值限制为 100%。"
    },
    {
        id: '3',
        boxPos: { x: 950, y: 650 },
        anchorPos: { x: 1100, y: 550 },
        content: "**API 交互：**\n接口：`POST /api/invite`\n参数：`{ email: string }`\n成功响应：关闭弹窗并显示成功提示。"
    }
];

// --- Sub-Components ---

const SidebarItem: React.FC<{ 
  label: string; 
  active?: boolean; 
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, active, icon, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors duration-200 ${active ? 'bg-secondary border-r-4 border-primary' : 'hover:bg-gray-50'}`}
  >
    <div className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`}>
      {icon}
    </div>
    <span className={`text-sm font-medium tracking-wide ${active ? 'text-primary' : 'text-gray-500'}`}>
      {label}
    </span>
  </div>
);

const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors group"
      title="Click to copy"
    >
      <span className="font-mono font-bold text-primary">{code}</span>
      {copied ? (
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
};

// --- Views ---

const DashboardView: React.FC<{ data: DashboardData }> = ({ data }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [showRules, setShowRules] = useState(false);
  const [showInvitePreview, setShowInvitePreview] = useState(false);

  const { user, quarterlyProgress } = data;
  
  // Logic
  const MAX_GOAL = 10000;
  const currentSpend = quarterlyProgress.currentSpend;
  const progressPercent = Math.min((currentSpend / MAX_GOAL) * 100, 100);
  
  let nextMilestone = 0;
  let nextReward = "";
  let nextTierName = "";

  if (currentSpend < 5000) {
      nextMilestone = 5000;
      nextReward = "35% OFF";
      nextTierName = "Plus";
  } else if (currentSpend < 10000) {
      nextMilestone = 10000;
      nextReward = "38% OFF";
      nextTierName = "Elite";
  }
  const amountToNext = nextMilestone - currentSpend;

  const handleInviteClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setShowInvitePreview(true);
  };

  const confirmSendInvite = () => {
    setShowInvitePreview(false);
    setInviteStatus('sending');
    setTimeout(() => {
      setInviteStatus('success');
      setInviteEmail('');
      setTimeout(() => setInviteStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="animate-fade-in relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Module: Discount Codes */}
          <div className="bg-secondary p-8 rounded-lg relative overflow-hidden border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 border-b border-primary/10 pb-2">
                  Current Discounts - {user.tier}
              </h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-12 text-xs uppercase tracking-wide text-primary/50 font-semibold">
                      <div className="col-span-4">Order Value</div>
                      <div className="col-span-4 text-center">Discount</div>
                      <div className="col-span-4 text-right">Code</div>
                  </div>

                  {/* Dynamic Discount Rows based on Tier */}
                  {user.tier === 'Trade' && (
                      <>
                          <div className="grid grid-cols-12 items-center text-sm text-primary border-b border-primary/5 pb-2">
                              <div className="col-span-4 font-medium">No Minimum</div>
                              <div className="col-span-4 font-bold text-center">30% OFF</div>
                              <div className="col-span-4 text-right"><CopyButton code="TD30" /></div>
                          </div>
                          <div className="grid grid-cols-12 items-center text-sm text-primary border-b border-primary/5 pb-2">
                              <div className="col-span-4 font-medium">$2,000 - $4,999</div>
                              <div className="col-span-4 font-bold text-center">32% OFF</div>
                              <div className="col-span-4 text-right"><CopyButton code="TD32" /></div>
                          </div>
                          <div className="grid grid-cols-12 items-center text-sm text-primary">
                              <div className="col-span-4 font-medium">$5,000+</div>
                              <div className="col-span-4 font-bold text-center">35% OFF</div>
                              <div className="col-span-4 text-right"><CopyButton code="TD35" /></div>
                          </div>
                      </>
                  )}

                  {user.tier === 'Trade Plus' && (
                      <>
                            <div className="grid grid-cols-12 items-center text-sm text-primary border-b border-primary/5 pb-2">
                              <div className="col-span-4 font-medium">No Minimum</div>
                              <div className="col-span-4 font-bold text-center">35% OFF</div>
                              <div className="col-span-4 text-right"><CopyButton code="TD35" /></div>
                          </div>
                            <div className="grid grid-cols-12 items-center text-sm text-primary">
                              <div className="col-span-4 font-medium text-primary/40 italic">Next Tier ($10k+)</div>
                              <div className="col-span-4 font-bold text-center text-primary/40">38% OFF</div>
                              <div className="col-span-4 text-right"><span className="text-xs text-primary/40">Locked</span></div>
                          </div>
                      </>
                  )}

                  {user.tier === 'Trade Elite' && (
                      <div className="grid grid-cols-12 items-center text-sm text-primary">
                          <div className="col-span-4 font-medium">No Minimum</div>
                          <div className="col-span-4 font-bold text-center">38% OFF</div>
                          <div className="col-span-4 text-right"><CopyButton code="TD38" /></div>
                      </div>
                  )}
              </div>
              <p className="text-[10px] text-primary/50 mt-4 text-center md:text-left">* Apply code at checkout.</p>
          </div>

          {/* Module: Progress Bar */}
          <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <h3 className="text-lg font-medium text-primary">Quarterly Rewards</h3>
                      <p className="text-xs text-primary/60 mt-1">Unlock higher discounts for the rest of this quarter & the next.</p>
                  </div>
                  <span className="text-sm font-bold text-primary bg-secondary px-3 py-1 rounded">Q3 Spend: ${currentSpend.toLocaleString()}</span>
              </div>
              
              <div className="relative h-24 mb-4 select-none">
                  <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 h-2 bg-primary rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-sm" style={{ width: `${progressPercent}%` }}></div>
                  
                  {/* Nodes */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${currentSpend >= 0 ? 'bg-primary border-primary' : 'bg-white border-gray-300'} z-10`}></div>
                      <span className="mt-3 text-[10px] text-primary/40 font-semibold uppercase">$0</span>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${currentSpend >= 5000 ? 'bg-primary border-primary' : 'bg-white border-gray-300'} z-10`}></div>
                      <div className="mt-3 text-center">
                          <span className={`block text-[10px] font-bold uppercase ${currentSpend >= 5000 ? 'text-primary' : 'text-primary/40'}`}>Plus</span>
                          <span className={`block text-[10px] ${currentSpend >= 5000 ? 'text-primary' : 'text-primary/40'}`}>$5,000</span>
                      </div>
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col items-end">
                      <div className={`w-4 h-4 rounded-full border-2 ${currentSpend >= 10000 ? 'bg-primary border-primary' : 'bg-white border-gray-300'} z-10`}></div>
                      <div className="mt-3 text-right">
                          <span className={`block text-[10px] font-bold uppercase ${currentSpend >= 10000 ? 'text-primary' : 'text-primary/40'}`}>Elite</span>
                          <span className={`block text-[10px] ${currentSpend >= 10000 ? 'text-primary' : 'text-primary/40'}`}>$10,000</span>
                      </div>
                  </div>
              </div>

              <div className="mt-2 p-4 bg-secondary/50 rounded-lg border border-primary/5 flex items-start gap-3">
                  <div className="p-1.5 bg-white rounded-full shadow-sm text-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                      {amountToNext > 0 ? (
                          <p className="text-sm text-primary/80">Spend <strong className="text-primary">${amountToNext.toLocaleString()}</strong> more to unlock <strong className="text-primary">{nextTierName}</strong> status.<br/><span className="text-xs text-primary/60">Benefit: <strong>{nextReward}</strong> discount.</span></p>
                      ) : (
                          <p className="text-sm text-primary/80"><strong className="text-primary">Congratulations!</strong> You've reached the highest tier.</p>
                      )}
                  </div>
              </div>
              <div className="mt-4 flex justify-end">
                  <button onClick={() => setShowRules(!showRules)} className="text-xs text-primary underline decoration-1 hover:text-primary/70 flex items-center gap-1">View Rules <svg className={`w-3 h-3 transition-transform ${showRules ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              </div>
              {showRules && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-primary/70 space-y-2 animate-fade-in">
                      <div className="flex justify-between py-1 border-b border-gray-50"><span>Trade Plus ($5,000+)</span><span className="font-medium text-primary">35% OFF</span></div>
                      <div className="flex justify-between py-1"><span>Trade Elite ($10,000+)</span><span className="font-medium text-primary">38% OFF</span></div>
                  </div>
              )}
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-primary/20 cursor-pointer hover:bg-gray-50 transition-colors">
                     <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2c3.6 0 6.2 2 6.2 5.5V9S14 6 17.5 6A2.5 2.5 0 0120 4.5v15A2.5 2.5 0 0117.5 22 2.5 2.5 0 0115 19.5v-11C15 6 13.5 4 12 4s-3 2-3 4.5v11A2.5 2.5 0 016.5 22 2.5 2.5 0 014 19.5z"/></svg>
                </div>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-primary mb-2">Free Sample Booklet</h3>
                    <p className="text-xs text-primary/70 mb-4">Get a complimentary sample booklet with your next order.</p>
                    <button className="w-full py-3 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors rounded-sm">Get Free Sample</button>
                </div>
            </div>
            
            <div className="bg-primary text-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-light mb-1">Give $80, Get $80</h3>
                <p className="text-white/70 text-xs mb-6">Invite a designer friend.</p>
                <form onSubmit={handleInviteClick} className="flex flex-col gap-3">
                    <input type="email" placeholder="Friend's Email Address" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-3 text-primary rounded-sm text-sm focus:outline-none" />
                    <button type="submit" disabled={inviteStatus !== 'idle'} className="w-full py-3 bg-[#C8A97E] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#B8996E] transition-colors rounded-sm">
                        {inviteStatus === 'idle' ? 'Send Invite' : (inviteStatus === 'sending' ? 'Sending...' : 'Sent!')}
                    </button>
                </form>
            </div>
        </div>
      </div>

       {/* Invite Modal */}
       {showInvitePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInvitePreview(false)}></div>
             <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-primary">Preview Invitation</h3>
                    <button onClick={() => setShowInvitePreview(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1"><span className="text-xs font-bold uppercase tracking-widest text-primary/60">To:</span><div className="text-sm font-medium text-primary border border-gray-200 rounded px-3 py-2 bg-gray-50">{inviteEmail}</div></div>
                    <div className="space-y-1"><span className="text-xs font-bold uppercase tracking-widest text-primary/60">Subject:</span><div className="text-sm font-medium text-primary">You've been invited to the TwoPages Trade Program</div></div>
                    <div className="space-y-1"><span className="text-xs font-bold uppercase tracking-widest text-primary/60">Message:</span><div className="text-sm text-primary/80 border border-gray-200 rounded p-4 bg-gray-50 leading-relaxed"><p className="mb-2">Hi there,</p><p className="mb-2">I thought you'd love the TwoPages Trade Program.</p><p className="text-primary font-semibold">Join Now &gt;</p></div></div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setShowInvitePreview(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary">Cancel</button>
                    <button onClick={confirmSendInvite} className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 rounded-sm">Confirm & Send</button>
                </div>
             </div>
          </div>
        )}
    </div>
  );
};

const OrderHistoryView: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-8">Order History</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-primary/60 font-semibold tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Order #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-primary">ORD-24-9012</td>
                            <td className="px-6 py-4 text-primary/80">Oct 24, 2024</td>
                            <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Shipped</span></td>
                            <td className="px-6 py-4 font-medium">$3,200.00</td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:text-primary/70 underline text-xs">View</button></td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-primary">ORD-24-8550</td>
                            <td className="px-6 py-4 text-primary/80">Sep 12, 2024</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Delivered</span></td>
                            <td className="px-6 py-4 font-medium">$1,500.00</td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:text-primary/70 underline text-xs">View</button></td>
                        </tr>
                         <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-primary">ORD-24-7102</td>
                            <td className="px-6 py-4 text-primary/80">Aug 05, 2024</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Delivered</span></td>
                            <td className="px-6 py-4 font-medium">$850.00</td>
                            <td className="px-6 py-4 text-right"><button className="text-primary hover:text-primary/70 underline text-xs">View</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrderTrackingView: React.FC = () => {
    const [method, setMethod] = useState<'order' | 'tracking'>('order');
    
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-8">Order Tracking</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Form Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-xl text-center font-light mb-8">Track Your Order</h3>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button 
                            className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-colors relative ${method === 'order' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setMethod('order')}
                        >
                            Order Number
                            {method === 'order' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                        </button>
                        <button 
                            className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-colors relative ${method === 'tracking' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setMethod('tracking')}
                        >
                            Tracking Number
                            {method === 'tracking' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {method === 'order' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Number</label>
                                    <input type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder-gray-300 text-sm" placeholder="e.g. 123456" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                                    <input type="email" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder-gray-300 text-sm" placeholder="e.g. email@domain.com" />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tracking Number</label>
                                <input type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder-gray-300 text-sm" placeholder="e.g. 1Z9999999999999999" />
                            </div>
                        )}

                        <button className="w-full py-4 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all mt-4 rounded-sm shadow-sm">
                            Track
                        </button>
                    </form>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-[#E8E4E1] relative h-64 md:h-auto overflow-hidden">
                     {/* Using a sample book/fabric related image as requested */}
                     <img 
                        src="https://images.unsplash.com/photo-1507450768783-6593a55b62b6?auto=format&fit=crop&q=80&w=1000" 
                        alt="Sample Book" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                     />
                     <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                </div>
            </div>
        </div>
    );
};

const MyRewardsView: React.FC<{ points: number }> = ({ points }) => {
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-8">My Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                 <div className="bg-primary text-white p-8 rounded-lg shadow-md col-span-1">
                     <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Total Points</p>
                     <p className="text-5xl font-light mb-4">{points.toLocaleString()}</p>
                     <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors">Redeem Points</button>
                 </div>
                 <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm col-span-2 flex flex-col justify-center">
                     <h3 className="text-lg font-medium text-primary mb-2">How to earn points</h3>
                     <ul className="text-sm text-primary/70 space-y-2">
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div>Earn 1 point for every $1 spent</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div>Refer a friend: 500 points</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div>Write a review: 50 points</li>
                     </ul>
                 </div>
            </div>
            
            <h3 className="text-lg font-medium text-primary mb-4">Points History</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-xs uppercase text-primary/60 font-semibold tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Activity</th>
                            <th className="px-6 py-4 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-primary/80">Oct 24, 2024</td>
                            <td className="px-6 py-4 font-medium text-primary">Order #ORD-24-9012</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">+3,200</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-primary/80">Sep 01, 2024</td>
                            <td className="px-6 py-4 font-medium text-primary">Referral Bonus</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">+500</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AddressBookView: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-light text-primary">Address Book</h2>
                 <button className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 rounded-sm shadow-sm">Add New Address</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Default Address */}
                 <div className="bg-white border border-primary rounded-lg p-6 shadow-sm relative">
                     <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-secondary text-primary px-2 py-1 rounded">Default</div>
                     <h3 className="font-bold text-primary mb-2">Alex Designer</h3>
                     <p className="text-sm text-primary/70 leading-relaxed mb-4">
                         123 Design Avenue, Suite 400<br/>
                         New York, NY 10012<br/>
                         United States<br/>
                         +1 (555) 123-4567
                     </p>
                     <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-primary">
                         <button className="hover:underline">Edit</button>
                         <button className="hover:underline text-red-500 opacity-50 cursor-not-allowed" disabled>Remove</button>
                     </div>
                 </div>

                  {/* Secondary Address */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:border-gray-300 transition-colors">
                     <h3 className="font-bold text-primary mb-2">Client Site A</h3>
                     <p className="text-sm text-primary/70 leading-relaxed mb-4">
                         456 Park Lane<br/>
                         Greenwich, CT 06830<br/>
                         United States<br/>
                         +1 (555) 987-6543
                     </p>
                     <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-primary">
                         <button className="hover:underline">Edit</button>
                         <button className="hover:underline text-red-500">Remove</button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

const AccountSettingsView: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-8">Account Settings</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                 <h3 className="text-lg font-medium text-primary mb-6 border-b border-gray-100 pb-2">Profile Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                         <input type="text" defaultValue="Alex" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                         <input type="text" defaultValue="Designer" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                     </div>
                 </div>
                 <div className="space-y-2 mb-8">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input type="email" defaultValue="alex@designstudio.com" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary bg-gray-50" disabled />
                 </div>

                 <h3 className="text-lg font-medium text-primary mb-6 border-b border-gray-100 pb-2">Change Password</h3>
                 <div className="space-y-4 mb-8">
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Password</label>
                         <input type="password" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                            <input type="password" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Password</label>
                            <input type="password" className="w-full border border-gray-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                        </div>
                     </div>
                 </div>
                 
                 <div className="flex justify-end">
                     <button className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-sm shadow-sm">Save Changes</button>
                 </div>
            </div>
        </div>
    );
};

// --- Main Layout ---

export const TradeDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'tracking' | 'rewards' | 'address' | 'settings'>('dashboard');
  const [currentRole, setCurrentRole] = useState('trade');
  const [isDevMode, setIsDevMode] = useState(false);
  const [annotations, setAnnotations] = useState<AnnotationData[]>(DEFAULT_ANNOTATIONS);
  
  const data = ROLES_DATA[currentRole];
  const { user } = data;
  const isGeneral = user.tier === 'General Customer';

  // Automatically switch view if General Customer tries to access Dashboard
  // Default General view is 'settings' (My Account) based on requirements
  useEffect(() => {
    if (isGeneral && activeView === 'dashboard') {
        setActiveView('settings');
    }
  }, [isGeneral, activeView]);

  // Logic to add a new annotation (center of viewport roughly)
  const handleAddAnnotation = () => {
    const newId = Date.now().toString();
    const newAnnotation: AnnotationData = {
        id: newId,
        // Default spawn position, relative to the container which is full width/height
        boxPos: { x: 300, y: 300 },
        anchorPos: { x: 350, y: 450 },
        content: ""
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleDuplicateAnnotation = (data: Omit<AnnotationData, 'id'>) => {
      const newId = Date.now().toString();
      // Offset slightly
      const newAnnotation: AnnotationData = {
          id: newId,
          boxPos: { x: data.boxPos.x + 20, y: data.boxPos.y + 20 },
          anchorPos: { x: data.anchorPos.x + 20, y: data.anchorPos.y + 20 },
          content: data.content
      };
      setAnnotations([...annotations, newAnnotation]);
  };

  const handleUpdateAnnotation = (id: string, newData: Partial<AnnotationData>) => {
      setAnnotations(prev => prev.map(ann => 
          ann.id === id ? { ...ann, ...newData } : ann
      ));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
      
      {/* Dev Tools: Role Switcher & Dev Mode Toggle */}
      <div className="fixed top-20 right-4 z-[100] bg-white shadow-xl border border-gray-200 rounded-lg p-4 text-xs flex flex-col gap-4 items-end animate-fade-in transition-all">
         <div className="flex gap-2">
            {Object.keys(ROLES_DATA).map(role => (
                <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`px-3 py-1.5 rounded border uppercase font-bold transition-all ${currentRole === role ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                >
                    {role === 'general' ? 'Gen' : role}
                </button>
            ))}
         </div>
         <div className="flex items-center gap-3 border-t border-gray-100 pt-3 w-full justify-end">
             <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Annotation Mode</span>
             <button 
                onClick={() => setIsDevMode(!isDevMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDevMode ? 'bg-cyan-500' : 'bg-gray-200'}`}
             >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isDevMode ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
         </div>
         {isDevMode && (
             <div className="w-full flex justify-end animate-fade-in">
                 <button 
                    onClick={handleAddAnnotation}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors shadow-sm"
                 >
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                     新建标注
                 </button>
             </div>
         )}
      </div>

      {/* Dev Mode Overlay Layer */}
      {isDevMode && (
          <div className="absolute inset-0 z-[60] pointer-events-none overflow-hidden">
             {annotations.map(annotation => (
                 <DraggableAnnotation 
                    key={annotation.id}
                    data={annotation}
                    onDelete={handleDeleteAnnotation}
                    onDuplicate={handleDuplicateAnnotation}
                    onUpdate={handleUpdateAnnotation}
                 />
             ))}
          </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-gray-100 flex-shrink-0 bg-white">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                 {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                 <h4 className="text-sm font-bold text-primary truncate">{user.name}</h4>
                 <p className="text-xs text-primary/60 truncate">{user.tier}</p>
             </div>
         </div>

        <div className="py-6">
          {isGeneral ? (
            // General Customer Menu Structure
            <>
                 <SidebarItem 
                    active={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                    label="My Account" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} 
                />
                 <SidebarItem 
                    active={activeView === 'address'}
                    onClick={() => setActiveView('address')}
                    label="Address Book" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} 
                />
                <SidebarItem 
                    active={activeView === 'history'}
                    onClick={() => setActiveView('history')}
                    label="Order History" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} 
                />
                 <SidebarItem 
                    active={activeView === 'tracking'}
                    onClick={() => setActiveView('tracking')}
                    label="Order Tracking" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.5c0-.621.504-1.125 1.125-1.125H15M4.875 14.25a1.125 1.125 0 01-1.125-1.125v-3.375c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125H4.875z" /></svg>} 
                />
                 <SidebarItem 
                    active={activeView === 'rewards'}
                    onClick={() => setActiveView('rewards')}
                    label="My Rewards" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12" /></svg>} 
                />
            </>
          ) : (
            // Trade Customer Menu Structure
            <>
                <SidebarItem 
                    active={activeView === 'dashboard'}
                    onClick={() => setActiveView('dashboard')}
                    label="Dashboard" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>} 
                />
                <SidebarItem 
                    active={activeView === 'history'}
                    onClick={() => setActiveView('history')}
                    label="Order History" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} 
                />
                <SidebarItem 
                    active={activeView === 'tracking'}
                    onClick={() => setActiveView('tracking')}
                    label="Order Tracking" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.5c0-.621.504-1.125 1.125-1.125H15M4.875 14.25a1.125 1.125 0 01-1.125-1.125v-3.375c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125H4.875z" /></svg>} 
                />
                <SidebarItem 
                    active={activeView === 'rewards'}
                    onClick={() => setActiveView('rewards')}
                    label="My Rewards" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12" /></svg>} 
                />
                 <SidebarItem 
                    active={activeView === 'address'}
                    onClick={() => setActiveView('address')}
                    label="Address Book" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} 
                />
                <SidebarItem 
                    active={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                    label="Account Settings" 
                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
                />
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 animate-fade-in relative">
        
        {/* Header (Shared across all views) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100">
            <div>
                <h1 className="text-3xl font-light text-primary mb-2">Welcome back, <span className="font-semibold">{user.name}</span></h1>
                <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] uppercase tracking-widest font-bold rounded-sm">
                    {user.tier}
                </span>
            </div>
            <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                    Total TWOPAGES Points: <span className="text-xl">{user.points.toLocaleString()}</span>
                </p>
                <div className="flex items-center justify-end gap-2 text-primary/60 text-xs">
                    <span>{user.vipStatus}</span>
                    <span>•</span>
                    <button className="hover:text-primary underline decoration-1 underline-offset-2" onClick={() => setActiveView('rewards')}>View Rewards History &gt;</button>
                </div>
            </div>
        </div>

        {activeView === 'dashboard' && !isGeneral && <DashboardView data={data} />}
        {activeView === 'history' && <OrderHistoryView />}
        {activeView === 'tracking' && <OrderTrackingView />}
        {activeView === 'rewards' && <MyRewardsView points={user.points} />}
        {activeView === 'address' && <AddressBookView />}
        {activeView === 'settings' && <AccountSettingsView />}

      </main>
    </div>
  );
};