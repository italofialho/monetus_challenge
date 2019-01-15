import { createStore } from "redux";
import _ from "underscore";

const INITIAL_STATE = {
	btc: 0,
	ltc: 0,
	euro: 0,
	eth: 0,
	isAvailable: false,
	symbols: [],
	userSymbols: [],
	actionsDetails: [],
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
	}
};

export const store = createStore(reducer, {});
