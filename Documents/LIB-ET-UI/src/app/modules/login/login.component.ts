import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth.service';
import { LoginService } from 'app/service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  Incorrect:boolean=false;
  message:string=""
  constructor(private loginService: LoginService,public authService: AuthService,private router:Router) { }

  onSubmit(): void {
 
    this.authService.login(this.username, this.password)
    this.message=  this.authService.message

 
    // this.loginService.login(this.username, this.password)
    //   .subscribe(
    //     (response) => {  
    //               console.log("res",response.id)
    //       // Handle successful login response
    //       console.log('Login successful:', response);
    //       this.router.navigate(['/user', response.id]);

    //     },
    //     (error) => {
    //       // Handle login error
    //       console.error('Login failed:', error);
    //       // Display error message to the user
    //     }
    //   );
  }
}
