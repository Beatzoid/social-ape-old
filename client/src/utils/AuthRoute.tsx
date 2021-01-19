import { Redirect, Route } from "react-router-dom";

const AuthRoute = ({
    component: Component,
    authenticated,
    ...rest
}: {
    component: any;
    authenticated: boolean;
}) => (
    <Route
        {...rest}
        render={(props) =>
            authenticated ? <Redirect to="/" /> : <Component {...props} />
        }
    />
);

export default AuthRoute;
