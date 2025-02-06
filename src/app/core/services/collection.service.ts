import { Injectable } from '@angular/core';
import { CollectionRequest } from '../models/collection-request.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly REQUESTS_KEY = 'collection_requests';

  constructor() {}

  createRequest(request: CollectionRequest): void {
    const requests = this.getAllRequests();
    request.id = Date.now().toString();
    request.status = 'pending';
    request.createdAt = new Date().toISOString();
    requests.push(request);
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
  }

  getAllRequests(): CollectionRequest[] {
    return JSON.parse(localStorage.getItem(this.REQUESTS_KEY) || '[]');
  }

  getUserRequests(userId: string): CollectionRequest[] {
    return this.getAllRequests().filter(request => request.userId === userId);
  }

  getCollectorRequests(collectorId: string): CollectionRequest[] {
    return this.getAllRequests().filter(request => request.collectorId === collectorId);
  }

  updateRequestStatus(requestId: string, status: CollectionRequest['status'], collectorId?: string): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = status;
      if (collectorId) {
        requests[index].collectorId = collectorId;
      }
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }
}