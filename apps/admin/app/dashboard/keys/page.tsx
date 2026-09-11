'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { adminApi, type ActivationKey } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Key, Copy, Check, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface KeyStats {
  total: number;
  used: number;
  unused: number;
  expired: number;
}

export default function KeysPage() {
  const { token } = useAuthStore();
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [stats, setStats] = useState<KeyStats>({ total: 0, used: 0, unused: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({ exam_type: 'JAMB/UTME', count: 10, expiry_date: '' });
  const [generating, setGenerating] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchKeys();
    fetchStats();
  }, [currentPage, examTypeFilter]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const params: { page: number; limit: number; exam_type?: string } = {
        page: currentPage,
        limit: 10,
      };
      if (examTypeFilter !== 'all') {
        params.exam_type = examTypeFilter;
      }
      const response = await adminApi.listKeys(token!, params);
      setKeys(response.keys || []);
      setTotalPages(Math.ceil(response.total / 10) || 1);
    } catch {
      toast.error('Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStats(await adminApi.keyStats(token!));
    } catch {
      // silent
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.count < 1 || formData.count > 100) {
      toast.error('Count must be between 1 and 100');
      return;
    }
    try {
      setGenerating(true);
      const response = await adminApi.generateKeys(token!, formData);
      setGeneratedKeys(response.keys.map((k) => k.key_code) || []);
      setShowGenerated(true);
      setShowModal(false);
      fetchKeys();
      fetchStats();
      toast.success(`Generated ${formData.count} keys`);
    } catch {
      toast.error('Failed to generate keys');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    toast.success('Copied');
    setTimeout(() => {
      setCopiedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 2000);
  };

  const handleCopyAllKeys = async () => {
    await navigator.clipboard.writeText(generatedKeys.join('\n'));
    toast.success('All keys copied');
  };

  const handleDeactivate = async (keyId: string) => {
    try {
      await adminApi.deleteKey(token!, keyId);
      fetchKeys();
      fetchStats();
      toast.success('Key deactivated');
    } catch {
      toast.error('Failed');
    }
  };

  const handleSelectKey = (keyId: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(keyId);
      } else {
        next.delete(keyId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(new Set(keys.map((k) => k.id)));
    } else {
      setSelectedKeys(new Set());
    }
  };

  const handleDeactivateSelected = async () => {
    const selectedArray = Array.from(selectedKeys);
    if (selectedArray.length === 0) return;
    try {
      await Promise.all(selectedArray.map((id) => adminApi.deleteKey(token!, id)));
      setSelectedKeys(new Set());
      fetchKeys();
      fetchStats();
      toast.success(`Deactivated ${selectedArray.length} key(s)`);
    } catch {
      toast.error('Failed to deactivate some keys');
    }
  };

  const allSelected = keys.length > 0 && keys.every((k) => selectedKeys.has(k.id));

  const statCards = [
    {
      label: 'Total Keys',
      count: stats.total,
      variant: 'default' as const,
      icon: Key,
    },
    {
      label: 'Used Keys',
      count: stats.used,
      variant: 'secondary' as const,
      icon: Key,
    },
    {
      label: 'Available',
      count: stats.unused,
      variant: 'outline' as const,
      icon: Key,
    },
    {
      label: 'Expired',
      count: stats.expired,
      variant: 'destructive' as const,
      icon: Key,
    },
  ];

  const examTypes = ['JAMB/UTME', 'WAEC/SSCE', 'Post-UTME', 'BECE', 'NCEE'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activation Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate and manage activation keys
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Keys
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={examTypeFilter}
          onValueChange={(value) => {
            setExamTypeFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Exam Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exam Types</SelectItem>
            {examTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedKeys.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selectedKeys.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeactivateSelected}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Deactivate selected
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Key Code</TableHead>
              <TableHead>Exam Type</TableHead>
              <TableHead>Used/Max</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No keys found
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedKeys.has(key.id)}
                      onCheckedChange={(checked) =>
                        handleSelectKey(key.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {key.key_code}
                    </Badge>
                  </TableCell>
                  <TableCell>{key.exam_type}</TableCell>
                  <TableCell>
                    {key.used_count}/{key.max_uses}
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? 'default' : 'destructive'}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(key.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {key.expires_at
                      ? new Date(key.expires_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyKey(key.key_code)}
                      >
                        {copiedKeys.has(key.key_code) ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {key.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeactivate(key.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Keys</DialogTitle>
            <DialogDescription>
              Create new activation keys for the selected exam type.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-type">Exam Type</Label>
              <Select
                value={formData.exam_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, exam_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Count (1-100)</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={formData.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    count: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date (Optional)</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generating}>
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showGenerated} onOpenChange={setShowGenerated}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generated Keys</DialogTitle>
            <DialogDescription>
              {generatedKeys.length} keys have been generated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {generatedKeys.join('\n')}
            </pre>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerated(false)}
            >
              Close
            </Button>
            <Button onClick={handleCopyAllKeys}>
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
