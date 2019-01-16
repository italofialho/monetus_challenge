import { createStore } from "redux";
import _ from "underscore";

const INITIAL_STATE = {
	isAvailable: false,
	symbols: [],
	userSymbols: [],
	actionsDetails: [],
	loadingStage: 0,
	loadingText: "",
};

const reducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case "UPDATE_STATE":
			return { ...state, ...action.state };
		case "UPDATE_SYMBOLS":
			return { ...state, symbols: action.data };
		case "UPDATE_USER_SYMBOLS":
			return { ...state, userSymbols: action.data };
		case "UPDATE_ACTIONS_DETAILS":
			return { ...state, actionsDetails: _.map(action.data) };
		case "UPDATE_LOADING_STATE":
			return { ...state, loadingStage: action.data };
		case "UPDATE_LOADING_TEXT":
			return { ...state, loadingText: action.data };
	}
};

export const store = createStore(reducer, {});
