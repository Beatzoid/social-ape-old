import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

declare module "@material-ui/core/styles/createMuiTheme" {
    interface ThemeOptions {
        loginRegisterStyles: any;
    }
}
