'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useAuth } from '@/components/auth-provider';
import { adminApi, type AdminUser } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Power,
  PowerOff,
  RotateCcw,
  Pencil,
  Eye,
  KeyRound,
  Users,
  Ban,
  CheckCircle,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const { token } = useAuthStore();
  const { admin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    target_exam: '',
    target_score: '',
    role: 'user',
    is_active: true,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [resetModal, setResetModal] = useState<{ user: AdminUser; tempPassword: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token, page, debouncedSearch, roleFilter, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const params: { page: number; limit: number; search?: string; role?: string; is_active?: string } = {
        page,
        limit: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;
      const res = await adminApi.listUsers(token!, params);
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleBulkDeactivate() {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      let deactivated = 0;
      for (const id of selectedIds) {
        if (admin && id === admin.id) continue;
        const user = users.find((u) => u.id === id);
        if (user && user.is_active) {
          await adminApi.updateUser(token!, id, { is_active: false });
          deactivated++;
        }
      }
      toast.success(`Deactivated ${deactivated} user(s)`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate users');
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      let deleted = 0;
      for (const id of selectedIds) {
        if (admin && id === admin.id) continue;
        await adminApi.deleteUser(token!, id);
        deleted++;
      }
      toast.success(`Deleted ${deleted} user(s)`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch {
      toast.error('Failed to delete users');
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    if (admin && user.id === admin.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }
    try {
      await adminApi.updateUser(token!, user.id, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  }

  async function handleBan() {
    if (!banModal || !banReason.trim()) return;
    if (admin && banModal.id === admin.id) {
      toast.error("You cannot ban yourself");
      return;
    }
    setBanning(true);
    try {
      await adminApi.banUser(token!, banModal.id, banReason.trim());
      toast.success('User banned');
      setBanModal(null);
      setBanReason('');
      fetchUsers();
    } catch {
      toast.error('Failed to ban user');
    } finally {
      setBanning(false);
    }
  }

  async function handleUnban(user: AdminUser) {
    try {
      await adminApi.unbanUser(token!, user.id);
      toast.success('User unbanned');
      fetchUsers();
    } catch {
      toast.error('Failed to unban user');
    }
  }

  function handleEditClick(user: AdminUser) {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      school: user.school || '',
      target_exam: user.target_exam || '',
      target_score: user.target_score ? String(user.target_score) : '',
      role: user.role,
      is_active: user.is_active,
    });
  }

  async function handleEditSave() {
    if (!editUser) return;
    if (admin && editUser.id === admin.id && !editForm.is_active) {
      toast.error("You cannot deactivate your own account");
      return;
    }
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        school: editForm.school,
        target_exam: editForm.target_exam,
        role: editForm.role,
        is_active: editForm.is_active,
      };
      if (editForm.target_score) payload.target_score = Number(editForm.target_score);
      await adminApi.updateUser(token!, editUser.id, payload);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleResetPassword(user: AdminUser) {
    try {
      const res = await adminApi.resetPassword(token!, user.id);
      setResetModal({ user, tempPassword: res.temp_password });
    } catch {
      toast.error('Failed to reset password');
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    setDeleting(true);
    try {
      await adminApi.deleteUser(token!, user.id);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const allSelected = users.length > 0 && selectedIds.size === users.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < users.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6" />
                Users
              </CardTitle>
              <CardDescription>{total} total users</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 sm:w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-3">
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeactivate}
                disabled={bulkActionLoading}
              >
                <PowerOff className="mr-1.5 h-3.5 w-3.5" />
                Deactivate selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete selected
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isSelf = admin?.id === user.id;
                    const isSelected = selectedIds.has(user.id);
                    return (
                      <TableRow key={user.id} className={isSelected ? 'bg-muted/50' : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                                isSelf
                                  ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              {isSelf && (
                                <Badge variant="secondary" className="mt-0.5 text-[10px]">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.phone || '—'}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.target_exam || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === 'super_admin'
                                ? 'default'
                                : user.role === 'admin'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            {user.is_banned ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Banned
                              </Badge>
                            ) : user.is_active ? (
                              <Badge variant="default" className="flex items-center gap-1 bg-emerald-600">
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Free</Badge>
                            )}
                            {user.email_verified === false && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setViewUser(user)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(user)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-8 w-8',
                                  isSelf
                                    ? 'cursor-not-allowed text-muted-foreground/30'
                                    : user.is_active
                                      ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                      : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                )}
                                disabled={isSelf}
                                onClick={() => handleToggleActive(user)}
                                title={isSelf ? "Can't deactivate yourself" : user.is_active ? 'Deactivate (revoke premium)' : 'Activate (grant premium)'}
                              >
                                {user.is_active ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-8 w-8',
                                  isSelf
                                    ? 'cursor-not-allowed text-muted-foreground/30'
                                    : user.is_banned
                                      ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                      : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                                )}
                                disabled={isSelf}
                                onClick={() => user.is_banned ? handleUnban(user) : setBanModal(user)}
                                title={isSelf ? "Can't ban yourself" : user.is_banned ? 'Unban user' : 'Ban user'}
                              >
                                {user.is_banned ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleResetPassword(user)}
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteConfirm(user)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Viewing profile information for this user.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-3 text-sm">
              {[
                ['Name', viewUser.name],
                ['Email', viewUser.email],
                ['Phone', viewUser.phone || '—'],
                ['School', viewUser.school || '—'],
                ['Target Exam', viewUser.target_exam || '—'],
                ['Target Score', viewUser.target_score || '—'],
                ['Joined', formatDate(viewUser.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="text-muted-foreground">Role</span>
                <Badge
                  variant={
                    viewUser.role === 'super_admin'
                      ? 'default'
                      : viewUser.role === 'admin'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {viewUser.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant={viewUser.is_banned ? 'destructive' : viewUser.is_active ? 'default' : 'secondary'}>
                    {viewUser.is_banned ? 'Banned' : viewUser.is_active ? 'Premium' : 'Free'}
                  </Badge>
                  {viewUser.email_verified === false && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">Unverified</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile and settings.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-school">School</Label>
                  <Input
                    id="edit-school"
                    value={editForm.school}
                    onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target-exam">Target Exam</Label>
                  <Input
                    id="edit-target-exam"
                    value={editForm.target_exam}
                    onChange={(e) => setEditForm({ ...editForm, target_exam: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-target-score">Target Score</Label>
                  <Input
                    id="edit-target-score"
                    type="number"
                    value={editForm.target_score}
                    onChange={(e) => setEditForm({ ...editForm, target_score: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Select
                    value={editForm.is_active ? 'true' : 'false'}
                    onValueChange={(v) => setEditForm({ ...editForm, is_active: v === 'true' })}
                    disabled={admin?.id === editUser.id}
                  >
                    <SelectTrigger
                      className={cn(
                        admin?.id === editUser.id && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Premium (unlimited)</SelectItem>
                      <SelectItem value="false">Free (limited)</SelectItem>
                    </SelectContent>
                  </Select>
                  {admin?.id === editUser.id && (
                    <p className="text-xs text-amber-600">Cannot change your own access level</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetModal} onOpenChange={(open) => !open && setResetModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              Temporary password for{' '}
              <span className="font-semibold text-foreground">{resetModal?.user.name}</span>
            </DialogDescription>
          </DialogHeader>
          {resetModal && (
            <>
              <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                <code className="flex-1 select-all font-mono text-sm font-semibold">
                  {resetModal.tempPassword}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard(resetModal.tempPassword)}
                  title="Copy"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this temporary password with the user. They should change it on first login.
              </p>
            </>
          )}
          <DialogFooter>
            <Button onClick={() => setResetModal(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User Permanently</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-foreground">{deleteConfirm?.name}</span>?
                </p>
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <p className="font-medium mb-1">Deactivation vs Deletion:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Deactivate</strong> — User cannot log in but data is preserved. You can restore access anytime.</li>
                    <li><strong>Delete</strong> — All user data is permanently removed. This cannot be undone.</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consider deactivating instead if you might need to restore this account later.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={!!banModal} onOpenChange={(open) => !open && setBanModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              This will prevent <span className="font-semibold text-foreground">{banModal?.name}</span> from logging in or accessing any feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason for ban</Label>
            <Input
              id="ban-reason"
              placeholder="e.g. Violation of terms of service..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBan()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBanModal(null); setBanReason(''); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={!banReason.trim() || banning}>
              {banning ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
