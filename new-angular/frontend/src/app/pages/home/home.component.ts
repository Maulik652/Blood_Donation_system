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
  displayStats = {
    totalDonors: 0,
    successfulDonations: 0,
    livesImpacted: 0,
  };
  stats = {
    totalDonors: 1250,
    totalHospitals: 45,
    successfulDonations: 3500,
    livesImpacted: 10500
  };
  howItWorks = [
    { step: '01', title: 'Register', description: 'Create your donor or hospital account in seconds.' },
    { step: '02', title: 'Accept Request', description: 'Match with urgent blood requests quickly and securely.' },
    { step: '03', title: 'Donate', description: 'Complete donation and save lives with verified workflow.' },
  ];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadUpcomingEvents();
    this.animateStats();
  }

  private animateStats(): void {
    const durationMs = 1200;
    const steps = 40;
    const intervalMs = durationMs / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;
      const progress = currentStep / steps;

      this.displayStats.totalDonors = Math.round(this.stats.totalDonors * progress);
      this.displayStats.successfulDonations = Math.round(this.stats.successfulDonations * progress);
      this.displayStats.livesImpacted = Math.round(this.stats.livesImpacted * progress);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, intervalMs);
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
