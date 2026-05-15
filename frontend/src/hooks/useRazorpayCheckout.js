import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout({ onSuccess, onFailure }) {
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(async (payment) => {
    setLoading(true);
    const ready = await loadRazorpay();
    if (!ready) {
      setLoading(false);
      toast.error("Unable to load Razorpay checkout");
      onFailure?.("Razorpay checkout failed to load", payment);
      return;
    }

    let completed = false;
    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Astra X1 Flash Drop",
      description: payment.productName,
      order_id: payment.orderId,
      prefill: payment.user,
      theme: { color: "#7F5AF0" },
      modal: {
        ondismiss: async () => {
          if (completed) return;
          await api.post("/order/payment/fail", {
            razorpay_order_id: payment.orderId,
            reason: "Checkout dismissed"
          }).catch(() => null);
          setLoading(false);
          onFailure?.("Checkout dismissed", payment);
        }
      },
      handler: async (response) => {
        completed = true;
        try {
          await api.post("/order/payment/verify", response);
          toast.success("Payment verified. Order confirmed.");
          onSuccess?.(response);
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed");
          onFailure?.("Payment verification failed", payment);
        } finally {
          setLoading(false);
        }
      }
    });

    checkout.on("payment.failed", async (response) => {
      completed = true;
      await api.post("/order/payment/fail", {
        razorpay_order_id: payment.orderId,
        razorpay_payment_id: response.error?.metadata?.payment_id,
        reason: response.error?.description || "Payment failed"
      }).catch(() => null);
      setLoading(false);
      toast.error(response.error?.description || "Payment failed");
      onFailure?.(response.error?.description || "Payment failed", payment);
    });

    checkout.open();
  }, [onFailure, onSuccess]);

  return { openCheckout, paymentLoading: loading };
}
