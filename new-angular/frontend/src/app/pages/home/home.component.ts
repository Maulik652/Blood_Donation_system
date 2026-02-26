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
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.upcomingEvents = response.events?.slice(0, 3) || [];
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
  }
}
