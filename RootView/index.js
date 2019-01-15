import React from "react";
import { Provider, connect } from "react-redux";
import { store } from "../Store";
import AppScreen from "../AppScreen";

const mapStateToProps = state => {
	return { ...state };
};

const ConnectedAppScreen = connect(mapStateToProps)(AppScreen);

export default class RootComponent extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<ConnectedAppScreen />
			</Provider>
		);
	}
}
