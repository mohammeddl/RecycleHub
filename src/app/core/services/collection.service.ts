import { Injectable } from '@angular/core';
import { CollectionRequest } from '../models/collection-request.model';
import { PointsService } from './points.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly REQUESTS_KEY = 'collection_requests';

  constructor(private pointsService: PointsService) {}

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
    return this.getAllRequests().filter((request) => request.userId === userId);
  }

  getCollectorRequests(collectorId: string): CollectionRequest[] {
    return this.getAllRequests().filter(
      (request) => request.collectorId === collectorId
    );
  }

  getRequestsByCity(city: string): CollectionRequest[] {
    return this.getAllRequests().filter(
      (request) =>
        request.status === 'pending' &&
        request.pickupAddress.toLowerCase().includes(city.toLowerCase())
    );
  }

  getRequestById(requestId: string): CollectionRequest | null {
    const requests = this.getAllRequests();
    return requests.find((r) => r.id === requestId) || null;
  }

  updateRequestStatus(
    requestId: string,
    status: CollectionRequest['status'],
    collectorId?: string
  ): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].status = status;
      if (collectorId) {
        requests[index].collectorId = collectorId;
      }
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  completeCollection(
    requestId: string,
    actualQuantity: number,
    collectionNotes?: string
  ): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      const request = requests[index];
      request.status = 'completed';
      request.actualQuantity = actualQuantity;
      request.collectionNotes = collectionNotes;
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));

      if (request.collectorId) {
        this.pointsService.addPoints(request.collectorId, request);
      }
    }
  }

  // Reject a collection with reason
  rejectCollection(requestId: string, rejectionReason: string): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'rejected';
      requests[index].rejectionReason = rejectionReason;
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  startCollection(requestId: string): void {
    this.updateRequestStatus(requestId, 'in_progress');
  }
  addPhotos(requestId: string, photos: string[]): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].photos = requests[index].photos || [];
      requests[index].photos.push(...photos);
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  getPendingRequestsCount(city: string): number {
    return this.getRequestsByCity(city).length;
  }

  getRequestsByStatus(
    status: CollectionRequest['status']
  ): CollectionRequest[] {
    return this.getAllRequests().filter((request) => request.status === status);
  }

  deleteRequest(requestId: string): void {
    const requests = this.getAllRequests().filter((r) => r.id !== requestId);
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
  }

  updateRequest(requestId: string, updates: Partial<CollectionRequest>): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }
}
