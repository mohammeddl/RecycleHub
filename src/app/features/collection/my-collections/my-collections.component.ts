import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-my-collections',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">My Collections</h2>
      </div>

      <!-- Status Filter -->
      <div class="flex space-x-2">
        <button 
          *ngFor="let status of ['all', 'accepted', 'in_progress', 'completed', 'rejected']"
          (click)="filterByStatus(status)"
          [class.bg-green-600]="currentFilter === status"
          [class.text-white]="currentFilter === status"
          [class.bg-gray-100]="currentFilter !== status"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {{status | titlecase}}
        </button>
      </div>

      <!-- Collections Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let collection of filteredCollections" 
             class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-sm font-medium text-gray-500">Request ID</span>
              <p class="text-gray-900">{{collection.id}}</p>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full"
                  [ngClass]="{
                    'bg-blue-100 text-blue-800': collection.status === 'accepted',
                    'bg-yellow-100 text-yellow-800': collection.status === 'in_progress',
                    'bg-green-100 text-green-800': collection.status === 'completed',
                    'bg-red-100 text-red-800': collection.status === 'rejected'
                  }">
              {{collection.status | titlecase}}
            </span>
          </div>

          <div class="space-y-2">
            <div>
              <span class="text-sm font-medium text-gray-500">Waste Type</span>
              <p class="text-gray-900">{{collection.wasteType}}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Estimated Quantity</span>
              <p class="text-gray-900">{{collection.quantity}} kg</p>
            </div>
            <div *ngIf="collection.actualQuantity">
              <span class="text-sm font-medium text-gray-500">Actual Quantity</span>
              <p class="text-gray-900">{{collection.actualQuantity}} kg</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Pickup Date</span>
              <p class="text-gray-900">{{collection.pickupDate | date}}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Address</span>
              <p class="text-gray-900">{{collection.pickupAddress}}</p>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <ng-container [ngSwitch]="collection.status">
              <button *ngSwitchCase="'accepted'"
                      (click)="startCollection(collection)"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Start Collection
              </button>
              <a *ngSwitchCase="'in_progress'"
                 [routerLink]="['/dashboard/manage-collection', collection.id]"
                 class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Manage Collection
              </a>
              <button *ngSwitchCase="'completed'"
                      class="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg cursor-default">
                Completed
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredCollections.length === 0" 
           class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-500">No collections found</p>
      </div>
    </div>
  `
})
export class MyCollectionsComponent implements OnInit {
  collections: CollectionRequest[] = [];
  filteredCollections: CollectionRequest[] = [];
  currentUser: User;
  currentFilter: string = 'all';

  constructor(private collectionService: CollectionService) {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) throw new Error('No user logged in');
    this.currentUser = JSON.parse(userStr);
  }

  ngOnInit() {
    this.loadCollections();
  }

  loadCollections() {
    this.collections = this.collectionService.getCollectorRequests(this.currentUser.id!);
    this.filterByStatus(this.currentFilter);
  }

  filterByStatus(status: string) {
    this.currentFilter = status;
    if (status === 'all') {
      this.filteredCollections = this.collections;
    } else {
      this.filteredCollections = this.collections.filter(c => c.status === status);
    }
  }

  startCollection(collection: CollectionRequest) {
    this.collectionService.updateRequestStatus(collection.id!, 'in_progress');
    this.loadCollections();
  }
}