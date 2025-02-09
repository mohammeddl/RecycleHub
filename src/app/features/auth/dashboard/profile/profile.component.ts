import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
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