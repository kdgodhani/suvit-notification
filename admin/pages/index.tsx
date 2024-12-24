import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';

interface Notification {
  _id: string;
  userId: string;
  channel: string;
  content: string;
  status: string;
  createdAt: string;
}

interface HomeProps {
  initialNotifications: Notification[];
}

const Home: React.FC<HomeProps> = ({ initialNotifications }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [error, setError] = useState<string | null>(null);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(initialNotifications);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        setNotifications(data.notifications);
        setFilteredNotifications(data.notifications);
      } catch (err) {
        setError('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...notifications];

      // Apply Status Filter
      if (statusFilter) {
        filtered = filtered.filter(notification => notification.status.toLowerCase().includes(statusFilter.toLowerCase()));
      }

      // Apply Channel Filter
      if (channelFilter) {
        filtered = filtered.filter(notification => notification.channel.toLowerCase().includes(channelFilter.toLowerCase()));
      }

      // Apply Date Range Filter
      if (startDate || endDate) {
        filtered = filtered.filter(notification => {
          const createdAt = new Date(notification.createdAt);

          const start = startDate ? new Date(startDate) : new Date('1900-01-01'); // Set very old date if no startDate
          const end = endDate ? new Date(endDate) : new Date(); // Set current date if no endDate

          return createdAt >= start && createdAt <= end;
        });
      }

      setFilteredNotifications(filtered);
    };

    applyFilters();
  }, [statusFilter, channelFilter, startDate, endDate, notifications]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Notification Admin Panel</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      <div className="mb-6 flex justify-between">
        <div className="flex gap-4">
          <select
            className="border px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          <select
            className="border px-3 py-2"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="">All Channels</option>
            <option value="push">Push</option>
            <option value="sms">Sms</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div className="flex gap-4">
          <input
            type="date"
            className="border px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200 shadow-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">User ID</th>
            <th className="py-2 px-4 border-b">Channel</th>
            <th className="py-2 px-4 border-b">Content</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <tr key={notification._id}>
                <td className="py-2 px-4 border-b">{notification._id}</td>
                <td className="py-2 px-4 border-b">{notification.userId}</td>
                <td className="py-2 px-4 border-b">{notification.channel}</td>
                <td className="py-2 px-4 border-b">{notification.content}</td>
                <td className="py-2 px-4 border-b">{notification.status}</td>
                <td className="py-2 px-4 border-b">{new Date(notification.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-2 px-4 border-b text-center">No notifications found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/notifications');
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const data = await res.json();
    return {
      props: {
        initialNotifications: data.notifications,
      },
    };
  } catch (error) {
    return {
      props: {
        initialNotifications: [],
      },
    };
  }
};

export default Home;
