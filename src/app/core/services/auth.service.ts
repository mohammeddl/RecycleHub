import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'users';

  constructor() {
    this.initializeCollectors();
  }

  private initializeCollectors() {
    const collectors: User[] = [
      {
        id: '1',
        email: 'collector1@recycehub.com',
        password: 'password123',
        firstName: 'Ahmed',
        lastName: 'Alami',
        address: 'Casablanca',
        phone: '0600000001',
        birthDate: '1990-01-01',
        role: 'collector',
      },
      {
        id: '2',
        email: 'collector2@recycehub.com',
        password: 'password123',
        firstName: 'Karim',
        lastName: 'Idrissi',
        address: 'Rabat',
        phone: '0600000002',
        birthDate: '1988-05-15',
        role: 'collector',
      },
    ];

    const existingUsers: User[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    for (const collector of collectors) {
        if (!existingUsers.some(user => user.email === collector.email)) {
          existingUsers.push(collector);
        }
      }
    
      localStorage.setItem(this.USERS_KEY, JSON.stringify(existingUsers));
  }
}
