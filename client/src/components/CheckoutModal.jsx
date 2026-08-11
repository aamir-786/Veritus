import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative text-slate-900">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center border border-blue-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Secure Hosted Checkout</h3>
              <p className="text-xs text-slate-500 font-medium">256-Bit Encrypted Payment Provider</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          /* Payment Receipt Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-600 mt-1">Receipt & access entitlement sent to <span className="text-blue-900 font-bold">{completedOrder.user_email}</span></p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Order Reference:</span>
                <span className="font-mono text-slate-900 font-bold">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Product Purchased:</span>
                <span className="font-semibold text-slate-900">{completedOrder.product_title}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">${completedOrder.amount.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors shadow-sm text-xs"
            >
              Access Content Now
            </button>
          </div>
        ) : (
          /* Payment Entry Form */
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
            
            {/* Product Summary */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-900 block mb-0.5">
                  {itemType === 'course' ? 'Executive Course Access' : 'Digital Template Access'}
                </span>
                <h4 className="font-display text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-700">${item.price.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">USD Single Pay</div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt & Delivery Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cro@enterprise.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-900"
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Full Name</label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={e => setCardHolder(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-900"
              />
            </div>

            {/* Card Information */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Credit or Debit Card
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-900"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                    placeholder="MM/YY"
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono text-center focus:outline-none focus:border-blue-900"
                  />
                  <input
                    type="text"
                    required
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono text-center focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We never store card details. Payments secured by Stripe hosted infrastructure.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-900 text-white font-extrabold hover:bg-blue-800 transition-all shadow-sm flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : `Complete Purchase — $${item.price.toFixed(2)}`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
