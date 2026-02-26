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