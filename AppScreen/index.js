import React from "react";
import {
	StatusBar,
	View,
	ActivityIndicator,
	ScrollView,
	Image,
	Text,
	AsyncStorage,
	TextInput,
	TouchableOpacity,
	Alert,
} from "react-native";
import styles from "../Styles";
import MonetusLogo from "../assets/icons/monetus-logo.png";
import axios from "axios";
import _ from "underscore";
import ActionsSectionComponent from "../ActionsScreen";
import * as Animatable from "react-native-animatable";

export default class AppScreen extends React.Component {
	state = {
		value: 1,
		loadingText: "Carregando...",
	};

	componentDidMount() {
		this.getUserSymbols();
	}

	componentWillReceiveProps(nextProps) {
		console.log("AppScreen componentWillReceiveProps:", nextProps);
	}

	getUserSymbols = async () => {
		try {
			this.setState({ loadingText: "Carregando lista de ações..." });

			/* await AsyncStorage.setItem(
				"userSymbols",
				JSON.stringify([
					"TSLA",
					"AAPL",
					"GOOGL",
					"FB",
					"PBR",
					"TSLA",
					"AAPL",
					"GOOGL",
					"FB",
					"PBR",
					"TSLA",
					"AAPL",
					"GOOGL",
					"FB",
					"PBR",
				]),
			); */
			const userSymbolsString = await AsyncStorage.getItem("userSymbols");
			const userSymbols = JSON.parse(userSymbolsString);
			this.props.dispatch({
				type: "UPDATE_USER_SYMBOLS",
				data: userSymbols,
			});

			this.fetchDetailsBySymbol(userSymbols);
		} catch (error) {
			console.log("getUserSymbols error:", error);
		}
	};

	fetchDetailsBySymbol = async symbols => {
		const promiseArr = [];

		_.each(symbols, symbol => {
			const currentSymbol = String(symbol).toLowerCase();
			promiseArr.push(axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`));
		});

		let symbolDetails = await Promise.all(promiseArr);
		symbolDetails = _.map(symbolDetails, "data");

		this.props.dispatch({
			type: "UPDATE_ACTIONS_DETAILS",
			data: symbolDetails,
		});

		this.props.dispatch({
			type: "UPDATE_STATE",
			state: { isAvailable: true },
		});
	};

	renderLoading() {
		return (
			<View style={styles.containerFlex}>
				<Image source={MonetusLogo} />
				<ActivityIndicator size="large" color="#0047BB" />
				<Text>{this.state.loadingText}</Text>
			</View>
		);
	}

	onChangeText = text => {
		this.setState({ isLoading: true, value: text });
	};

	addNewSymbol = async symbol => {
		const userSymbolsString = await AsyncStorage.getItem("userSymbols");
		let userSymbols = JSON.parse(userSymbolsString);
		if (!userSymbols) userSymbols = [];

		const findSymbol = _.findWhere(this.props.actionsDetails, { symbol });
		if (findSymbol) {
			Alert.alert("Ooops!", "Você já adicionou esse simbolo.");
			return;
		}

		userSymbols.push(String(symbol).toUpperCase());

		this.props.dispatch({
			type: "UPDATE_USER_SYMBOLS",
			data: userSymbols,
		});

		this.fetchDetailsBySymbol(userSymbols);

		await AsyncStorage.setItem("userSymbols", JSON.stringify(userSymbols));
	};

	renderNewActionInput = () => {
		return (
			<View style={styles.searchRow}>
				<TextInput
					style={styles.searchInput}
					returnKeyType="send"
					value={this.state.query}
					placeholder="Informe o simbolo de uma ação para adicionar"
					onSubmitEditing={e => this.addNewSymbol(e.nativeEvent.text)}
				/>
			</View>
		);
	};

	render() {
		if (!this.props.isAvailable) {
			return this.renderLoading();
		}

		return (
			<View style={styles.container}>
				<StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
				{this.renderNewActionInput()}
				{_.size(this.props.actionsDetails) ? (
					<ScrollView>
						{_.map(this.props.actionsDetails, (action, index) => {
							return (
								<Animatable.View
									animation={index % 2 === 0 ? "slideInRight" : "slideInLeft"}
									useNativeDriver={true}
									key={_.uniqueId()}>
									<TouchableOpacity>
										<ActionsSectionComponent
											top={Number(action.latestPrice)}
											bottom={action.companyName}
											symbol={action.symbol}
											fixed={2}
										/>
									</TouchableOpacity>
								</Animatable.View>
							);
						})}
					</ScrollView>
				) : (
					<View>
						<Text style={styles.noActionsText}>Você não adicionou nenhuma ação ainda...</Text>
					</View>
				)}
			</View>
		);
	}
}
