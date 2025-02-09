import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '../../core/services/points.service';
import { UserPoints, PointTransaction, VoucherOption } from '../../../app/core/models/points.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-points-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points-dashboard.component.html',
})
export class PointsDashboardComponent implements OnInit {
  userPoints!: UserPoints;
  pointsHistory: PointTransaction[] = [];
  voucherOptions: (VoucherOption & { brand: string; bgColor: string; logo: string })[] = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  Math = Math;

  constructor(private pointsService: PointsService) {}

  ngOnInit() {
    this.loadUserPoints();
    this.voucherOptions = this.pointsService.getVoucherOptions();
  }

  loadUserPoints() {
    if (this.currentUser && this.currentUser.id) {
      this.userPoints = this.pointsService.getUserPoints(this.currentUser.id);
      this.pointsHistory = this.pointsService.getPointsHistory(this.currentUser.id);
    }
  }

  async redeemVoucher(points: number) {
    const result = await Swal.fire({
      title: 'Redeem Points',
      text: `Are you sure you want to redeem ${points} points for a voucher?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, redeem!'
    });

    if (result.isConfirmed) {
      const success = this.pointsService.redeemVoucher(this.currentUser.id, points);
      if (success) {
        await Swal.fire({
          title: 'Success!',
          text: 'Your voucher has been redeemed successfully.',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        this.loadUserPoints();
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Failed to redeem voucher. Please try again.',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  }
}