import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, X, Trash2, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CartDrawer() {
  const { cartItems, removeFromCart, cartTotal, isCartOpen, closeCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await api.validateCoupon(couponCodeInput.trim());
      if (res.success && res.promotion) {
        setAppliedCoupon({
          code: res.promotion.promo_code,
          discountPercent: res.promotion.discount_percentage
        });
        setCouponCodeInput('');
      } else {
        setCouponError(res.error || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? (cartTotal * (appliedCoupon.discountPercent / 100)) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isCheckoutLoading) return;
    
    if (!user) {
      closeCart();
      navigate(`/login?redirect=checkout&from=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const res = await api.createMultiCheckoutSession({ 
        items: cartItems,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined 
      });
      if (res.success && res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to initiate checkout. Please try again.');
      setIsCheckoutLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      ></div>
      
      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            Your Cart
          </div>
          <button 
            onClick={closeCart} 
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="mt-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm relative group">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                    <img 
                      src={item.cover_image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=200'} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-6">
                    <span className="text-[9px] text-blue-600 uppercase font-bold tracking-wide mb-0.5">{item.type || 'Item'}</span>
                    <h4 className="text-xs font-semibold text-slate-900 leading-snug truncate">{item.title}</h4>
                    <div className="text-xs font-bold text-slate-900 mt-1">${Number(item.price).toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-xs border border-transparent hover:border-rose-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Container */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0 space-y-4 relative z-10">
            
            {/* Total Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
                <span>Total Amount to Pay</span>
                <span className="text-xl text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isCheckoutLoading ? 'Preparing Checkout...' : 'Checkout via Stripe'}
              <ArrowRight className={`w-4 h-4 transition-transform ${isCheckoutLoading ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200/80">
              <Tag className="w-3 h-3 text-blue-600" /> Have a promo code? Enter it directly on Stripe Checkout.
            </div>

            <div className="text-center pt-1">
              <button 
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

