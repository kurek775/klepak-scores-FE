import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  imports: [FormsModule, TranslocoPipe],
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  roles = Object.values(UserRole).filter((r) => r !== UserRole.SUPER_ADMIN);

  private destroy$ = untilDestroyed();

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).pipe(this.destroy$()).subscribe({
      next: (users) => {
        const myId = this.authService.user()?.id;
        this.users.set(users.filter((u) => u.id !== myId));
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

  isSuperAdmin(user: User): boolean {
    return user.role === UserRole.SUPER_ADMIN;
  }
}
