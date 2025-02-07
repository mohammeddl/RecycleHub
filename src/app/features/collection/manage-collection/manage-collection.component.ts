import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';

@Component({
  selector: 'app-manage-collection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow p-6 space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">Manage Collection</h2>
          <span [class]="getStatusClass()">
            {{request?.status | titlecase}}
          </span>
        </div>

        <!-- Collection Details -->
        <div class="grid grid-cols-2 gap-6">
          <div>
            <span class="text-sm font-medium text-gray-500">Waste Type</span>
            <p class="text-gray-900">{{request?.wasteType}}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Estimated Quantity</span>
            <p class="text-gray-900">{{request?.quantity}} kg</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Pickup Date</span>
            <p class="text-gray-900">{{request?.pickupDate | date}}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Address</span>
            <p class="text-gray-900">{{request?.pickupAddress}}</p>
          </div>
        </div>

        <!-- Collection Form -->
        <form [formGroup]="collectionForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Actual Weight (kg)
            </label>
            <input type="number" 
                   formControlName="actualQuantity"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            <p *ngIf="collectionForm.get('actualQuantity')?.touched && 
                      collectionForm.get('actualQuantity')?.errors?.['required']"
               class="mt-1 text-sm text-red-600">
              Actual weight is required
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Collection Notes
            </label>
            <textarea formControlName="collectionNotes"
                      rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Add any notes about the collection..."></textarea>
          </div>

          <!-- Rejection Reason (shown when rejecting) -->
          <div *ngIf="showRejectionReason" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Rejection Reason
            </label>
            <textarea formControlName="rejectionReason"
                      rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      placeholder="Please provide a reason for rejection..."></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button type="button"
                    *ngIf="!showRejectionReason"
                    (click)="toggleRejectionForm()"
                    class="px-4 py-2 border border-red-300 rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50">
              Reject Collection
            </button>
            
            <ng-container *ngIf="showRejectionReason">
              <button type="button"
                      (click)="toggleRejectionForm()"
                      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button type="button"
                      (click)="rejectCollection()"
                      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
                Confirm Rejection
              </button>
            </ng-container>

            <button *ngIf="!showRejectionReason"
                    type="submit"
                    [disabled]="!collectionForm.valid"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Complete Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ManageCollectionComponent implements OnInit {
  request: CollectionRequest | null = null;
  collectionForm: FormGroup;
  showRejectionReason = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService
  ) {
    this.collectionForm = this.fb.group({
      actualQuantity: ['', [Validators.required, Validators.min(0)]],
      collectionNotes: [''],
      rejectionReason: ['']
    });
  }

  ngOnInit() {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.request = this.collectionService.getRequestById(requestId);
      if (!this.request) {
        this.router.navigate(['/dashboard/my-collections']);
      }
    }
  }

  getStatusClass(): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (this.request?.status) {
      case 'accepted':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  toggleRejectionForm() {
    this.showRejectionReason = !this.showRejectionReason;
    if (!this.showRejectionReason) {
      this.collectionForm.patchValue({ rejectionReason: '' });
    }
  }

  onSubmit() {
    if (this.collectionForm.valid && this.request) {
      this.collectionService.completeCollection(
        this.request.id!,
        this.collectionForm.value.actualQuantity,
        this.collectionForm.value.collectionNotes
      );
      this.router.navigate(['/dashboard/my-collections']);
    }
  }

  rejectCollection() {
    if (this.request && this.collectionForm.value.rejectionReason) {
      this.collectionService.rejectCollection(
        this.request.id!,
        this.collectionForm.value.rejectionReason
      );
      this.router.navigate(['/dashboard/my-collections']);
    }
  }
}