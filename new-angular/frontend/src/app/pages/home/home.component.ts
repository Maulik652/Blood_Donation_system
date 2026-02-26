import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  upcomingEvents: Event[] = [];
  isLoadingEvents = true;
  eventsErrorMessage = '';
  stats = {
    totalDonors: 1250,
    totalHospitals: 45,
    successfulDonations: 3500,
    livesImpacted: 10500
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents(): void {
    this.isLoadingEvents = true;
    this.eventsErrorMessage = '';

    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.upcomingEvents = response.events?.slice(0, 3) || [];
        this.isLoadingEvents = false;
      },
      error: () => {
        this.eventsErrorMessage = 'Unable to load upcoming camps right now.';
        this.upcomingEvents = [];
        this.isLoadingEvents = false;
      }
    });
  }
}
