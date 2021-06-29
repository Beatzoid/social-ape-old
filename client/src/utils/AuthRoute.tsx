import { Redirect, Route, RouteProps } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
interface AuthRouteProps extends RouteProps {
    component: React.ElementType;
    authenticated: boolean;
}

const AuthRoute = ({
    component: Component,
    authenticated,
    ...rest
}: AuthRouteProps) => (
    <Route
        {...rest}
        render={(props) =>
            authenticated === true ? (
                <Redirect to="/" />
            ) : (
                <Component {...props} />
            )
        }
    />
);

export default AuthRoute;
