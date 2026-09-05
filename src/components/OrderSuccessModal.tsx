import React from "react";
import { OrderCustomerInfo, CartItem } from "../types";
import { MessageCircle, X } from "lucide-react";
import { useDialog } from "./useDialog";
interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    total: number;
    info: OrderCustomerInfo;
    items: CartItem[];
  } | null;
}
export function OrderSuccessModal({
  isOpen,
  onClose,
  orderData,
}: OrderSuccessModalProps) {
  const dialogRef = useDialog(isOpen, onClose);
  if (!isOpen || !orderData) return null;
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Solicitud preparada"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div className="bg-[#faf9f5] text-stone-800 rounded-lg p-7 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <MessageCircle size={28} />
          <button onClick={onClose} aria-label="Cerrar resumen" className="p-3">
            <X size={20} />
          </button>
        </div>
        <h2 className="text-3xl mb-4">Tu solicitud está preparada</h2>
        <p className="text-sm leading-relaxed mb-5">
          Completa el envío del mensaje en WhatsApp. La tienda debe confirmar
          disponibilidad, entrega y pago; tu carrito sigue guardado.
        </p>
        <dl className="text-sm border-y border-stone-200 py-4 space-y-3 mb-5">
          <div className="flex justify-between">
            <dt>Referencia de consulta</dt>
            <dd>{orderData.orderNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Total estimado</dt>
            <dd>Bs. {orderData.total.toFixed(2)}</dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed mb-6">
          Si WhatsApp no se abrió, vuelve al carrito e inténtalo de nuevo.
          Solicita los datos de pago directamente a la tienda.
        </p>
        <button className="primary-button w-full" onClick={onClose}>
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}
