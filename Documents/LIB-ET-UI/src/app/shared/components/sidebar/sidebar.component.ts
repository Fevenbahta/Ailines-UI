import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth.service';
import { SidebarService } from 'app/service/sidebar.service';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES: RouteInfo[] = [
  { path: '/Change', title: 'Change', icon: 'sync', class: '' },
  { path: '/Transfer', title: 'Transfer Receipt', icon: 'receipt_long', class: '' },
  { path: '/TransferApproval', title: 'Transfer-Approval', icon: 'task_alt', class: '' },
  
  { path: '/Report', title: 'Report', icon: 'report', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  display: boolean = false;
  role: string;
  roles: string[];
  services: string;
  user: string;

  constructor(public authService: AuthService, 
    public sidebarService: SidebarService, public router: Router) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (userData && (userData.role||userData.roles)) {
      this.role = userData.role;
      this.roles = userData.roles;
      this.services = userData.services || [];
      this.user = userData.userName;

      if (this.authService.isitAuthenticated()) {
        this.display = true;
      }
    
      if (!this.authService.mustchangepassword) {
        // Use setTimeout to delay the call to populateMenuItems
        setTimeout(() => {
          this.populateMenuItems();
        }, 0); // Delay of 0ms, executes after the current event loop
      }
    } else {
        // Handle the case where user data is not available
    }
  }

  populateMenuItems() {
    console.log("test1", this.roles, this.menuItems);

    if (
      this.role.includes('0041') ||
      this.role.includes('0049') ||
      this.role.includes('0048') ||
     
      this.role.includes('0063') ||
      this.role.includes('0011')||this.role.includes('0025') 
      || this.role.includes('0060')    || this.role.includes('DBD2')    || this.role.includes('0064')  
    ) {
      if (this.services.includes('ET')) {
        this.menuItems.push(...ROUTES.filter(menuItem => menuItem.path === '/TransferApproval'||menuItem.path === '/Report'));
      }
    }

    if (
 
      this.role.includes('0017') 
         ) {
      if (this.services.includes('ET')) {
        this.menuItems.push(...ROUTES.filter(menuItem =>  menuItem.path === '/Report'));
      }
    }

    if (this.role.includes('0052') || this.role.includes('0051') || this.role.includes('0013')||this.authService.getres().role == "0007"||this.role.includes('0024')
      || this.role.includes('0061')|| this.role.includes('0008')|| this.role.includes('0045' )||this.role.includes('DBD3') ) {
      if (this.services.includes('ET')) {
        this.menuItems.push(...ROUTES.filter(menuItem => menuItem.path === '/Transfer' || menuItem.path === '/Report'));
      }
    }

    // if (this.roles.includes('Finance')) {
    //   this.menuItems.push(...ROUTES.filter(menuItem =>  menuItem.path === '/TransferApproval' || menuItem.path === '/Report'));
    // }

    console.log("test2", this.role, this.menuItems);
    this.router.navigate([this.router.url]); // Re-navigate to current route
   
  }

  isMobileMenu() {
    return $(window).width() <= 991;
  }
}