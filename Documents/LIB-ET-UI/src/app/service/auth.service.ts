import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap, takeWhile } from 'rxjs/operators';
import { Login } from 'app/models/data.model';
import { TransactionService } from './transaction.service';
import { SidebarService } from './sidebar.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false;
  public Role: string;
  public Roles: string[];
  public Services: string;
  public name: string;
  public branch: string;
  public branchname: string;
  public id: number;
  public password: string;
  public res: Login;
  public incorrect: boolean = false;
  public suspended: boolean = false;
  public tra: boolean = false;
  public roleincorrect: boolean = false;
  public locked:boolean=false;
  public message:string="";
  public mustchangepassword:boolean=false
  private MAX_FAILED_ATTEMPTS = 10;
  private failedAttempts: { [username: string]: number } = {};
  public accountLocked: { [username: string]: boolean } = {};
  token:string;

  private authStatus = new BehaviorSubject<boolean>(this.isitAuthenticated());
  authStatus$ = this.authStatus.asObservable();
  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();


  backDateAllowed: boolean;
  backDateFrom: string;
  backDateTo: string;

  newUser: Login = {
    id: 0,
    branch: "",
    fullName: "",
    userName: "",
    password: "",
    role: "",
    roles: [],
    branchCode: "",
    updatedBy: "",
    updatedDate: "",
    status: "",
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private sidebarService:SidebarService,
    private transactionService: TransactionService
  ) {}

  login(username: string, password: string) {
  
    this.loginService.login(username, password).subscribe({
      next: (response) => {
       
        if (response && response.success) {
         
   
          // Store token and user data in local storage
          localStorage.setItem('token', response.token);
          this.token=response.token;
        

      
          localStorage.setItem('userData', JSON.stringify({
            branch: response.branch,
            branchCode: response.branchCode,
            role: response.role,
            roles: response.roles,
            services: response.services,
            userName:username,
            backDateAllowed:response.backDateAllowed,
            backDateFrom:response.backDateFrom,
            backDateTo:response.backDateTo
          }));
          console.log(response,"response")
          localStorage.setItem('reloadOnce', 'false'); // Set flag

          // Set user details in the component
          this.name = username;
          this.branch = response.branchCode;
          this.branchname = response.branch;
          this.Role = response.role;
          this.Roles=response.roles
          this.Services=response.services;
          this.backDateAllowed=response.backDateAllowed,
          this.backDateFrom=response.backDateFrom,
          this.backDateTo=response.backDateTo

          // Navigate based on role
          this.redirectBasedOnRole(response.roles,response.role,response.services);
      
          if (response.mustChangePassword) {
            // Redirect to the Change Password page
            this.mustchangepassword=true;
            this.tra = true;
           this.name=username;
            this.router.navigate(['/Change']);
            return;
          }
        } else {
          this.message=response.message;
          setTimeout(() => this.message="", 2000);
          console.error('Login failed: Invalid response format',response);
        }
      },
      error: (err) => {

        console.error('Login error:', err);
        this.incorrect = true;
        this.message='Login Error';
        setTimeout(() => this.message="", 2000);
        setTimeout(() => this.resetStatusFlags(), 1000); // Reset after 1 second
      },
    });
  }
  
  // redirectBasedOnRole(role: string) {
  //   this.tra=true;
  //   switch (role) {
  //     case 'Admin':
  //       this.router.navigate(['/Admin']);
  //       break;
  //     case 'FanaAdmin':
  //       this.router.navigate(['/FanaCustom']);
  //       break;
  //     case 'Finance':
  //       this.router.navigate(['/RtgsAllReport']);
  //       break;
  //     case '0052':
  //     case '0073':
  //     case '0017':
  //       this.router.navigate(['/Request']);
  //       break;
  //     case '0048':
  //     case '0041':
  //     case '0049':
  //       this.router.navigate(['/Approval']);
  //       break;
  //     case '0078':
  //       this.router.navigate(['/FanaReport']);
  //       break;
  //     default:
  //       console.error('Role not recognized:', role);
  //       this.roleincorrect = true;
  //       break;
  //   }
  // }
  

  redirectBasedOnRole(roles: string[],role: string, services: string[]) {
    this.tra = true;
  
    // Define navigation routes for services
    const serviceRoutes = {
      ET: {
        Transfer: '/Transfer',
        TransferApproval: '/TransferApproval',
        Report: '/Report',
      },
     
    };
  
    // Check the services and route accordingly
    const navigateToServiceRoute =
     (service: string, routeType: 'Transfer' |'TransferApproval'|'Report') => {
      if (serviceRoutes[service]) {
    
        this.router.navigate([serviceRoutes[service][routeType]]);
        const currentUrl = this.router.url;
   

      } else {
        console.error(`Service '${service}' not recognized`);
        this.roleincorrect = true;
        this.message='Service: Contact Administrator';
      }
    };
  console.log("roles",roles,role,services)
  console.log("roles type:", Array.isArray(roles)); 
console.log("roles:", role);

    if (roles.includes('Finance')) {
      console.log("true")
      if (services.includes('ET')) {
        navigateToServiceRoute('ET', 'TransferApproval');
      }
    }
    else{  
      console.log("token2",this.backDateAllowed,this.backDateFrom,this.backDateTo)

      console.log("roles",roles,role,services)
 switch (role) {
        case '0041':
          if (services.includes('ET')) {
            navigateToServiceRoute('ET', 'TransferApproval');
          }
          break;
    
          case '0048':
          if (services.includes('ET')) {
            navigateToServiceRoute('ET', 'TransferApproval');
          }  break;
          case '0063':
            if (services.includes('ET')) {
              navigateToServiceRoute('ET', 'TransferApproval');
            }
          break;
          case '0011':
            if (services.includes('ET')) {
              navigateToServiceRoute('ET', 'TransferApproval');
            }
          break;
          case '0013':
            if (services.includes('ET')) {
              navigateToServiceRoute('ET', 'Transfer');
            }
            break;
          case '0052':
            if (services.includes('ET')) {
              navigateToServiceRoute('ET', 'Transfer');
            }
            break;
            case '0049':
              if (services.includes('ET')) {
                navigateToServiceRoute('ET', 'TransferApproval');
              }
              break;
              case '0051':
                if (services.includes('ET')) {
                  navigateToServiceRoute('ET', 'Transfer');
                }
                break;
                case '0017':
                  if (services.includes('ET')) {
                    navigateToServiceRoute('ET', 'Report');
                  }
                  break;
                  case '0007':
                    if (services.includes('ET')) {
                      navigateToServiceRoute('ET', 'Transfer');
                    }
                    break;
                    case '0024':
                      if (services.includes('ET')) {
                        navigateToServiceRoute('ET', 'Transfer');
                      }
                      break;
                      case '0025':
                        if (services.includes('ET')) {
                          navigateToServiceRoute('ET', 'TransferApproval');
                        }
                        break;
                        case '0060':
                          if (services.includes('ET')) {
                            navigateToServiceRoute('ET', 'TransferApproval');
                          }
                          break;
                          case '0061':
                            if (services.includes('ET')) {
                              navigateToServiceRoute('ET', 'Transfer');
                            }
                            break;
                            case '0008':
                              if (services.includes('ET')) {
                                navigateToServiceRoute('ET', 'Transfer');
                              }
                              break;
                              case '0045':
                                if (services.includes('ET')) {
                                  navigateToServiceRoute('ET', 'Transfer');
                                }
                                case 'DBD3':
                                  if (services.includes('ET')) {
                                    navigateToServiceRoute('ET', 'Transfer');
                                  }
                                  case 'DBD2':
                                    if (services.includes('ET')) {
                                      navigateToServiceRoute('ET', 'TransferApproval');
                                    }
                                    case '0064':
                                      if (services.includes('ET')) {
                                        navigateToServiceRoute('ET', 'TransferApproval');
                                      }
                                break;
             
        default:
          console.error('Role not recognized:', role);
          this.roleincorrect = true;
          this.message='Role: Contact Administrator';
          break;
      }}
   
   
  }
  
  updateAuthStatus(status: boolean) {
    this.authStatus.next(status);
  }
  getUserData() {
    const role = this.getrole();
    const branch = this.getbranch();
    const user = this.getuser();

    return this.transactionService.getUserDetails(branch, user, role);
  }

  getincorrect(): boolean {
    return this.incorrect;
  }

  getrole(): string {
    return this.Role;
  }

  getbranch(): string {
    return this.branch;
  }
  getbranchName(): string {
    return this.branchname;
  }
  
  getuser(): string {
    return this.name;
  }

  getid(): number {
    return this.id;
  }

  getpassword(): string {
    return this.password;
  }

  getres(): Login {
    this.res = JSON.parse(localStorage.getItem('userData'));

    return this.res;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.updateAuthStatus(true)
      
    this.isAuthenticated = false;
    this.Role = '';
    this.router.navigate(['/login']);
  }

  isitAuthenticated(): boolean {
    
    console.log("token2",this.token,this.backDateAllowed,this.backDateFrom,this.backDateTo)

    return !!localStorage.getItem('token');
  }

  public startTokenExpirationTimer(): void {
    this.tra=true
    const token = localStorage.getItem('token');
  
  // If token does not exist, log out the user
  if (!token) {
    console.log("token1",token)
    this.logout();
    return;
  }

  // Token exists, check if it's valid
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.error('Invalid token format');
    this.logout();
    return;
  }

  const payload = JSON.parse(atob(tokenParts[1]));
  if (!payload || !payload.exp) {
    console.error('Expiration time not found in token payload');
    this.logout();
    return;
  }

  // Check if token is expired
  const expirationTime = payload.exp * 1000; // Convert expiration time to milliseconds
  const currentTime = Date.now();

  // If token is expired, log out immediately
  if (expirationTime <= currentTime) {
    console.log("tokenexpired")
    this.logout();
    return;
  }

  // If token is valid, set up a timer to refresh it
  const refreshTime = expirationTime - currentTime - 5 * 60 * 1000; // Refresh 5 mins before expiration
  if (refreshTime > 0) {
    timer(refreshTime).subscribe(() => {
      this.refreshToken();
    });
  }
}  public refreshToken() {
  // Trigger the login flow again to get a new token
  const username = this.getuser();
  const password = this.getpassword();
  this.login(username, password); // Re-login to get a new token
}

  private resetStatusFlags(): void {
    this.incorrect = false;
    this.locked = false;
    this.suspended = false;
    this.roleincorrect = false;
  }
}
