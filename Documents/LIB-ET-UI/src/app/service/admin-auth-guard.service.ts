import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.getres().role.includes("0041")||
    this.authService.getres().role == "0048" ||this.authService.getres().role == "0041"||
    this.authService.getres().role == "0049"||this.authService.getres().role == "0052" ||this.authService.getres().role == "0078"||
    this.authService.getres().role == "0017"||this.authService.getres().role == "0051"||this.authService.getres().role == "0063"
    ||this.authService.getres().role == "0011"||this.authService.getres().role == "0013"||this.authService.getres().roles.includes("Finance")||
    this.authService.getres().role == "0007"||
    this.authService.getres().role == "0024"||
    this.authService.getres().role == "0025"
    ||
    this.authService.getres().role == "0060"
    ||
    this.authService.getres().role == "0061"||
    
    this.authService.getres().role == "DBD3"||
    this.authService.getres().role == "0045"||
    this.authService.getres().role == "0008"||this.authService.getres().role == "DBD2"
  ||this.authService.getres().role == "0064") {
      return true;
    }

    else {
      // Redirect to ItComponent for non-admin users
      this.router.navigate(['user/:id/It']);
      console.log("this.authService.getres().role",this.authService.getres().role)
      return false;
    }
    
  }
  

}
