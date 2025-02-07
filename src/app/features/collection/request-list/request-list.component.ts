import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  requests: CollectionRequest[] = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  constructor(private collectionService: CollectionService) {}

  ngOnInit() {
    if (this.currentUser.role === 'collector') {
      this.requests = this.collectionService.getCollectorRequests(this.currentUser.id);
    } else {
      this.requests = this.collectionService.getUserRequests(this.currentUser.id);
    }
  }

  updateStatus(requestId: string, status: CollectionRequest['status']) {
    this.collectionService.updateRequestStatus(
      requestId, 
      status,
      this.currentUser.role === 'collector' ? this.currentUser.id : undefined
    );
    // Refresh the list
    this.ngOnInit();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
