import { DOCUMENT } from '@angular/common';
import { Component, Inject, Renderer2 } from '@angular/core';
import { Login } from 'app/models/data.model';
import { LoginService } from 'app/service/login.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  userAdded:boolean=false;
  usedReset:boolean=false;
  userDeleted:boolean=false;
  userUnsuspended:boolean=false;
  useredit:boolean=false;
  users:Login[]=[]
  singleUser:Login
  suspendedUsers:Login[]=[]
    selectedUserDelete:number;
  selectedUserReset:number;
  selectedUserUnsuspend:number;
  unsuspendedUsers:Login[]=[]

  selectedUserUnlocked:number;
  lockedUsers:Login[]=[]
  userUnlocked:boolean=false;

  searchControlS: FormControl = new FormControl();
  searchControl: FormControl = new FormControl();
  searchControlUS: FormControl = new FormControl();
  searchControlL: FormControl = new FormControl();


  filteredUsers: Login[] = [];
  filteredUnsuspendedUsers: Login[] = [];
  filteredSuspendedUsers: Login[] = [];
  filteredLockedUsers: Login[] = [];

  // Search terms
  searchTermReset: string = '';
  searchTermDelete: string = '';
  searchTermUnsuspend: string = '';
  searchTermUnlock: string = '';

  lockUserData:Login = { 
    id: 0,
    userName: "",
    password: " ",
    role: "",      roles:[],
    updatedBy:"",
    updatedDate:" ",
    status:"",
    branch:"",
    fullName:"" ,
    branchCode:"" , };

    resetUserData:Login = { 
      id: 0,
      userName: "",
      password: " ",
      role: "",      roles:[],
      updatedBy:"",
      updatedDate:" ",
      status:"",
      branch:"",
      fullName:"" ,
      branchCode:"" , };

      unsuspendUserData:Login = { 
        id: 0,
        userName: "",
        password: " ",
        role: "",      roles:[],
        updatedBy:"",
        updatedDate:" ",
        status:"",
        branch:"",
        fullName:"" ,
        branchCode:"" , };
      deleteUserData:Login = { 
        id: 0,
        userName: "",
        password: " ",
        role: "",      roles:[],
        updatedBy:"",
        updatedDate:" ",
        status:"",
        branch:"",
        fullName:"" ,
        branchCode:"" , };

  constructor(private userService: LoginService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {

   }


  ngOnInit(): void {

       this.userService.getAll().subscribe((t) => {
        this.users = t
   this.suspendedUsers=t.filter(t=>t.status=='Suspended');
   this.lockedUsers=t.filter(t=>t.status=='Locked');
   this.unsuspendedUsers=t.filter(t=>t.status!='Suspended');

    this.filteredUsers = this.users;
  this.filteredUnsuspendedUsers = this.unsuspendedUsers;
  this.filteredSuspendedUsers = this.suspendedUsers;
  this.filteredLockedUsers = this.lockedUsers;
  });
    
  

  this.searchControl.valueChanges.subscribe((searchTerm: string) => {
    this.filterUsers(searchTerm);
  });
  
  this.searchControlL.valueChanges.subscribe((searchTerm: string) => {
    this.filterUsersL(searchTerm);
  });
  
  this.searchControlUS.valueChanges.subscribe((searchTerm: string) => {
    this.filterUsersUS(searchTerm);
  });
  
  this.searchControlS.valueChanges.subscribe((searchTerm: string) => {
    this.filterUsersS(searchTerm);
  });
  } clearSearchL() {
    this.searchControlL.setValue('');
  }
  clearSearchS() {
    this.searchControlS.setValue('');
  }
  clearSearchUS() {
    this.searchControlUS.setValue('');
  }

  clearSearch() {
    this.searchControl.setValue('');
  }


  filterUsersUS(searchTerm: string) {
    if (!searchTerm) {
      this.filteredUnsuspendedUsers = this.unsuspendedUsers;
      return;
    }

    searchTerm = searchTerm.toLowerCase();
    this.filteredUnsuspendedUsers = this.unsuspendedUsers.filter(br =>
      br.userName.toLowerCase().includes(searchTerm)
    );
    
  }
  isString(value: any): boolean {
    return typeof value === 'string';
  }
  filterUsers(searchTerm: string) {
  if (!searchTerm) {
    this.filteredUsers = this.users;
    return;
  }

  searchTerm = searchTerm.toLowerCase();
  this.filteredUsers = this.users.filter(br =>
    br.userName.toLowerCase().includes(searchTerm)
  );
  
}
filterUsersS(searchTerm: string) {
  if (!searchTerm) {
    this.filteredSuspendedUsers = this.suspendedUsers;
    return;
  }

  searchTerm = searchTerm.toLowerCase();
  this.filteredSuspendedUsers = this.suspendedUsers.filter(br =>
    br.userName.toLowerCase().includes(searchTerm)
  );
  
}filterUsersL(searchTerm: string) {
  if (!searchTerm) {
    this.filteredLockedUsers = this.lockedUsers;
    return;
  }

  searchTerm = searchTerm.toLowerCase();
  this.filteredLockedUsers = this.lockedUsers.filter(br =>
    br.userName.toLowerCase().includes(searchTerm)
  );
  
}
  resetPassword() {
    this.resetUserData.password="123456"
    this.userService.updateAdminUser( this.resetUserData,this.resetUserData.id).subscribe(
      response => {
 
 this.showSuccessMessage('Successfull!');
      
      this.userService.getAll().subscribe((t) => {
        this.users = t
        this.suspendedUsers=t.filter(t=>t.status=='Suspended');
        this.lockedUsers=t.filter(t=>t.status=='Locked');
        this.unsuspendedUsers=t.filter(t=>t.status!='Suspended');

        this.resetUserData= { 
          id: 0,
          userName: "",
          password: " ",
          role: "",      roles:[],
          updatedBy:"",
          updatedDate:" ",
          status:"",
          branch:"",
          fullName:"" ,
          branchCode:"" , };
    
          this.unsuspendUserData={ 
            id: 0,
            userName: "",
            password: " ",
            role: "",      roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
          this.deleteUserData = { 
            id: 0,
            userName: "",
            password: " ",
            role: "",      roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
    
      });
        
      },
      error => {
        console.error('Failed to reset password:', error);
        // Handle error and display error message
      }
    );
  }

  removeUser() {
    this.deleteUserData.status='Suspended';
    this.userService.updateAdminUser(this.deleteUserData,this.deleteUserData.id).subscribe(
      response => {
        this.showSuccessMessage('Successfull!');

        
       this.userService.getAll().subscribe((t) => {
        this.users = t
        this.suspendedUsers=t.filter(t=>t.status=='Suspended');
        this.lockedUsers=t.filter(t=>t.status=='Locked');
        this.unsuspendedUsers=t.filter(t=>t.status!='Suspended');
        this.resetUserData= { 
          id: 0,
          userName: "",
          password: " ",
          role: "",      roles:[],
          updatedBy:"",
          updatedDate:" ",
          status:"",
          branch:"",
          fullName:"" ,
          branchCode:"" , };
    
          this.unsuspendUserData={ 
            id: 0,
            userName: "",
            password: " ",
            role: "",      roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
          this.deleteUserData = { 
            id: 0,
            userName: "",
            password: " ",
            role: "",
            roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
    
      });
        
      },
      error => {
        console.error('Failed to remove user:', error);
        // Handle error and display error message
      }
    );
  }
  private showSuccessMessage(message: string, isError: boolean = false): void {
    const panelClass = isError ? 'error-snackbar' : 'success-snackbar';
    const snackBarRef = this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    snackBarRef.afterOpened().subscribe(() => {
      const snackBarElement = this.document.querySelector('.mat-snack-bar-container');
      if (snackBarElement) {
            this.renderer.setStyle(snackBarElement, 'background-color', isError ? 'red' : 'green');
        this.renderer.setStyle(snackBarElement, 'color', 'white');
    
          } else {
        console.error('Snackbar element not found');
      }
    });
  }
  
unsuspendUser() {
    this.unsuspendUserData.status='';
    this.userService.updateAdminUser(this.unsuspendUserData,this.unsuspendUserData.id).subscribe(
      response => {
        this.showSuccessMessage('Successfull!');
  
        
       this.userService.getAll().subscribe((t) => {
        this.users = t
        this.suspendedUsers=t.filter(t=>t.status=='Suspended');
        this.lockedUsers=t.filter(t=>t.status=='Locked');
        this.unsuspendedUsers=t.filter(t=>t.status!='Suspended');
        this.resetUserData= { 
          id: 0,
          userName: "",
          password: " ",
          role: "",
          roles:[],
          updatedBy:"",
          updatedDate:" ",
          status:"",
          branch:"",
          fullName:"" ,
          branchCode:"" , };
    
          this.unsuspendUserData={ 
            id: 0,
            userName: "",
            password: " ",
            role: "",
            roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
          this.deleteUserData = { 
            id: 0,
            userName: "",
            password: " ",
            role: "",
            roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
    
      });
        
      },
      error => {
        console.error('Failed to remove user:', error);
        // Handle error and display error message
      }
    );
  }
  unlockUser() {
    this.lockUserData.status='';
    this.userService.updateAdminUser(this.lockUserData,this.lockUserData.id).subscribe(
      response => {
        this.showSuccessMessage('Successfull!');

        
       this.userService.getAll().subscribe((t) => {
        this.users = t
        this.suspendedUsers=t.filter(t=>t.status=='Suspended');
        this.lockedUsers=t.filter(t=>t.status=='Locked');
        this.unsuspendedUsers=t.filter(t=>t.status!='Suspended');
        this.resetUserData= { 
          id: 0,
          userName: "",
          password: " ",
          role: "",
          roles:[],
          updatedBy:"",
          updatedDate:" ",
          status:"",
          branch:"",
          fullName:"" ,
          branchCode:"" , };
    
          this.unsuspendUserData={ 
            id: 0,
            userName: "",
            password: " ",
            role: "",
            roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
          this.deleteUserData = { 
            id: 0,
            userName: "",
            password: " ",
            role: "",
            roles:[],
            updatedBy:"",
            updatedDate:" ",
            status:"",
            branch:"",
            fullName:"" ,
            branchCode:"" , };
    
      });
        
      },
      error => {
        console.error('Failed to remove user:', error);
        // Handle error and display error message
      }
    );
  }
  onUserselected(){
    this.userService.getUser(this.selectedUserDelete).subscribe((t) => {
      this.singleUser = t;
      this.deleteUserData=t

    });
  }
  onUserselectedReset(){
    this.userService.getUser(this.selectedUserReset).subscribe((t) => {
      this.singleUser = t;
      this.resetUserData=t;

    
    });
  }
  onUserselectedUnsuspended(){
    this.userService.getUser(this.selectedUserUnsuspend).subscribe((t) => {
      this.singleUser = t;
      this.unsuspendUserData=t
    
    });
  }
  onUserselectedUnlocked(){
    this.userService.getUser(this.selectedUserUnlocked).subscribe((t) => {
      this.singleUser = t;
      this.lockUserData=t
    
    });
  }


}