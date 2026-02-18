import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { Navbar } from './shared/layout/navbar/navbar';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, Navbar, ToastComponent],
})
export class App implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.tryRestoreSession();
  }
}
