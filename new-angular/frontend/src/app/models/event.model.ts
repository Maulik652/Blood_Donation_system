export interface Event {

  _id?: string;

  title: string;

  description: string;

  location: string;

  date: string;

  /* Optional Fields for Events Page */

  imageUrl?: string;

  bloodGroups?: string[];

  registeredCount?: number;

  capacity?: number;

  status?: 'scheduled' | 'live' | 'postponed' | 'ended';

  startedAt?: string | null;

  endedAt?: string | null;

  postponedFrom?: string | null;

  postponeReason?: string | null;

}


/* Needed for Admin Dashboard */

export interface CreateEventData {

  title: string;

  description: string;

  location: string;

  date: string;

  imageUrl?: string;

  bloodGroups?: string[];

  capacity?: number;

}

export interface PostponeEventData {
  date: string;
  reason?: string;
}