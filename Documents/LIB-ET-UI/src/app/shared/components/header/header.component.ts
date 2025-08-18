import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();


  constructor(private authService: AuthService,
    private router: Router) { }
  display:boolean=false


  
  ngOnInit() { 
    
    if (this.authService.Role) {
      
       this.display=true; // Allow navigation to /user/:id if user is authenticated
    }
  }
  changePassword(): void {
    this.router.navigate(['/Change']);  // Navigate to the /Change route
  }

  toggleSideBar() {
    this.toggleSideBarForMe.emit();
  }
  logout(){
    this.authService.logout()
  }
}