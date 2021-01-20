import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";

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

const mapStateToProps = (state: any) => ({
    authenticated: state.user.authenticated
});

(AuthRoute as any).propTypes = {
    user: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(AuthRoute);
