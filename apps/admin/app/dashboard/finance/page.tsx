'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { adminApi, type FinancePayment } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, DollarSign, CreditCard, Clock3, XCircle, TrendingUp, ChevronLeft, ChevronRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancePage() {
  const { token } = useAuthStore();
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [summary, setSummary] = useState({ total_revenue: 0, successful_count: 0, pending_count: 0, failed_count: 0 });

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, search]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.listPayments(token, {
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setPayments(res.payments);
      setTotal(res.total);
      setTotalPages(Math.ceil(res.total / 20));
      setSummary({
        total_revenue: res.total_revenue,
        successful_count: res.successful_count,
        pending_count: res.pending_count,
        failed_count: res.failed_count,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'success': return 'bg-emerald-500/10 text-emerald-700';
      case 'pending': return 'bg-amber-500/10 text-amber-700';
      case 'failed': return 'bg-red-500/10 text-red-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-emerald-600" />
                Finance
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Track all payments and revenue</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">N{(summary.total_revenue / 100).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{summary.successful_count.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{summary.pending_count.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{summary.failed_count.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name, email, or reference..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-sm"
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>{total} total payments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
              <DollarSign className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.user_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{p.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        N{(p.amount / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColor(p.status)}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
