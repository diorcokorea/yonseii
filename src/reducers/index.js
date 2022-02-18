import { combineReducers } from "redux";
import { globalVar } from "../config";

const loggedReducer = (state = false, action) => {
  switch (action.type) {
    case "SIGN_IN":
      return !state;
    default:
      return state;
  }
};
export const glovalVariableReducer = (state = globalVar, action) => {
  return { ...state, [action.type]: action.payload };
};

const allReducers = combineReducers({
  isLogged: loggedReducer,
  global: glovalVariableReducer,
});

export default allReducers;
