export interface ConfirmationCommonDialogData {
    title?: string; //confirmation dialog title
    titleTooltip?: string; //tooltip for title if needed
    icon?: string; //dialog icon
    message?: string; // confirmation dialog subtitle
    cancelButtonText?: string; //cancel button text
    submitButtonText?: string; //submit button text
    type?:string; //confirmation, info
    isInfoActionable?:boolean; //on hover list show info dialog
    // data?: dialogData[]; //processed data for showing custom info ...etc
    submitButtonStatus?:boolean; //hide/show submit button
    cancelButtonStatus?:boolean; //hide/show cancel button
    width?:string; //popup width
    height?:string; //popup width
  }