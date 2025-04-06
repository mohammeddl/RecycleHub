import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-available-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './available-requests.component.html',
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