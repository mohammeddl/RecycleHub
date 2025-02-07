import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function authGuard() {
  const router = inject(Router);

  const user = localStorage.getItem('currentUser');
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  return true;
}