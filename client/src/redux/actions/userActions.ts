import {
    SET_USER,
    SET_ERRORS,
    CLEAR_ERRORS,
    LOADING_UI,
    SET_UNAUTHENTICATED,
    LOADING_USER
} from "../types";
import axios from "axios";

const setAuthorizationHeader = (token: string) => {
    const FBToken = `Bearer ${token}`;
    localStorage.setItem("FBIdToken", FBToken);
    axios.defaults.headers.common["Authorization"] = FBToken;
};

export const uploadImage = (formData: FormData) => (dispatch: any) => {
    dispatch({ type: LOADING_USER });
    axios
        .post("/user/image", formData)
        .then(() => {
            dispatch(getUserData());
        })
        .catch((err) => console.log(err));
};

export const loginUser = (userData: any, history: any) => (dispatch: any) => {
    dispatch({ type: LOADING_UI });
    axios
        .post("/login", userData)
        .then((res) => {
            setAuthorizationHeader(res.data.token);
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            history.push("/");
        })
        .catch((err) => {
            dispatch({ type: SET_ERRORS, payload: err.response.data });
        });
};

export const signupUser = (newUserData: any, history: any) => (
    dispatch: any
) => {
    dispatch({ type: LOADING_UI });
    axios
        .post("/signup", newUserData)
        .then((res) => {
            setAuthorizationHeader(res.data.token);
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            history.push("/");
        })
        .catch((err) => {
            dispatch({ type: SET_ERRORS, payload: err.response.data });
        });
};

export const logoutUser = () => (dispatch: any) => {
    localStorage.removeItem("FBIdToken");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: SET_UNAUTHENTICATED });
};

export const getUserData = () => (dispatch: any) => {
    dispatch({ type: LOADING_USER });

    axios
        .get("/user")
        .then((res) => {
            dispatch({
                type: SET_USER,
                payload: res.data
            });
        })
        .catch((err) => console.log(err));
};
