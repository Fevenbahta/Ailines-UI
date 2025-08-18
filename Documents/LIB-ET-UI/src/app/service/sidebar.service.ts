import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarUpdated = new BehaviorSubject<boolean>(false);
  sidebarUpdated$ = this.sidebarUpdated.asObservable();

  updateSidebar() {
    this.sidebarUpdated.next(true); // Notify that sidebar should refresh
  }
}
