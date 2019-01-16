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

	async componentDidMount() {
		await this.getSymbols();
		await this.getUserSymbols();
	}

	getSymbols = async () => {
		try {
			this.props.dispatch({
				type: "UPDATE_LOADING_TEXT",
				data: "Carregando lista de simbolos...",
			});
			const { data } = await axios.get("https://api.iextrading.com/1.0/ref-data/symbols");
			this.props.dispatch({
				type: "UPDATE_SYMBOLS",
				data: data,
			});
		} catch (error) {
			console.log("getUserSymbols error:", error);
		}
	};

	getUserSymbols = async () => {
		try {
			this.props.dispatch({
				type: "UPDATE_LOADING_TEXT",
				data: "Carregando lista de ações...",
			});

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

	onChangeText = text => {
		this.setState({ isLoading: true, value: text });
	};

	addNewSymbol = async symbol => {

        if(!symbol){
            Alert.alert("Ooops!", "Você precisa digitar um simbolo.");
            return;
        }

		const userSymbolsString = await AsyncStorage.getItem("userSymbols");
		let userSymbols = JSON.parse(userSymbolsString);
		if (!userSymbols) userSymbols = [];

		symbol = String(symbol).toUpperCase();

		const findSymbol = _.findWhere(this.props.actionsDetails, { symbol });
		const symbolExists = _.findWhere(this.props.symbols, { symbol });
		if (findSymbol) {
			Alert.alert("Ooops!", "Você já adicionou esse simbolo.");
			return;
		}

		if (!symbolExists) {
			Alert.alert("Ooops!", "Não encontramos a simbolo informado.");
			return;
		}

		userSymbols.push(String(symbol).toUpperCase());

		this.props.dispatch({
			type: "UPDATE_USER_SYMBOLS",
			data: userSymbols,
		});

		//this.fetchDetailsBySymbol(userSymbols);

		await AsyncStorage.setItem("userSymbols", JSON.stringify(userSymbols));
	};

	renderLoading() {
		return (
			<View style={styles.containerFlex}>
				<View style={styles.defaultPadding}>
					<Image source={MonetusLogo} style={[styles.defaultPadding, styles.imgLogo]} />
				</View>
				<ActivityIndicator size="large" color="#0047BB" />
				<Text style={styles.defaultPadding}>{this.props.loadingText}</Text>
			</View>
		);
	}

	renderNewActionInput = () => {
		return (
			<View style={styles.searchRow}>
				<Image source={MonetusLogo} style={[styles.defaultPadding, styles.imgLogoInput]} />
				<TextInput
					style={styles.searchInput}
					returnKeyType="send"
					placeholder="Informe o simbolo de uma ação para adicionar"
                    onSubmitEditing={e => this.addNewSymbol(e.nativeEvent.text)}
                    autoCapitalize="characters"
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
				{_.size(this.props.userSymbols) ? (
					<ScrollView>
						{_.map(this.props.userSymbols, (symbol, index) => {
							return (
								<Animatable.View
									animation={index % 2 === 0 ? "slideInRight" : "slideInLeft"}
									useNativeDriver={true}
									key={_.uniqueId()}>
									<ActionsSectionComponent symbol={symbol} />
								</Animatable.View>
							);
						})}
					</ScrollView>
				) : (
					<View style={[styles.defaultPadding, styles.containerFlex]}>
						<Image source={MonetusLogo} style={[styles.defaultPadding, styles.imgLogo]} />
						<Text style={[styles.noActionsText, styles.defaultPadding]}>
							Você não adicionou nenhuma ação ainda...
						</Text>
					</View>
				)}
			</View>
		);
	}
}
