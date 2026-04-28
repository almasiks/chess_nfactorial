"use client";
import { useState, useCallback } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export function useCart(isPro = false) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen]   = useState(false);

  const discount = isPro ? 0.05 : 0;

  const addItem = useCallback((product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total    = Math.round(subtotal * (1 - discount));
  const count    = items.reduce((s, i) => s + i.quantity, 0);

  return { items, open, setOpen, addItem, removeItem, updateQty, clear, subtotal, total, count, discount };
}
