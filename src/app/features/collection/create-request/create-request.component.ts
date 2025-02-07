import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model'; 

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-request.component.html',
})
export class CreateRequestComponent {
  requestForm = new FormGroup({
    wasteType: new FormControl<string>('', Validators.required),
    quantity: new FormControl<number>(0, Validators.required),
    pickupAddress: new FormControl<string>('', Validators.required),
    pickupDate: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('')
  });

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.requestForm.valid) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const request: CollectionRequest = {
        wasteType: this.requestForm.value.wasteType!,
        quantity: this.requestForm.value.quantity!,
        pickupAddress: this.requestForm.value.pickupAddress!,
        pickupDate: this.requestForm.value.pickupDate!,
        description: this.requestForm.value.description || '',
        userId: currentUser.id,
        city: currentUser.address.split(',')[0].trim(), 
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      this.collectionService.createRequest(request);
      this.router.navigate(['/dashboard/requests']);
    }
  }
}