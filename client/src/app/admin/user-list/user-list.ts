import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { User, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { AdminService } from '../admin.service';
import { ToastService } from '../../shared/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog.service';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  imports: [FormsModule, RouterLink, TranslocoPipe],
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  roles = Object.values(UserRole).filter((r) => r !== UserRole.SUPER_ADMIN);

  private destroy$ = untilDestroyed();

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private toast: ToastService,
    private transloco: TranslocoService,
    private confirmDialog: ConfirmDialogService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.listUsers().pipe(this.destroy$()).subscribe({
      next: (users) => {
        const myId = this.authService.user()?.id;
        this.users.set(users.filter((u) => u.id !== myId));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(user: User): void {
    this.adminService
      .updateUser(user.id, { is_active: !user.is_active })
      .pipe(this.destroy$())
      .subscribe({
        next: (updated) => {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        },
        error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
      });
  }

  changeRole(user: User, role: UserRole): void {
    this.adminService
      .updateUser(user.id, { role })
      .pipe(this.destroy$())
      .subscribe({
        next: (updated) => {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        },
        error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
      });
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.transloco.translate('ADMIN.DELETE_USER_TITLE'),
      message: this.transloco.translate('ADMIN.DELETE_USER_CONFIRM', { name: user.full_name }),
      confirmText: this.transloco.translate('ADMIN.DELETE'),
    });
    if (!confirmed) return;

    this.adminService
      .deleteUser(user.id)
      .pipe(this.destroy$())
      .subscribe({
        next: () => {
          this.users.update((list) => list.filter((u) => u.id !== user.id));
          this.toast.success(this.transloco.translate('ADMIN.USER_DELETED', { name: user.full_name }));
        },
        error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
      });
  }

  isSuperAdmin(user: User): boolean {
    return user.role === UserRole.SUPER_ADMIN;
  }
}
