import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';
import { CollectionRequest } from '../../../core/models/collection-request.model';
import Swal from 'sweetalert2';

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
      Validators.min(1),
      Validators.max(10)
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

    this.requestForm.valueChanges.subscribe(() => {
      this.getFormProgress();
    });
  }

  getFormProgress(): number {
    const controls = this.requestForm.controls;
    const totalRequiredFields = Object.keys(controls).filter(key => 
      key !== 'description' 
    ).length;
    
    const validRequiredFields = Object.entries(controls)
      .filter(([key, control]) => 
        key !== 'description' && control.valid && control.value
      ).length;

    return validRequiredFields / totalRequiredFields;
  }

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

  private async checkPendingRequestsLimit(): Promise<boolean> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userRequests = this.collectionService.getUserRequests(currentUser.id);
    const pendingRequests = userRequests.filter(r => 
      r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
    );

    if (pendingRequests.length >= this.maxPendingRequests) {
      await Swal.fire({
        title: 'Limit Reached',
        text: 'You cannot have more than 3 pending requests at a time.',
        icon: 'warning',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Ok, got it!'
      });
      return false;
    }
    return true;
  }

  async onSubmit() {
    if (this.requestForm.valid) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      try {
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
          await Swal.fire({
            title: 'Updated!',
            text: 'Your request has been updated successfully.',
            icon: 'success',
            confirmButtonColor: '#10B981',
            timer: 2000,
            timerProgressBar: true
          });
        } else {
          const newRequest: CollectionRequest = {
            ...formData,
            status: 'pending' as const,
            createdAt: new Date().toISOString()
          };
          this.collectionService.createRequest(newRequest);
          await Swal.fire({
            title: 'Success!',
            text: 'Your collection request has been created.',
            icon: 'success',
            confirmButtonColor: '#10B981',
            timer: 2000,
            timerProgressBar: true
          });
        }
        this.router.navigate(['/dashboard/requests']);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    } else {
      Swal.fire({
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.requestForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['min']) return 'Minimum quantity is 1kg';
    if (errors['max']) return 'Maximum quantity is 10kg';
    if (errors['pastDate']) return 'Cannot select a past date';
    if (errors['invalidTime']) return 'Pickup time must be between 09:00 and 18:00';
    
    return 'Invalid input';
  }
}