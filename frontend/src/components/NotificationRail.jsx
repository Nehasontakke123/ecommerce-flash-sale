export function NotificationRail({ notifications }) {
  return (
    <div className="fixed right-4 top-4 z-40 flex w-[min(360px,calc(100vw-32px))] flex-col gap-3">
      {notifications.slice(0, 4).map((item) => (
        <div key={item.id} className="premium-card animate-slide p-3 text-sm">
          {item.message}
        </div>
      ))}
    </div>
  );
}
