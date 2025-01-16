import { HttpEvent, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const requestId = _generateRequestId();
  loadingService.startRequest(requestId);

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress || event.type === HttpEventType.DownloadProgress) {
          const progress = Math.round((100 * event.loaded) / event.total!);
          loadingService.updateProgress(requestId, progress);
        } else if (event.type === HttpEventType.Response) {
          loadingService.completeRequest(requestId);
        }
      },
      error: (error) => {
        loadingService.errorRequest(requestId);
      },
    }),
    finalize(() => {
      // 確保請求一定會被清理
      if (loadingService.getRequestProgress(requestId)) {
        loadingService.completeRequest(requestId);
      }
    }),
  );
};

const _generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};
