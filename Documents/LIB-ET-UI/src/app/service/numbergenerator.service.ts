import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReferenceNumberService {

  constructor() { }

  generateReferenceNumber(): string {
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomNumber = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    return `LIB/${dateString}/${randomNumber}`;
  }

  generateMessageNumber(length: number = 10): string {
    return this.generateRandomString(length);
  }

  generatePaymentNumber(length: number = 15): string {
    return this.generateRandomString(length);
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
