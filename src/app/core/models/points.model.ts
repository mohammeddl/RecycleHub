// core/models/points.model.ts
export interface UserPoints {
    userId: string;
    totalPoints: number;
    history: PointTransaction[];
  }
  
  export interface PointTransaction {
    id: string;
    userId: string;
    points: number;
    type: 'earned' | 'redeemed';
    date: string;
    requestId?: string;
    voucherAmount?: number;
  }
  
  export interface VoucherOption {
    points: number;
    amount: number;
  }