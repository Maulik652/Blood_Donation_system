import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  mission = "To connect blood donors with hospitals and individuals in need, ensuring timely access to safe blood and saving lives across communities.";
  
  values = [
    { icon: '🎯', title: 'Mission Driven', description: 'Committed to saving lives through efficient blood donation management' },
    { icon: '🤝', title: 'Community First', description: 'Building strong connections between donors and recipients' },
    { icon: '⚡', title: 'Quick Response', description: 'Ensuring rapid response to emergency blood requirements' },
    { icon: '🔒', title: 'Privacy & Security', description: 'Protecting donor and patient information with highest standards' }
  ];
}
