import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '../../core/services/points.service';
import {
  UserPoints,
  PointTransaction,
  VoucherOption,
} from '../../../app/core/models/points.model';

@Component({
  selector: 'app-points-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points-dashboard.component.html',
})
export class PointsDashboardComponent implements OnInit {
  userPoints!: UserPoints;
  pointsHistory: PointTransaction[] = [];
  voucherOptions: VoucherOption[] = [];
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
      this.pointsHistory = this.pointsService.getPointsHistory(
        this.currentUser.id
      );
    }
  }

  redeemVoucher(points: number) {
    if (
      confirm(`Are you sure you want to redeem ${points} points for a voucher?`)
    ) {
      const success = this.pointsService.redeemVoucher(
        this.currentUser.id,
        points
      );
      if (success) {
        alert('Voucher redeemed successfully!');
        this.loadUserPoints();
      } else {
        alert('Failed to redeem voucher. Please try again.');
      }
    }
  }
}
