import { Injectable } from '@angular/core';
import {
  UserPoints,
  PointTransaction,
  VoucherOption,
} from '../models/points.model';
import { CollectionRequest } from '../models/collection-request.model';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private readonly POINTS_KEY = 'user_points';
  private readonly POINTS_RATES: Record<string, number> = {
    plastic: 2,
    glass: 1,
    paper: 1,
    metal: 5,
  };

  private readonly VOUCHER_OPTIONS: VoucherOption[] = [
    { points: 100, amount: 50 },
    { points: 200, amount: 120 },
    { points: 500, amount: 350 },
  ];

  constructor() {}

  private getAllUserPoints(): UserPoints[] {
    return JSON.parse(localStorage.getItem(this.POINTS_KEY) || '[]');
  }

  private saveUserPoints(points: UserPoints[]) {
    localStorage.setItem(this.POINTS_KEY, JSON.stringify(points));
  }

  getUserPoints(userId: string): UserPoints {
    const allPoints = this.getAllUserPoints();
    let userPoints = allPoints.find((p) => p.userId === userId);

    if (!userPoints) {
      userPoints = {
        userId,
        totalPoints: 0,
        history: [],
      };
      allPoints.push(userPoints);
      this.saveUserPoints(allPoints);
    }

    return userPoints;
  }

  calculatePoints(request: CollectionRequest): number {
    const rate = this.POINTS_RATES[request.wasteType.toLowerCase()];
    return Math.floor(request.actualQuantity! * rate);
  }

  addPoints(userId: string, request: CollectionRequest) {
    const points = this.calculatePoints(request);
    const allPoints = this.getAllUserPoints();
    const userPointsIndex = allPoints.findIndex((p) => p.userId === userId);

    const transaction: PointTransaction = {
      id: Date.now().toString(),
      userId,
      points,
      type: 'earned',
      date: new Date().toISOString(),
      requestId: request.id,
    };

    if (userPointsIndex === -1) {
      allPoints.push({
        userId,
        totalPoints: points,
        history: [transaction],
      });
    } else {
      allPoints[userPointsIndex].totalPoints += points;
      allPoints[userPointsIndex].history.push(transaction);
    }

    this.saveUserPoints(allPoints);
    return points;
  }

  redeemVoucher(userId: string, pointsToRedeem: number): boolean {
    const voucher = this.VOUCHER_OPTIONS.find(
      (v) => v.points === pointsToRedeem
    );
    if (!voucher) return false;

    const allPoints = this.getAllUserPoints();
    const userPointsIndex = allPoints.findIndex((p) => p.userId === userId);

    if (
      userPointsIndex === -1 ||
      allPoints[userPointsIndex].totalPoints < pointsToRedeem
    ) {
      return false;
    }

    const transaction: PointTransaction = {
      id: Date.now().toString(),
      userId,
      points: -pointsToRedeem,
      type: 'redeemed',
      date: new Date().toISOString(),
      voucherAmount: voucher.amount,
    };

    allPoints[userPointsIndex].totalPoints -= pointsToRedeem;
    allPoints[userPointsIndex].history.push(transaction);
    this.saveUserPoints(allPoints);

    return true;
  }

  getVoucherOptions(): VoucherOption[] {
    return this.VOUCHER_OPTIONS;
  }

  getPointsHistory(userId: string): PointTransaction[] {
    const userPoints = this.getUserPoints(userId);
    return userPoints.history.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}
