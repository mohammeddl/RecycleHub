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
  templateUrl: './manage-collection.component.html',
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