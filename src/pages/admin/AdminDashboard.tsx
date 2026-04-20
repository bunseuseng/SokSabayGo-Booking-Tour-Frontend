import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Car, UserCheck, ShieldAlert, Loader2,
  CheckCircle2, XCircle, Search, RefreshCw,
  ChevronLeft, ChevronRight, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { api, ADMIN_MANAGEMENT_API } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  roles: string[];
  status: string;
  createdAt: string;
}

interface StatsData {
  totalUsers: number;
  totalDrivers: number;
  pendingDriverApplications: number;
  activeNow: number;
  activeTrips: number;
}

// Spring Boot Page response shape
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Avatar ───────────────────────────────────────────────────────────────
const Avatar = ({ src, name }: { src?: string; name: string }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return src ? (
    <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-border flex-shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-border">
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => {
  const label = role.replace("ROLE_", "");
  const styles: Record<string, string> = {
    ADMIN:  "bg-purple-100 text-purple-700 border-purple-200",
    DRIVER: "bg-blue-100   text-blue-700   border-blue-200",
    USER:   "bg-slate-100  text-slate-600  border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[label] ?? styles.USER}`}>
      {label}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
      isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {status || "UNKNOWN"}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, color, loading,
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; loading: boolean;
}) => (
  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 280 }}>
    <Card className="border border-border shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted/60">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 w-16 bg-muted animate-pulse rounded-lg" />
        ) : (
          <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-border">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-muted animate-pulse rounded-lg w-3/4" />
      </td>
    ))}
  </tr>
);

const chartData = [
  { month: "Jan", users: 400, drivers: 240 },
  { month: "Feb", users: 700, drivers: 320 },
  { month: "Mar", users: 1200, drivers: 450 },
  { month: "Apr", users: 1800, drivers: 580 },
];

const PAGE_SIZE = 8;

// ─── Main Dashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
    totalUsers: 0, totalDrivers: 0,
    pendingDriverApplications: 0, activeNow: 0, activeTrips: 0,
  });
  const [users, setUsers]             = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]               = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ── 1. Fetch Stats — GET /api/v1/admin/stats/summary ─────────────────
  useEffect(() => {
    api.get(ADMIN_MANAGEMENT_API.STATS_SUMMARY)
      .then(({ data }) => setStatsData(data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  // ── 2. Fetch Users — GET /api/v1/admin/users ─────────────────────────
  // Backend uses Spring @PageableDefault — params go as URL query strings:
  // GET /api/v1/admin/users?page=0&size=8&sort=id,desc
  const fetchUsers = useCallback(() => {
    setUsersLoading(true);

    const params: Record<string, any> = {
      page,
      size: PAGE_SIZE,
      sort: "id,desc",   // matches @PageableDefault(sort = "id")
    };

    api.get(ADMIN_MANAGEMENT_API.LIST_USERS, { params })
      .then(({ data }) => {
        // Spring Boot Page<UserResponse> — array lives in .content
        const pageData: PageResponse<AdminUser> = data;
        setUsers(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search input 400ms (ready for when backend adds search support)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const stats = [
    { label: "Total Users",     value: statsData.totalUsers,                icon: Users,       color: "text-blue-500"   },
    { label: "Total Drivers",   value: statsData.totalDrivers,              icon: Car,         color: "text-green-500"  },
    { label: "Pending Drivers", value: statsData.pendingDriverApplications, icon: ShieldAlert, color: "text-amber-500"  },
    { label: "Active Now",      value: statsData.activeNow,                 icon: UserCheck,   color: "text-purple-500" },
    { label: "Active Trips",    value: statsData.activeTrips,               icon: TrendingUp,  color: "text-rose-500"   },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users and monitor platform performance.</p>
      </motion.div>

      {/* ── Stats Cards (5 cards including activeTrips) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...s} loading={statsLoading} />
          </motion.div>
        ))}
      </div>

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="shadow-sm border border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Registration Trends</CardTitle>
            <p className="text-xs text-muted-foreground">Placeholder data — wire up /api/v1/admin/stats/registrations when ready</p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="users"   stroke="#3b82f6" fill="url(#colorUsers)"   strokeWidth={2} />
                <Area type="monotone" dataKey="drivers" stroke="#10b981" fill="url(#colorDrivers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── User & Driver Table ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="shadow-sm border border-border overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Users & Drivers</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {usersLoading ? "Loading..." : `${totalElements.toLocaleString()} total members`}
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring w-44"
                  />
                </div>

                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_DRIVER">Driver</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="p-2 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={`text-muted-foreground ${usersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading ? (
                  [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                      <Users size={36} className="mx-auto mb-3 opacity-20" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {users.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.profileImage} name={user.fullName} />
                            <div>
                              <p className="font-medium text-foreground text-sm leading-tight">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {user.phoneNumber || "—"}
                        </td>

                        {/* Roles */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(user.roles || []).map((r) => <RoleBadge key={r} role={r} />)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={user.status} />
                        </td>

                        {/* Join date */}
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Ban / Unban */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={async () => {
                              const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
                              try {
                                // 📌 Wire this up when your backend has the endpoint:
                                // PATCH /api/v1/admin/users/{id}/status  body: { status }
                                await api.patch(`/api/v1/admin/users/${user.id}/status`, { status: newStatus });
                                setUsers((prev) =>
                                  prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u)
                                );
                              } catch {
                                console.error("Failed to update status");
                              }
                            }}
                            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                              user.status === "ACTIVE"
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                            }`}
                          >
                            {user.status === "ACTIVE" ? "Ban" : "Unban"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                        pageNum === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;