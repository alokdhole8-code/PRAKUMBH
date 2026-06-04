"use client";
import { useState } from "react";

// ─── Google Apps Script Web App URL ───────────────────────────────────────────
// After deploying your Apps Script, paste the URL here:
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbx_1PkhXTN-EhjvEgTi7Ebym42baTJ1rXDvMfUSOvkkHLOP7wKvSTT-WsBj6YKWV7e96w/exec";

// ─── WhatsApp Config ───────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "918766599895"; // Replace with your number

// ─── Utility: build WhatsApp message ──────────────────────────────────────────
function buildWhatsAppMessage({ name, phone, address, city, pincode, productName, color, size, quantity, total }) {
  return `🛒 Send this message to confirm your order.

Name: ${name}
Phone: ${phone}
Address: ${address}
City: ${city}
Pincode: ${pincode}

Product: ${productName}
Color: ${color}
Size: ${size}
Qty: ${quantity}

Total: ₹${total}

Order received successfully.`;
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, id, error, ...props }) {
  return (
    <div className="am-field">
      <label className="am-label" htmlFor={id}>{label}</label>
      <input id={id} className={`am-input${error ? " am-input--error" : ""}`} {...props} />
      {error && <span className="am-error-msg">{error}</span>}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ visible, message, type }) {
  return (
    <div className={`am-toast am-toast--${type}${visible ? " am-toast--show" : ""}`}>
      {type === "success" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {type === "error" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function AddressModal({
  isOpen,
  onClose,
  productName = "Product",
  selectedColor = "N/A",
  selectedSize = "N/A",
  quantity = 1,
  price = 0,
}) {
  const total = price * quantity;

 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Phone must be exactly 10 digits";
    if (!form.address.trim()) e.address = "Full address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Pincode must be exactly 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: "" }));
  };

 

  if (!isOpen) return null;

  return (
    <>
      {/* ── Styles (scoped, no external deps) ─────────────────────────────── */}
 
 

      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </>
  );
}











 