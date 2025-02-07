import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser = {
        ...this.form.value,
        id: Date.now().toString(),
        role: 'individual'
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      this.router.navigate(['/login']);
    }
  }
}