import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-slip',
  templateUrl: './slip.component.html',
  styleUrls: ['./slip.component.css']
})
export class SlipComponent {
  @Input() transaction: any;
  @ViewChild('printSection') printSection: ElementRef;

  printSlip(): void {
    const printContent = this.printSection.nativeElement.innerHTML;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
  
    // Wait until the window is loaded before writing content
    WindowPrt.document.open();
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; border: 1px solid  #adacac; }
            .approval-slip { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid  #adacac; }
            .approval-slip-wrap { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid  #adacac; }
           
            .logo-img { width: 10%; height: 10%; margin-left: 120px; }
            .slip-title, .cooperative-name, .branch, .date, .teller { font-size: 14px; font-weight: normal; color: black; }
                       .slip-title2,
 {
  font-size: 14px;
  font-weight: normal;
  color: black;
 border-bottom: 1px solidrgb(73, 72, 72);;
}
            .header { display: flex; align-items: center; justify-content: center; }
            .slip-divider { border: 0; height: 1px; background: #000; margin: 10px 0; }
            .slip-section { box-sizing: border-box; padding: 10px; }
            .slip-section p { margin: 5px 0; text-align: left; }
            .clear { clear: both; }
            .right-align { text-align: right; }
            .left-section { float: left; width: 50%; }
            .right-section { float: left; width: 50%; margin-top: 24%; }
            .slip-title span { text-align: center; font-size: 16px; font-weight: bold; }
            .date { text-align: right; font-size: 14px; font-family: 'Courier New', Courier, monospace; }
            .logo-img { width: 10%; height: 5%; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    WindowPrt.document.close();
  }


  
  

 
}