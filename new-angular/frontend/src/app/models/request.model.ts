export interface Request {
  _id?: string;
  donor?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  hospital?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
  } | null;
  bloodGroup: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  urgency?: string;
  message: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestData {
  bloodGroup: string;
  urgency: string;
  message: string;
}