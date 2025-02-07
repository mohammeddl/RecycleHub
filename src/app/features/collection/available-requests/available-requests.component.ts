import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-available-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Available Collection Requests
      </h2>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          *ngFor="let request of availableRequests"
          class="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="text-sm font-medium text-gray-500">Request ID</span>
              <p class="text-gray-900">{{ request.id }}</p>
            </div>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              [ngClass]="{
                'bg-yellow-100 text-yellow-800': request.status === 'pending',
                'bg-blue-100 text-blue-800': request.status === 'accepted',
                'bg-green-100 text-green-800': request.status === 'completed',
                'bg-red-100 text-red-800': request.status === 'rejected'
              }"
            >
              {{ request.status }}
            </span>
          </div>

          <div class="space-y-2">
            <div>
              <span class="text-sm font-medium text-gray-500">Waste Type</span>
              <p class="text-gray-900">{{ request.wasteType }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500"
                >Estimated Quantity</span
              >
              <p class="text-gray-900">{{ request.quantity }} kg</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Pickup Date</span>
              <p class="text-gray-900">{{ request.pickupDate | date }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Address</span>
              <p class="text-gray-900">{{ request.pickupAddress }}</p>
            </div>
          </div>

          <div class="pt-4">
            <button
              *ngIf="request.status === 'pending'"
              (click)="acceptRequest(request)"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Accept Request
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AvailableRequestsComponent implements OnInit {
  availableRequests: CollectionRequest[] = [];
  currentUser: User;

  constructor(private collectionService: CollectionService) {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) throw new Error('No user logged in');
    this.currentUser = JSON.parse(userStr);
  }

  ngOnInit() {
    // Get requests from the same city as the collector
    this.availableRequests = this.collectionService.getRequestsByCity(
      this.currentUser.address
    );
  }

  acceptRequest(request: CollectionRequest) {
    this.collectionService.updateRequestStatus(
      request.id!,
      'accepted',
      this.currentUser.id
    );
    // Refresh the list
    this.availableRequests = this.collectionService.getRequestsByCity(
      this.currentUser.address
    );
  }
}
