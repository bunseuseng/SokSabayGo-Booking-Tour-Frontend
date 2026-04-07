import React, { useState, useEffect } from "react";
import { Users, Car, UserCheck, ShieldAlert, Loader2, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, ADMIN_MANAGEMENT_API } from "@/lib/api";

const chartData = [
  { month: "Jan", users: 400, drivers: 240 },
  { month: "Feb", users: 700, drivers: 320 },
  { month: "Mar", users: 1200, drivers: 450 },
  { month: "Apr", users: 1800, drivers: 580 },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    pendingDriverApplications: 0,
    activeNow: 0
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllAdminData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Stats Summary
        const statsRes = await api.get(ADMIN_MANAGEMENT_API.STATS_SUMMARY);
        setStatsData(statsRes.data);

        // 2. Fetch Paginated Users (defaulting to first page, size 5)
        const usersRes = await api.get(`${ADMIN_MANAGEMENT_API.LIST_USERS}?page=0&size=5`);
        // Spring Boot Page object puts the array in .content
        setUsers(usersRes.data.content || []);

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAdminData();
  }, []);

  const stats = [
    { label: "Total Users", value: statsData.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Drivers", value: statsData.totalDrivers, icon: Car, color: "text-green-500" },
    { label: "Pending Drivers", value: statsData.pendingDriverApplications, icon: ShieldAlert, color: "text-amber-500" },
    { label: "Active Now", value: statsData.activeNow, icon: UserCheck, color: "text-purple-500" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">Synchronizing with Backend...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and monitor platform performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                <Area type="monotone" dataKey="drivers" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card className="lg:col-span-6 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent User List</CardTitle>
            <button className="text-xs text-blue-600 hover:underline">View All Users</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-y">
                <tr>
                  <th className="p-4 text-left font-semibold">User</th>
                  <th className="p-4 text-left font-semibold">Roles</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length > 0 ? users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{user.fullName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {user.roles.map((role: string) => (
                          <span key={role} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status || 'OFFLINE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <button className="p-2 hover:bg-muted rounded-full">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No users found in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;