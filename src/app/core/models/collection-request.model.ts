export interface CollectionRequest {
    id?: string;
    userId: string;  
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    wasteType: string;
    quantity: number;
    pickupAddress: string;
    pickupDate: string;
    description?: string;
    collectorId?: string; 
    createdAt: string;
  }