import { Coupon, couponEligible } from "../admin/demoStore";
import { productImage } from "../productPresentation";
import { useDialog } from "./useDialog";
import React, { useState, useEffect } from "react";
import {
  CartItem,
  OrderCustomerInfo,
  DeliveryType,
  PaymentMethod,
} from "../types";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Send,
  ShoppingBag,
  CheckCircle,
  Tag,
  Truck,
  QrCode,
  CreditCard,
  Banknote,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface CartDrawerProps {
  coupons: Coupon[];
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedCity: string;
  onOrderSuccess: (orderData: {
    orderNumber: string;
    total: number;
    info: OrderCustomerInfo;
    items: CartItem[];
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  coupons,
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedCity,
  onOrderSuccess,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const [step, setStep] = useState<"cart" | "checkout">("cart");

  const [customerInfo, setCustomerInfo] = useState<OrderCustomerInfo>({
    name: "",
    phone: "",
    city: selectedCity.split(" (")[0] || "Cobija",
    address: "",
    deliveryType: selectedCity.includes("Cobija")
      ? "delivery"
      : "national_shipping",
    paymentMethod: "qr",
    notes: "",
  });

  const reduceMotion = useReducedMotion();
  const dialogRef = useDialog(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setStep("cart");
      setCustomerInfo((info) => ({
        ...info,
        city: selectedCity.split(" (")[0],
        deliveryType: selectedCity.includes("Cobija")
          ? "delivery"
          : "national_shipping",
      }));
    }
  }, [isOpen, selectedCity]);
  const [checkoutError, setCheckoutError] = useState("");
  useEffect(() => {
    if (isOpen && step === "checkout") document.getElementById("customer-name-input")?.focus();
    if (isOpen && step === "cart") document.getElementById("close-cart-btn")?.focus();
  }, [step, isOpen]);
  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const selectedCoupon = coupons.find(c => c.code === appliedCode);
  const appliedDiscount = selectedCoupon && couponEligible(selectedCoupon, subtotal) ? selectedCoupon : null;
  const discountAmount = appliedDiscount ? Math.min(subtotal, appliedDiscount.kind === 'percent' ? subtotal * appliedDiscount.value / 100 : appliedDiscount.value) : 0;

  const clearCoupon = () => {
    setAppliedCode(null);
    setCouponCode('');
    setCouponError('');
    requestAnimationFrame(() => document.getElementById('coupon-input')?.focus());
  };

  let shippingCost = 0;
  if (customerInfo.deliveryType === "delivery") {
    shippingCost = subtotal >= 150 ? 0 : 10;
  } else if (customerInfo.deliveryType === "national_shipping") {
    shippingCost = 25;
  } else {
    shippingCost = 0; // pickup
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanCode = couponCode.trim().toUpperCase();

    const match = coupons.find(c => c.code === cleanCode);
    if (match && couponEligible(match, subtotal)) setAppliedCode(match.code);
    else { setAppliedCode(null); setCouponError(match && match.active && subtotal < match.minimum ? `La compra mínima para este cupón es Bs. ${match.minimum.toFixed(2)}.` : 'Este cupón no está disponible o ha vencido.'); }
  };

  const handleWhatsAppCheckout = () => {
    if (
      !customerInfo.name.trim() ||
      (!/^[+0-9 ()-]+$/.test(customerInfo.phone.trim()) || !/^\d{7,15}$/.test(customerInfo.phone.replace(/\D/g, ""))) ||
      !customerInfo.city.trim() ||
      (customerInfo.deliveryType === "delivery" && !customerInfo.address.trim())
    ) {
      setCheckoutError(
        "Completa tu nombre, un teléfono válido y la ciudad. Para entrega a domicilio, indica también la dirección.",
      );
      return;
    }

    if (customerInfo.deliveryType === "delivery" && !/^cobija(?:\s|,|$)/i.test(customerInfo.city.trim())) {
      setCheckoutError("La entrega local corresponde a Cobija. Para otra ciudad, elige envío nacional.");
      document.getElementById("customer-city-input")?.focus();
      return;
    }
    if (!cart.length || cart.some(item => !item.product.inStock)) {
      setCheckoutError("Revisa el carrito: hay productos sin disponibilidad.");
      return;
    }
    setCheckoutError("");
    const orderNumber = `AMZ-${Math.floor(100000 + Math.random() * 900000)}`;

    let message = ` *Solicitud de compra · Amazonía en Casa* \n`;
    message += ` *Referencia de consulta:* #${orderNumber}\n`;
    message += ` *Cliente:* ${customerInfo.name}\n`;
    message += ` *Teléfono:* ${customerInfo.phone}\n`;
    message += ` *Ciudad/Destino:* ${customerInfo.city}\n`;
    if (customerInfo.address) {
      message += ` *Dirección:* ${customerInfo.address}\n`;
    }
    message += ` *Tipo de Envío:* ${
      customerInfo.deliveryType === "delivery"
        ? "Entrega local en Cobija"
        : customerInfo.deliveryType === "national_shipping"
          ? "Envío nacional por coordinar"
          : "Recojo en tienda"
    }\n`;
    message += ` *Preferencia de pago:* ${
      customerInfo.paymentMethod === "qr"
        ? "QR por coordinar"
        : customerInfo.paymentMethod === "transfer"
          ? "Transferencia"
          : "Efectivo por coordinar"
    }\n\n`;

    message += ` *DETALLE DE PRODUCTOS:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (${item.product.weightVolume}) x ${item.quantity} = *Bs. ${item.product.price * item.quantity}*\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Subtotal: Bs. ${subtotal.toFixed(2)}\n`;
    if (discountAmount > 0) {
      message += `Descuento (${appliedDiscount?.code}): -Bs. ${discountAmount.toFixed(2)}\n`;
    }
    message += `Envío estimado: Bs. ${shippingCost.toFixed(2)}\n`;
    message += `*TOTAL ESTIMADO: Bs. ${grandTotal.toFixed(2)}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;

    if (customerInfo.notes) {
      message += ` *Notas adicionales:* ${customerInfo.notes}\n`;
    }

    message += `\n Disponibilidad, descuentos, envío y pago pendientes de confirmación por la tienda.`;

    const encodedMessage = encodeURIComponent(message);
    const storePhone = "59172916657"; // Official store phone from Pando catalog
    const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;

    // Call success handler
    onOrderSuccess({
      orderNumber,
      total: grandTotal,
      info: customerInfo,
      items: [...cart],
    });

    // Open WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compra"
      tabIndex={-1}
      className="dialog-backdrop drawer-backdrop cart-dialog"
    >
      <motion.div
        initial={{ x: reduceMotion ? 0 : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: reduceMotion ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="drawer-panel"
      >
        <header className="cart-header">
          <div className="cart-heading">
            <p className="eyebrow">AMAZONÍA EN CASA</p>
            <h2>{step === "cart" ? "Tu carrito" : "Datos de entrega"}</h2>
            <p className="cart-count">{cart.length} {cart.length === 1 ? "producto seleccionado" : "productos seleccionados"}</p>
          </div>
          <button id="close-cart-btn" aria-label="Cerrar" onClick={onClose} className="icon-button cart-close"><X size={22} /></button>
        </header>
        {cart.length > 0 && <div className="cart-steps" aria-label="Pasos de compra">
          <span aria-current={step === "cart" ? "step" : undefined}><b>1</b> Carrito</span>
          <span className="cart-step-line" />
          <span aria-current={step === "checkout" ? "step" : undefined}><b>2</b> Entrega</span>
        </div>}

        {/* Content Area */}
        <div className="panel-body flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#e5ebdf] border border-stone-200 flex items-center justify-center text-3xl">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-serif-title text-lg font-bold text-stone-800">
                Tu carrito está vacío
              </h4>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
                Elige chocolates, artesanía o cuidado personal y añádelos aquí.
              </p>
              <button
                id="start-shopping-btn"
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#e5ebdf] text-stone-950 font-bold text-xs hover:bg-[#e5ebdf] transition-colors shadow-md"
              >
                Explorar el catálogo
              </button>
            </div>
          ) : step === "cart" ? (
            /* STEP 1: CART ITEMS */
            <div className="space-y-4">
              <div className="cart-list-heading">
                <span>Tu selección</span>
                <button id="clear-cart-btn" onClick={onClearCart} title="Vaciar carrito"><Trash2 size={14} /> Vaciar</button>
              </div>
              <ul className="cart-items">
                {cart.map((item) => (
                  <li key={item.product.id} className="cart-item">
                    <img src={productImage(item.product)} alt={item.product.name} referrerPolicy="no-referrer" />
                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>
                      <p>{item.product.originCommunity.split(",")[0]} · {item.product.weightVolume}</p>
                      <small>Bs. {item.product.price.toFixed(2)} / unidad</small>
                    </div>
                    <button id={`remove-item-${item.product.id}`} aria-label={`Eliminar ${item.product.name} del carrito`} onClick={() => onRemoveItem(item.product.id)} className="icon-button cart-remove"><X size={16} /></button>
                    <div className="quantity-control cart-quantity">
                      <button id={`cart-minus-${item.product.id}`} aria-label={`Quitar una unidad de ${item.product.name}`} onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}><Minus size={16} /></button>
                      <output aria-live="polite">{item.quantity}</output>
                      <button id={`cart-plus-${item.product.id}`} aria-label={`Añadir una unidad de ${item.product.name}`} onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}><Plus size={16} /></button>
                    </div>
                    <strong className="cart-item-total">Bs. {(item.product.price * item.quantity).toFixed(2)}</strong>
                  </li>
                ))}
              </ul>

              {/* Coupon Form */}
              <details className="cart-coupon">
                <summary><Tag size={16} /> {appliedDiscount ? `Cupón ${appliedDiscount.code}` : "¿Tienes un cupón?"}<Plus size={16} /></summary>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-900 absolute left-2.5 top-2.5" />
                    <input
                      id="coupon-input"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código de cupón"
                      aria-label="Código de cupón"
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#faf9f5] border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                  <button
                    id="apply-coupon-btn"
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
                  >
                    Aplicar
                  </button>
                </form>

                {appliedDiscount && (
                  <p className="text-[11px] text-emerald-900 font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Cupón{" "}
                    {appliedDiscount.code} aplicado.
                    <button type="button" className="text-link" onClick={clearCoupon}>Quitar cupón</button>
                  </p>
                )}
                {appliedCode && !appliedDiscount && <p role="status">El cupón ya no cumple las condiciones. No se aplicó ningún descuento. <button type="button" className="text-link" onClick={clearCoupon}>Quitar cupón</button></p>}
                {couponError && (
                  <p role="alert" className="text-sm text-red-800 mt-1">
                    {couponError}
                  </p>
                )}
              </details>

              <p className="sample-note">Confirma los descuentos y el costo final de envío con la tienda.</p>
              <div className="cart-delivery-note">
                <Truck size={20} />
                <div>
                  <strong>{customerInfo.deliveryType === "delivery" ? "Entrega local · Cobija" : customerInfo.deliveryType === "pickup" ? "Recojo en tienda" : `Envío a ${customerInfo.city}`}</strong>
                  <p>{customerInfo.deliveryType === "delivery"
                    ? subtotal >= 150 ? "Tu selección alcanza la entrega sin costo estimada." : `Te faltan Bs. ${(150 - subtotal).toFixed(2)} para la entrega sin costo estimada.`
                    : customerInfo.deliveryType === "pickup" ? "Sin costo de envío. Coordina el recojo con la tienda." : "Tarifa estimada de Bs. 25. Confirma el envío con la tienda."}</p>
                  {customerInfo.deliveryType === "delivery" && <progress value={Math.min(subtotal, 150)} max={150} aria-label="Avance hacia la entrega sin costo" />}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: CHECKOUT INFO */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-emerald-900">
                  Datos de entrega
                </span>
                <button
                  id="back-to-cart-btn"
                  onClick={() => setStep("cart")}
                  className="text-xs text-emerald-900 hover:underline"
                >
                  <ArrowLeft size={16} className="inline"/> Modificar carrito
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="customer-name-input"
                    className="block text-[11px] font-semibold text-stone-800 mb-1"
                  >
                    Nombre completo *
                  </label>
                  <input
                    id="customer-name-input"
                    autoComplete="name"
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    placeholder="Tu nombre y apellido"
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-phone-input"
                    className="block text-[11px] font-semibold text-stone-800 mb-1"
                  >
                    Celular o WhatsApp *
                  </label>
                  <input
                    id="customer-phone-input"
                    autoComplete="tel"
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Tu número de celular"
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-city-input"
                    className="block text-[11px] font-semibold text-stone-800 mb-1"
                  >
                    Ciudad de destino *
                  </label>
                  <input
                    id="customer-city-input"
                    autoComplete="address-level2"
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-address-input"
                    className="block text-[11px] font-semibold text-stone-800 mb-1"
                  >
                    Dirección o referencia
                  </label>
                  <textarea
                    id="customer-address-input"
                    autoComplete="street-address"
                    rows={2}
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Ej. Av. Pando esq. Acre, casa color verde frente a la plaza"
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-800 resize-none"
                  />
                </div>

                {/* Delivery Type Radios */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1.5">
                    Modalidad de entrega (estimación)
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      {
                        id: "delivery",
                        label: "Entrega local en Cobija",
                        cost: subtotal >= 150 ? "Sin costo" : "Bs. 10",
                      },
                      {
                        id: "national_shipping",
                        label: "Envío nacional",
                        cost: "Bs. 25",
                      },
                      {
                        id: "pickup",
                        label: "Recojo en Cobija",
                        cost: "Sin costo",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          customerInfo.deliveryType === opt.id
                            ? "bg-[#e5ebdf]/20 border-emerald-800 text-emerald-900 font-semibold"
                            : "bg-stone-100 border-stone-200 text-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={customerInfo.deliveryType === opt.id}
                            onChange={() =>
                              setCustomerInfo({
                                ...customerInfo,
                                deliveryType: opt.id as DeliveryType,
                              })
                            }
                            className="accent-emerald-800"
                          />
                          <span>{opt.label}</span>
                        </div>
                        <span className="text-emerald-900 font-bold">
                          {opt.cost}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1.5">
                    Preferencia de pago (por coordinar)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "qr", label: "QR", icon: QrCode },
                      { id: "cash", label: "Efectivo", icon: Banknote },
                      {
                        id: "transfer",
                        label: "Transferencia",
                        icon: CreditCard,
                      },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSel = customerInfo.paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          aria-pressed={isSel}
                          type="button"
                          onClick={() =>
                            setCustomerInfo({
                              ...customerInfo,
                              paymentMethod: pm.id as PaymentMethod,
                            })
                          }
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                            isSel
                              ? "bg-[#e5ebdf] text-stone-950 font-bold border-emerald-800"
                              : "bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-[10px] leading-tight">
                            {pm.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customer-notes-input"
                    className="block text-[11px] font-semibold text-stone-800 mb-1"
                  >
                    Notas adicionales (opcional)
                  </label>
                  <input
                    id="customer-notes-input"
                    type="text"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Horario preferido, si es para regalo, etc."
                    className="w-full px-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Action */}
        {cart.length > 0 && (
          <div className="cart-summary p-4 bg-[#faf9f5] border-t border-stone-200 space-y-3">
            {/* Breakdown table */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>Bs. {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-900">
                  <span>Descuento ({appliedDiscount?.code}):</span>
                  <span>-Bs. {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Envío estimado:</span>
                <span>
                  {shippingCost === 0
                    ? "Sin costo"
                    : `Bs. ${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-grand-total">
                <span>Total estimado:</span>
                <span className="text-emerald-900 font-extrabold text-base">
                  Bs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {step === "cart" ? (
              <button
                id="proceed-checkout-btn"
                onClick={() => setStep("checkout")}
                className="w-full py-3 px-4 rounded-xl bg-[#e5ebdf] hover:bg-[#e5ebdf] text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <span>Continuar con la entrega</span>
                <ArrowRight size={18}/>
              </button>
            ) : (
              <div className="space-y-2">
                {checkoutError && (
                  <p role="alert" className="text-sm text-red-800">
                    {checkoutError}
                  </p>
                )}
                <button
                  id="complete-whatsapp-btn"
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-[#254f3b] hover:bg-emerald-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Preparar pedido en WhatsApp</span>
                </button>

                <p className="text-sm text-center text-stone-600 flex items-center justify-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-900" />
                  Disponibilidad y envío sujetos a confirmación
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
