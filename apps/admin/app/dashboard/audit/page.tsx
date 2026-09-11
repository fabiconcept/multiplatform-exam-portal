'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { adminApi, type AuditLogEntry } from '@/lib/api';
import { Search, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function AuditLogPage() {
  const { token } = useAuthStore();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [adminSearch, setAdminSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    if (!token) return;
    fetchAuditLog();
  }, [token, page, actionFilter]);

  async function fetchAuditLog() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: pageSize };
      if (actionFilter) params.action = actionFilter;
      const res = await adminApi.listAuditLog(token!, params);
      let filtered = res.entries;
      if (adminSearch)
        filtered = filtered.filter((e) =>
          e.admin_email.toLowerCase().includes(adminSearch.toLowerCase())
        );
      if (dateStart)
        filtered = filtered.filter(
          (e) => new Date(e.created_at) >= new Date(dateStart)
        );
      if (dateEnd) {
        const d = new Date(dateEnd);
        d.setHours(23, 59, 59, 999);
        filtered = filtered.filter((e) => new Date(e.created_at) <= d);
      }
      setEntries(filtered);
      setTotal(
        adminSearch || dateStart || dateEnd ? filtered.length : res.total
      );
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function actionBadgeVariant(action: string) {
    switch (action) {
      case 'login':
        return 'secondary' as const;
      case 'logout':
        return 'outline' as const;
      case 'create':
        return 'default' as const;
      case 'update':
        return 'secondary' as const;
      case 'delete':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  }

  function actionBadgeClass(action: string) {
    switch (action) {
      case 'login':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50';
      case 'logout':
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50';
      case 'create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50';
      case 'update':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50';
      case 'delete':
        return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-50';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50';
    }
  }

  function handleExport() {
    const headers = [
      'Timestamp',
      'Admin',
      'Action',
      'Target Type',
      'Target ID',
      'IP Address',
      'Details',
    ];
    const rows = entries.map((e) => [
      e.created_at,
      e.admin_email,
      e.action,
      e.target_type,
      e.target_id || '',
      e.ip_address || '',
      e.details || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all admin actions
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Admin Email</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search email..."
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 sm:w-48"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Action Type</Label>
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setActionFilter(value === 'all' ? '' : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-36">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No audit log entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatTimestamp(entry.created_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {entry.admin_email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={actionBadgeVariant(entry.action)}
                        className={cn('border', actionBadgeClass(entry.action))}
                      >
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {entry.target_type || '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {entry.ip_address || '—'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {entry.details || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
    </div>
  );
}
