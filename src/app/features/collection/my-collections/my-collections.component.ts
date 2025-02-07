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
  templateUrl: './my-collections.component.html',
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
    this.collections = this.collectionService.getCollectorRequests(
      this.currentUser.id!
    );
    this.filterByStatus(this.currentFilter);
  }

  filterByStatus(status: string) {
    this.currentFilter = status;
    if (status === 'all') {
      this.filteredCollections = this.collections;
    } else {
      this.filteredCollections = this.collections.filter(
        (c) => c.status === status
      );
    }
  }

  startCollection(collection: CollectionRequest) {
    this.collectionService.updateRequestStatus(collection.id!, 'in_progress');
    this.loadCollections();
  }
}
