import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">My Requests</h2>
          <a routerLink="/dashboard/create-request" 
             class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create New Request
          </a>
        </div>

        <!-- Request Cards -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let request of requests" 
               class="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <!-- Request Header -->
            <div class="flex justify-between items-start">
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': request.status === 'pending',
                      'bg-blue-100 text-blue-800': request.status === 'accepted',
                      'bg-green-100 text-green-800': request.status === 'completed',
                      'bg-red-100 text-red-800': request.status === 'rejected',
                      'bg-purple-100 text-purple-800': request.status === 'in_progress'
                    }">
                {{request.status | titlecase}}
              </span>
              <span class="text-sm text-gray-500">
                {{request.createdAt | date}}
              </span>
            </div>

            <!-- Request Details -->
            <div class="space-y-3">
              <div>
                <span class="text-sm font-medium text-gray-500">Waste Type</span>
                <p class="text-gray-900">{{request.wasteType}}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Quantity</span>
                <p class="text-gray-900">{{request.quantity}} kg</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Pickup Date</span>
                <p class="text-gray-900">{{request.pickupDate | date}}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Address</span>
                <p class="text-gray-900">{{request.pickupAddress}}</p>
              </div>
              <div *ngIf="request.description">
                <span class="text-sm font-medium text-gray-500">Description</span>
                <p class="text-gray-900">{{request.description}}</p>
              </div>
              <div *ngIf="request.collectionNotes">
                <span class="text-sm font-medium text-gray-500">Collection Notes</span>
                <p class="text-gray-900">{{request.collectionNotes}}</p>
              </div>
              <div *ngIf="request.actualQuantity">
                <span class="text-sm font-medium text-gray-500">Actual Quantity</span>
                <p class="text-gray-900">{{request.actualQuantity}} kg</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 flex justify-end space-x-2" *ngIf="request.status === 'pending'">
              <button (click)="editRequest(request.id!)"
                      class="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                Edit
              </button>
              <button (click)="deleteRequest(request.id!)"
                      class="px-3 py-1 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="requests.length === 0" 
             class="text-center py-12">
          <p class="text-gray-500">No requests found</p>
          <p class="mt-2 text-sm text-gray-400">Create a new request to get started</p>
        </div>
      </div>
    </div>
  `
})
export class RequestListComponent implements OnInit {
  requests: CollectionRequest[] = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    if (this.currentUser.role === 'individual') {
      this.requests = this.collectionService.getUserRequests(this.currentUser.id);
    } else {
      this.requests = this.collectionService.getCollectorRequests(this.currentUser.id);
    }
    // Sort requests by creation date (newest first)
    this.requests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  editRequest(requestId: string) {
    this.router.navigate(['/dashboard/edit-request', requestId]);
  }

  deleteRequest(requestId: string) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.collectionService.deleteRequest(requestId);
      this.loadRequests();
    }
  }
}