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
      const formValues = this.requestForm.value;
      
      const request: CollectionRequest = {
        wasteType: formValues.wasteType!,
        quantity: formValues.quantity!,
        pickupAddress: formValues.pickupAddress!,
        pickupDate: formValues.pickupDate!,
        description: formValues.description || '',
        userId: currentUser.id,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      
      this.collectionService.createRequest(request);
      this.router.navigate(['/dashboard/requests']);
    }
  }
}