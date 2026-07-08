import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications } from '../../api/notifications';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const { data } = await getNotifications();
        if (active) setUnread(data.unread || 0);
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => { active = false; clearInterval(id); };
  }, []);

  return (
    <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-gray-900" title="Notifications">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
