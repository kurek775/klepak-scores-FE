import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  imports: [FormsModule, TranslocoPipe],
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  roles = Object.values(UserRole);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(user: User): void {
    this.http
      .patch<User>(`${environment.apiUrl}/admin/users/${user.id}`, {
        is_active: !user.is_active,
      })
      .subscribe({
        next: (updated) => {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        },
      });
  }

  changeRole(user: User, role: UserRole): void {
    this.http
      .patch<User>(`${environment.apiUrl}/admin/users/${user.id}`, { role })
      .subscribe({
        next: (updated) => {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        },
      });
  }
}
