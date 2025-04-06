import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-list.component.html',
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
      this.requests = this.collectionService.getUserRequests(
        this.currentUser.id
      );
    } else {
      this.requests = this.collectionService.getCollectorRequests(
        this.currentUser.id
      );
    }
    this.requests.sort(
      (a, b) =>
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
