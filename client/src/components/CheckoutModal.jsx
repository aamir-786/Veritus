import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutModal({ item, itemType, onClose, onSuccess }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user ? user.email : '');
  const [cardHolder, setCardHolder] = useState(user ? user.full_name : '');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!item) return null;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Initiate session
      const sessionRes = await api.createCheckoutSession(item.id, itemType, email);
      if (!sessionRes.success) {
        setError(sessionRes.error || 'Checkout initiation failed');
        setLoading(false);
        return;
      }

      // Step 2: Complete payment (Hosted payment simulation)
      const completeRes = await api.completeCheckout(sessionRes.order_id, cardHolder);
      if (completeRes.success) {
        setCompletedOrder(completeRes.order);
        if (onSuccess) onSuccess(completeRes.order);
      } else {
        setError(completeRes.error || 'Payment authorization failed');
      }
    } catch (err) {
      setError('An error occurred during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141C2E] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#141C2E] border-b border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Secure Hosted Checkout</h3>
              <p className="text-xs text-slate-400">256-Bit Encrypted Payment Provider</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          /* Payment Receipt Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-400 mt-1">Receipt & access entitlement sent to <span className="text-amber-400">{completedOrder.user_email}</span></p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Order Reference:</span>
                <span className="font-mono text-white">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Product Purchased:</span>
                <span className="font-medium text-white">{completedOrder.product_title}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400 text-sm">${completedOrder.amount.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Access Content Now
            </button>
          </div>
        ) : (
          /* Payment Entry Form */
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
            
            {/* Product Summary */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block mb-0.5">
                  {itemType === 'course' ? 'Executive Course Access' : 'Digital Template Access'}
                </span>
                <h4 className="font-display text-sm font-bold text-white line-clamp-1">{item.title}</h4>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-400">${item.price.toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">USD Single Pay</div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Receipt & Delivery Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cro@enterprise.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cardholder Full Name</label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={e => setCardHolder(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Card Information */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Credit or Debit Card
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                    placeholder="MM/YY"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono text-center focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>We never store card details. Payments secured by Stripe hosted infrastructure.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : `Complete Purchase — $${item.price.toFixed(2)}`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
