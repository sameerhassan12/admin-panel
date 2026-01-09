'use client';

import { useEffect, useState } from 'react';
import { getProductStats } from '@/lib/firebase/products';
import { getUserStats } from '@/lib/firebase/users';
import { getPendingReports } from '@/lib/firebase/reports';
import { Package, Users, Flag, CheckCircle } from 'lucide-react';

interface Stats {
  products: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    sold: number;
  };
  users: {
    total: number;
    admins: number;
    banned: number;
    regular: number;
  };
  reports: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productStats, userStats, reports] = await Promise.all([
          getProductStats().catch(err => {
            console.error('Error loading product stats:', err);
            return { total: 0, pending: 0, approved: 0, rejected: 0, sold: 0 };
          }),
          getUserStats().catch(err => {
            console.error('Error loading user stats:', err);
            return { total: 0, admins: 0, banned: 0, regular: 0 };
          }),
          getPendingReports().catch(err => {
            console.error('Error loading reports:', err);
            return [];
          }),
        ]);

        setStats({
          products: productStats,
          users: userStats,
          reports: reports.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Set default stats on error
        setStats({
          products: { total: 0, pending: 0, approved: 0, rejected: 0, sold: 0 },
          users: { total: 0, admins: 0, banned: 0, regular: 0 },
          reports: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.products.total || 0}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Approval"
          value={stats?.products.pending || 0}
          icon={Flag}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Reports"
          value={stats?.reports || 0}
          icon={Flag}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Status</h2>
          <div className="space-y-3">
            <StatusItem label="Approved" value={stats?.products.approved || 0} color="text-green-600" />
            <StatusItem label="Pending" value={stats?.products.pending || 0} color="text-yellow-600" />
            <StatusItem label="Rejected" value={stats?.products.rejected || 0} color="text-red-600" />
            <StatusItem label="Sold" value={stats?.products.sold || 0} color="text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
          <div className="space-y-3">
            <StatusItem label="Regular Users" value={stats?.users.regular || 0} color="text-gray-600" />
            <StatusItem label="Admins" value={stats?.users.admins || 0} color="text-purple-600" />
            <StatusItem label="Banned" value={stats?.users.banned || 0} color="text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}


