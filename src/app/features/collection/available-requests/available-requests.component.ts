import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-available-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Available Collection Requests</h2>

        <!-- Requests Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let request of availableRequests" 
               class="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <!-- Request Header -->
            <div class="flex justify-between items-start">
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': request.status === 'pending',
                      'bg-blue-100 text-blue-800': request.status === 'accepted',
                      'bg-purple-100 text-purple-800': request.status === 'in_progress',
                      'bg-green-100 text-green-800': request.status === 'completed',
                      'bg-red-100 text-red-800': request.status === 'rejected'
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
                <span class="text-sm font-medium text-gray-500">Estimated Quantity</span>
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
            </div>

            <!-- Collection Management -->
            <div *ngIf="selectedRequestId === request.id" class="mt-4 space-y-4">
              <div *ngIf="request.status === 'in_progress'" [formGroup]="collectionForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Actual Weight (kg)</label>
                  <input type="number" formControlName="actualQuantity"
                         class="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Collection Notes</label>
                  <textarea formControlName="collectionNotes" rows="3"
                           class="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                  <button (click)="completeCollection(request.id!)"
                          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Complete Collection
                  </button>
                  <button (click)="rejectCollection(request.id!)"
                          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Reject Collection
                  </button>
                </div>
              </div>

              <!-- Action Buttons based on status -->
              <div class="flex justify-end space-x-2" *ngIf="request.status === 'pending'">
                <button (click)="acceptCollection(request.id!)"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Accept Collection
                </button>
              </div>
              <div class="flex justify-end space-x-2" *ngIf="request.status === 'accepted'">
                <button (click)="startCollection(request.id!)"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Start Collection
                </button>
              </div>
            </div>

            <!-- Select Request Button -->
            <div class="pt-4" *ngIf="selectedRequestId !== request.id">
              <button (click)="selectRequest(request.id!)"
                      class="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                Select Request
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="availableRequests.length === 0" 
             class="text-center py-12">
          <p class="text-gray-500">No available requests in your area</p>
        </div>
      </div>
    </div>
  `
})
export class AvailableRequestsComponent implements OnInit {
  availableRequests: CollectionRequest[] = [];
  selectedRequestId: string | null = null;
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  collectionForm = new FormGroup({
    actualQuantity: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    collectionNotes: new FormControl<string>('')
  });

  constructor(private collectionService: CollectionService) {}

  ngOnInit() {
    this.loadAvailableRequests();
  }

  loadAvailableRequests() {
    // Get requests from the same city
    this.availableRequests = this.collectionService.getRequestsByCity(
      this.currentUser.address.split(',')[0].trim()
    );
  }

  selectRequest(requestId: string) {
    this.selectedRequestId = requestId;
  }

  acceptCollection(requestId: string) {
    this.collectionService.updateRequestStatus(requestId, 'accepted', this.currentUser.id);
    this.loadAvailableRequests();
  }

  startCollection(requestId: string) {
    this.collectionService.updateRequestStatus(requestId, 'in_progress');
    this.loadAvailableRequests();
  }

  completeCollection(requestId: string) {
    if (this.collectionForm.valid) {
      this.collectionService.completeCollection(
        requestId,
        this.collectionForm.value.actualQuantity!,
        this.collectionForm.value.collectionNotes || ''
      );
      this.selectedRequestId = null;
      this.loadAvailableRequests();
    }
  }

  rejectCollection(requestId: string) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.collectionService.rejectCollection(requestId, reason);
      this.selectedRequestId = null;
      this.loadAvailableRequests();
    }
  }
}