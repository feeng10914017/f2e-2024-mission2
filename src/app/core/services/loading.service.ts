import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

interface RequestInfo {
  id: string;
  progress: number;
  isComplete: boolean;
  error: boolean; // 錯誤標記
  cancel: boolean; // 取消標記
}

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = new Map<string, RequestInfo>();
  private requestsSubject = new BehaviorSubject<Map<string, RequestInfo>>(new Map());

  /** 發出更新 */
  private emitUpdate(): void {
    this.requestsSubject.next(new Map(this.activeRequests));
  }

  /** 清空所有請求 */
  private clearRequests(): void {
    // 檢查是否所有請求都已完成（包括出錯的）
    const allComplete = Array.from(this.activeRequests.values()).every((req) => req.isComplete);
    if (!allComplete) return;

    // 所有請求都完成後，延遲一段時間再清理
    setTimeout(() => {
      this.activeRequests.clear();
      this.emitUpdate();
    }, 500);
  }

  /** 開始新的請求 */
  startRequest(requestId: string): void {
    this.activeRequests.set(requestId, {
      id: requestId,
      progress: 0,
      isComplete: false,
      error: false,
      cancel: false,
    });
    this.emitUpdate();
  }

  /** 更新請求進度 */
  updateProgress(requestId: string, progress: number): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    request.progress = progress;
    this.emitUpdate();
  }

  /** 完成請求 */
  completeRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    request.isComplete = true;
    request.progress = 100;
    this.emitUpdate();
    this.clearRequests();
  }

  /** 請求發生錯誤 */
  errorRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    request.isComplete = true;
    request.progress = 100;
    request.error = true;
    this.emitUpdate();
    this.clearRequests();
  }

  /** 取消請求 */
  cancelRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    request.isComplete = true;
    request.progress = 100;
    request.cancel = true;
    this.emitUpdate();
    this.clearRequests();
  }

  /** 是否有活動中的請求 */
  get isLoading$(): Observable<boolean> {
    return this.requestsSubject.pipe(map((requests) => requests.size > 0));
  }

  /** 總體進度（考慮所有活動請求） */
  get totalProgress$(): Observable<number> {
    return this.requestsSubject.pipe(
      map((requests) => {
        if (requests.size === 0) return 0;

        const totalProgress = Array.from(requests.values()).reduce((acc, req) => acc + req.progress, 0);

        return Math.round(totalProgress / requests.size);
      }),
    );
  }

  /** 獲取特定請求的進度 */
  getRequestProgress(requestId: string): Observable<number> {
    return this.requestsSubject.pipe(map((requests) => requests.get(requestId)?.progress ?? 0));
  }
}
