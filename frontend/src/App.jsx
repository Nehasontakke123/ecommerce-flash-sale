import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationRail } from "./components/NotificationRail";
import { ThemeToggle } from "./components/ThemeToggle";
import { useSocket } from "./hooks/useSocket";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { FlashSalePage } from "./pages/FlashSalePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { FailedPage, ProcessingPage, QueuePage, SoldOutPage, SuccessPage } from "./pages/StatusPages";

function AppShell() {
  const { token } = useAuth();
  const [publicScreen, setPublicScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [screen, setScreen] = useState("sale");
  const [product, setProduct] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket(token);

  const pushNotice = (message) => {
    setNotifications((current) => [{ id: crypto.randomUUID(), message }, ...current].slice(0, 6));
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("saleStarted", () => pushNotice("Sale is live."));
    socket.on("livePurchase", (payload) => pushNotice(`Confirmed purchases: ${payload.soldCount}`));
    socket.on("paymentProcessing", () => {
      setScreen("processing");
      pushNotice("Payment processing started.");
    });
    socket.on("paymentSuccess", () => {
      toast.success("Payment successful");
      setScreen("success");
    });
    socket.on("paymentFailed", (payload) => {
      toast.error(payload?.reason || "Payment failed");
      setScreen("failed");
    });
    socket.on("saleEnded", () => setScreen("soldout"));

    return () => {
      socket.off("saleStarted");
      socket.off("livePurchase");
      socket.off("paymentProcessing");
      socket.off("paymentSuccess");
      socket.off("paymentFailed");
      socket.off("saleEnded");
    };
  }, [socket]);

  if (!token && publicScreen === "landing") {
    return (
      <>
        <LandingPage
          onLogin={() => {
            setAuthMode("login");
            setPublicScreen("auth");
          }}
          onRegister={() => {
            setAuthMode("register");
            setPublicScreen("auth");
          }}
        />
        <Toaster position="bottom-left" toastOptions={{ style: { background: "#111827", color: "#fff", border: "1px solid rgba(255,255,255,.12)" } }} />
      </>
    );
  }

  if (!token) return <AuthPage key={authMode} initialMode={authMode} onBack={() => setPublicScreen("landing")} />;

  return (
    <>
      <NotificationRail notifications={notifications} />
      <div className="fixed bottom-4 right-4 z-30 flex gap-2">
        <ThemeToggle />
        <button className="icon-button" title="Admin dashboard" onClick={() => setScreen("admin")}>A</button>
      </div>
      {screen === "sale" && <FlashSalePage socket={socket} product={product} setProduct={setProduct} queuePosition={queuePosition} setQueuePosition={setQueuePosition} setScreen={setScreen} />}
      {screen === "queue" && <QueuePage queuePosition={queuePosition} />}
      {screen === "processing" && <ProcessingPage />}
      {screen === "success" && <SuccessPage onHome={() => setScreen("sale")} />}
      {screen === "failed" && <FailedPage onHome={() => setScreen("sale")} />}
      {screen === "soldout" && <SoldOutPage onHome={() => setScreen("sale")} />}
      {screen === "admin" && <AdminDashboard socket={socket} onHome={() => setScreen("sale")} />}
      <Toaster position="bottom-left" toastOptions={{ style: { background: "#111827", color: "#fff", border: "1px solid rgba(255,255,255,.12)" } }} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
