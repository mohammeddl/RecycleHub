// src/app/features/dashboard/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900">Profile</h3>
          <p class="mt-1 text-sm text-gray-500">Update your personal information.</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {{ successMessage }}
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" formControlName="firstName" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" formControlName="lastName" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" formControlName="phone" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" formControlName="address" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Birth Date</label>
              <input type="date" formControlName="birthDate" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button type="button" (click)="deleteAccount()" 
              class="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Delete Account
            </button>
            <button type="submit" [disabled]="!profileForm.valid || !profileForm.dirty"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
        this.profileForm.patchValue({
          email: this.currentUser?.email,
          firstName: this.currentUser?.firstName,
          lastName: this.currentUser?.lastName,
          address: this.currentUser?.address,
          phone: this.currentUser?.phone,
          birthDate: this.currentUser?.birthDate
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.currentUser) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        const updatedUser = {
          ...this.currentUser,
          ...this.profileForm.value
        };

        const index = users.findIndex(u => u.id === this.currentUser?.id);
        
        if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }

  deleteAccount() {
    if (this.currentUser && confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter((u: User) => u.id !== this.currentUser?.id);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  }
}