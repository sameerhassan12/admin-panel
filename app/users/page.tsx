'use client';

import { useEffect, useState } from 'react';
import { getUsers, banUser, unbanUser, makeAdmin, removeAdmin, User } from '@/lib/firebase/users';
import { Shield, Ban, UserCheck, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      alert(error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await banUser(userId);
      await loadUsers();
      alert('User banned successfully!');
    } catch (error: any) {
      alert(error?.message || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      await loadUsers();
      alert('User unbanned successfully!');
    } catch (error: any) {
      alert(error?.message || 'Failed to unban user');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await makeAdmin(userId);
      await loadUsers();
      alert('User is now an admin!');
    } catch (error: any) {
      alert(error?.message || 'Failed to make user admin');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin privileges?')) return;
    try {
      await removeAdmin(userId);
      await loadUsers();
      alert('Admin privileges removed!');
    } catch (error: any) {
      alert(error?.message || 'Failed to remove admin privileges');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isBanned = (user as any).isBanned;
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {user.isAdmin && (
                            <span className="text-xs text-purple-600 font-semibold">Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.bidCredits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isBanned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleMakeAdmin(user.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Make Admin"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                        )}
                        {user.isAdmin && (
                          <button
                            onClick={() => handleRemoveAdmin(user.id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Remove Admin"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        )}
                        {!isBanned ? (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Ban User"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Unban User"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}


