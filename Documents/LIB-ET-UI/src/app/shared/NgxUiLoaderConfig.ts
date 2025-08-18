import { NgxUiLoaderConfig, SPINNER } from "ngx-ui-loader";

export const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    bgsColor: "red",
    bgsSize: 40,
    bgsType: SPINNER.threeStrings, // background spinner type
    fgsType: SPINNER.chasingDots, // foreground spinner type
    pbThickness: 5, // progress bar thickness
  };