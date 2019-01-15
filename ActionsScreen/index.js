import React from "react";
import { Animated, Text, View } from "react-native";
import styles from "../Styles";

export default class ActionsSectionComponent extends React.Component {
	state = {
		display: new Animated.Value(this.props.top),
		value: this.props.top,
	};

	componentWillReceiveProps(nextProps) {
		Animated.timing(this.state.display, {
			toValue: nextProps.top,
			duration: 600,
		}).start();
	}

	componentDidMount() {
		this.state.display.addListener(({ value }) => {
			this.setState({ value });
		});
	}

	numberWithCommas = x => {
		let parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	};

	render() {
		const valueToRender = this.numberWithCommas(this.state.value.toFixed(this.props.fixed));

		return (
			<View style={styles.priceSection}>
				<Text style={[styles.priceSectionTop]}>
					{this.props.symbol ? `${this.props.symbol} ` : undefined}
					{valueToRender}
				</Text>
				<Text style={[styles.priceSectionBottom]}>{this.props.bottom}</Text>
			</View>
		);
	}
}
