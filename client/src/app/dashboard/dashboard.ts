import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../auth/auth.service';
import { GroupService } from '../events/group.service';
import { MyGroup } from '../core/models/event.model';
import { UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [RouterLink, TranslocoPipe],
})
export class Dashboard implements OnInit {
  myGroups = signal<MyGroup[]>([]);
  loadingGroups = signal(false);

  constructor(
    public authService: AuthService,
    private groupService: GroupService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user?.is_active && user.role === UserRole.EVALUATOR) {
      this.loadingGroups.set(true);
      this.groupService.getMyGroups().subscribe({
        next: (groups) => {
          this.myGroups.set(groups);
          this.loadingGroups.set(false);
        },
        error: () => this.loadingGroups.set(false),
      });
    }
  }
}
