import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model'; 

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-request.component.html',
})
export class CreateRequestComponent implements OnInit {
  requestForm = new FormGroup({
    wasteType: new FormControl<string>('', Validators.required),
    quantity: new FormControl<number>(0, Validators.required),
    pickupAddress: new FormControl<string>('', Validators.required),
    pickupDate: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('')
  });

  isEditing = false;
  requestId: string | null = null;

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if we're editing an existing request
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.isEditing = true;
      const request = this.collectionService.getRequestById(this.requestId);
      if (request) {
        this.requestForm.patchValue({
          wasteType: request.wasteType,
          quantity: request.quantity,
          pickupAddress: request.pickupAddress,
          pickupDate: request.pickupDate,
          description: request.description || ''
        });
      }
    }
  }

  onSubmit() {
    if (this.requestForm.valid) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const formData = {
        wasteType: this.requestForm.value.wasteType!,
        quantity: this.requestForm.value.quantity!,
        pickupAddress: this.requestForm.value.pickupAddress!,
        pickupDate: this.requestForm.value.pickupDate!,
        description: this.requestForm.value.description || '',
        userId: currentUser.id,
        city: currentUser.address.split(',')[0].trim()
      };

      if (this.isEditing && this.requestId) {
        // Update existing request
        this.collectionService.updateRequest(this.requestId, formData);
      } else {
        // Create new request
        const newRequest: CollectionRequest = {
          ...formData,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };
        this.collectionService.createRequest(newRequest);
      }
      this.router.navigate(['/dashboard/requests']);
    }
  }
}