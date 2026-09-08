import crypto from 'crypto';

interface OfflineExam {
  id: string;
  data: any;
  downloadedAt: string;
}

interface OfflineResult {
  id: string;
  examId: string;
  data: any;
  synced: boolean;
  createdAt: string;
}

export class OfflineStore {
  private exams: Map<string, OfflineExam> = new Map();
  private results: Map<string, OfflineResult> = new Map();
  private pendingSync: string[] = [];
  isOffline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.loadFromStorage();
      window.addEventListener('online', () => { this.isOffline = false; this.syncPending(); });
      window.addEventListener('offline', () => { this.isOffline = true; });
    }
  }

  private loadFromStorage() {
    try {
      const exams = localStorage.getItem('offline_exams');
      const results = localStorage.getItem('offline_results');
      if (exams) JSON.parse(exams).forEach((e: OfflineExam) => this.exams.set(e.id, e));
      if (results) JSON.parse(results).forEach((r: OfflineResult) => this.results.set(r.id, r));
    } catch {}
  }

  private persistToStorage() {
    try {
      localStorage.setItem('offline_exams', JSON.stringify(Array.from(this.exams.values())));
      localStorage.setItem('offline_results', JSON.stringify(Array.from(this.results.values())));
    } catch {}
  }

  async saveExam(exam: any): Promise<{ success: boolean }> {
    const entry: OfflineExam = { id: exam.id, data: exam, downloadedAt: new Date().toISOString() };
    this.exams.set(exam.id, entry);
    this.persistToStorage();
    return { success: true };
  }

  async getExams(): Promise<any[]> {
    return Array.from(this.exams.values()).map(e => e.data);
  }

  async saveResult(result: any): Promise<{ success: boolean }> {
    const id = crypto.randomUUID();
    const entry: OfflineResult = { id, examId: result.examId, data: result, synced: false, createdAt: new Date().toISOString() };
    this.results.set(id, entry);
    this.pendingSync.push(id);
    this.persistToStorage();
    return { success: true };
  }

  async getResults(): Promise<any[]> {
    return Array.from(this.results.values()).map(r => ({ ...r.data, id: r.id, synced: r.synced }));
  }

  async syncPending(): Promise<{ synced: number; failed: number }> {
    if (this.isOffline) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const id of this.pendingSync) {
      const result = this.results.get(id);
      if (!result) continue;

      try {
        const response = await fetch('http://localhost:4000/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });
        if (response.ok) {
          result.synced = true;
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    this.pendingSync = this.pendingSync.filter(id => !this.results.get(id)?.synced);
    this.persistToStorage();
    return { synced, failed };
  }

  async getPendingCount(): Promise<number> {
    return this.pendingSync.length;
  }
}
