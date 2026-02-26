import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { DatePipe } from '@angular/common';

import { InvitationService } from '../invitation.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/toast.service';
import { InvitationRead, UserRole } from '../../core/models/user.model';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-invitation-list',
  templateUrl: './invitation-list.html',
  imports: [FormsModule, TranslocoPipe, DatePipe],
})
export class InvitationList implements OnInit {
  invitations = signal<InvitationRead[]>([]);
  loading = signal(false);
  inviteEmail = '';
  inviteRole = UserRole.EVALUATOR;
  UserRole = UserRole;
  inviteLoading = signal(false);
  inviteError = signal('');
  inviteSuccess = signal('');

  private destroy$ = untilDestroyed();

  constructor(
    private invitationService: InvitationService,
    public authService: AuthService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading.set(true);
    this.invitationService.list().pipe(this.destroy$()).subscribe({
      next: (invitations) => {
        this.invitations.set(invitations);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  sendInvite(): void {
    if (!this.inviteEmail.trim()) return;
    this.inviteError.set('');
    this.inviteSuccess.set('');
    this.inviteLoading.set(true);

    this.invitationService.invite(this.inviteEmail.trim(), this.inviteRole).pipe(this.destroy$()).subscribe({
      next: () => {
        this.inviteSuccess.set(this.inviteEmail.trim());
        this.inviteEmail = '';
        this.inviteLoading.set(false);
        this.loadInvitations();
      },
      error: (err) => {
        this.inviteLoading.set(false);
        this.inviteError.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
      },
    });
  }

  revoke(id: number): void {
    this.invitationService.revoke(id).pipe(this.destroy$()).subscribe({
      next: () => this.loadInvitations(),
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
