import { Injectable } from '@angular/core';
import {environment} from 'environments/environment'

@Injectable({
  providedIn: 'root', // Make the service available throughout the app
})
export class ApiUrlService {
 
  //readonly apiUrl = 'https://10.1.10.106:70/api/';
   readonly apiValidUserUrl = 'http://10.1.10.106:3060/api/';
  readonly apiUrl = 'https://10.1.10.106:8765/api/';
 //readonly apiUrl = 'http://10.1.10.106:4060/api/';
 //readonly apiUrl = 'http://10.1.22.206:4060/';
 //readonly apiUrl = 'https://10.1.10.106:7070/api/';

// readonly apiUrlUser = 'http://10.1.10.106:4040/api';
readonly apiUrlUser = 'https://10.1.10.106:4444/api';
readonly apiAwachUrl = environment.awachUrl;
}