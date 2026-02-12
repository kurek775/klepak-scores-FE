import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  healthStatus = signal<'checking' | 'ok' | 'error'>('checking');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ status: string; database: string }>('/api/health').subscribe({
      next: (res) => {
        this.healthStatus.set(res.status === 'ok' && res.database === 'ok' ? 'ok' : 'error');
      },
      error: () => {
        this.healthStatus.set('error');
      },
    });
  }
}
