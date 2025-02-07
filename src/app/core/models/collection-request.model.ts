export interface CollectionRequest {
  id?: string;
  userId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  wasteType: string;
  quantity: number;
  actualQuantity?: number;
  pickupAddress: string;
  pickupDate: string;
  description?: string;
  collectorId?: string;
  createdAt: string;
  photos?: string[];
  city: string;
  collectionNotes?: string;
  rejectionReason?: string;
}