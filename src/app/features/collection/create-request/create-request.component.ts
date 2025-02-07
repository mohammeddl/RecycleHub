// create-request.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
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
    wasteType: new FormControl<string>('', [Validators.required]),
    quantity: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1), // 1kg = 1000g
      Validators.max(10) // maximum 10kg
    ]),
    pickupAddress: new FormControl<string>('', Validators.required),
    pickupDate: new FormControl<string>('', [
      Validators.required,
      this.dateValidator()
    ]),
    pickupTime: new FormControl<string>('', [
      Validators.required,
      this.timeValidator()
    ]),
    description: new FormControl<string>('')
  });

  isEditing = false;
  requestId: string | null = null;
  maxPendingRequests = 3;

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.isEditing = true;
      const request = this.collectionService.getRequestById(this.requestId);
      if (request) {
        this.requestForm.patchValue({
          wasteType: request.wasteType,
          quantity: request.quantity,
          pickupAddress: request.pickupAddress,
          pickupDate: request.pickupDate?.split('T')[0],
          pickupTime: request.pickupDate?.split('T')[1]?.slice(0, 5),
          description: request.description || ''
        });
      }
    }
  }

  // Custom validator for date
  private dateValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) return null;

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return { pastDate: true };
      }
      return null;
    };
  }

  // Custom validator for time (09:00 - 18:00)
  private timeValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) return null;

      const time = control.value;
      const [hours, minutes] = time.split(':').map(Number);
      
      if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
        return { invalidTime: true };
      }
      return null;
    };
  }

  // Check if user has reached maximum pending requests
  private async checkPendingRequestsLimit(): Promise<boolean> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRequests = this.collectionService.getUserRequests(currentUser.id);
    const pendingRequests = userRequests.filter(r => 
      r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
    );

    if (pendingRequests.length >= this.maxPendingRequests) {
      alert('You cannot have more than 3 pending requests at a time.');
      return false;
    }
    return true;
  }

  async onSubmit() {
    if (this.requestForm.valid) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Check pending requests limit if creating new request
      if (!this.isEditing) {
        const canProceed = await this.checkPendingRequestsLimit();
        if (!canProceed) return;
      }

      const formData = {
        wasteType: this.requestForm.value.wasteType!,
        quantity: this.requestForm.value.quantity!,
        pickupAddress: this.requestForm.value.pickupAddress!,
        pickupDate: `${this.requestForm.value.pickupDate}T${this.requestForm.value.pickupTime}`,
        description: this.requestForm.value.description || '',
        userId: currentUser.id,
        city: currentUser.address.split(',')[0].trim()
      };

      if (this.isEditing && this.requestId) {
        this.collectionService.updateRequest(this.requestId, formData);
      } else {
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

  // Get error messages
  getErrorMessage(controlName: string): string {
    const control = this.requestForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['min']) return 'Minimum quantity is 1kg (1000g)';
    if (errors['max']) return 'Maximum quantity is 10kg';
    if (errors['pastDate']) return 'Cannot select a past date';
    if (errors['invalidTime']) return 'Pickup time must be between 09:00 and 18:00';
    
    return 'Invalid input';
  }
}