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

  // Get requests by city for collectors
  getRequestsByCity(city: string): CollectionRequest[] {
    return this.getAllRequests().filter(request => 
      request.status === 'pending' && 
      request.pickupAddress.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Get a single request by ID
  getRequestById(requestId: string): CollectionRequest | null {
    const requests = this.getAllRequests();
    return requests.find(r => r.id === requestId) || null;
  }

  // Update request status with optional collector ID
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

  // Complete a collection with actual quantity and notes
  completeCollection(
    requestId: string, 
    actualQuantity: number, 
    collectionNotes?: string
  ): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'completed';
      requests[index].actualQuantity = actualQuantity;
      requests[index].collectionNotes = collectionNotes;
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  // Reject a collection with reason
  rejectCollection(requestId: string, rejectionReason: string): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'rejected';
      requests[index].rejectionReason = rejectionReason;
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  // Start collection (change status to in_progress)
  startCollection(requestId: string): void {
    this.updateRequestStatus(requestId, 'in_progress');
  }

  // Add photos to a collection request
  addPhotos(requestId: string, photos: string[]): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].photos = requests[index].photos || [];
      requests[index].photos.push(...photos);
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }

  // Get pending requests count for a specific city
  getPendingRequestsCount(city: string): number {
    return this.getRequestsByCity(city).length;
  }

  // Get all requests for a specific status
  getRequestsByStatus(status: CollectionRequest['status']): CollectionRequest[] {
    return this.getAllRequests().filter(request => request.status === status);
  }

  // Delete a request (if needed)
  deleteRequest(requestId: string): void {
    const requests = this.getAllRequests().filter(r => r.id !== requestId);
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
  }

  // Update request details (for editing requests)
  updateRequest(requestId: string, updates: Partial<CollectionRequest>): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    }
  }
}