import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthAdminGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
       if (this.authService.getres().role == "Admin") {
  
      return true;
    } 
    else {
      // Redirect to ItComponent for non-admin users
       this.router.navigate(['user/:id/']);
      return false;
    }
    
  }
}
