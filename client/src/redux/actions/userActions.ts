import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from "../types";
import axios from "axios";

export const loginUser = (userData: any, history: any) => (dispatch: any) => {
    dispatch({ type: LOADING_UI });
    axios
        .post("/login", userData)
        .then((res) => {
            const token = `Bearer ${res.data.token}`;
            localStorage.setItem("FBIdToken", token);
            axios.defaults.headers.common["Authorization"] = token;

            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            history.push("/");
        })
        .catch((err) => {
            dispatch({ type: SET_ERRORS, payload: err.response.data });
        });
};

export const getUserData = () => (dispatch: any) => {
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
