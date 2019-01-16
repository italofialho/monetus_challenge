import React from "react";
import { Animated, Text, View, TouchableOpacity, AsyncStorage, Alert, Dimensions } from "react-native";
import styles from "../Styles";
import axios from "axios";
import { connect } from "react-redux";
import _ from "underscore";
import { VictoryArea, VictoryChart, VictoryTheme } from "victory-native";

class ActionsSectionComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			display: new Animated.Value(0),
			value: 0,
			fixed: 2,
			loading: true,
			symbolDetail: {},
			showDetails: false,
			symbolChart: [],
			lastUpdateTimeOut: 0,
			updating: false,
			intervalId: null,
		};
	}

	componentDidMount() {
		this.state.display.addListener(({ value }) => {
			this.setState({ value });
		});
		this.fetchDetailsBySymbol(this.props.symbol);
		const intervalId = setInterval(() => {
			this.setState({ lastUpdateTimeOut: this.state.lastUpdateTimeOut - 1 }, () => {
				if (this.state.lastUpdateTimeOut === 0) {
					this.updateDetailsBySymbol(this.props.symbol);
				}
			});
		}, 1000);
		this.setState({ intervalId });
	}

	componentWillUnmount() {
		this.state.display.removeAllListeners();
		clearInterval(this.state.intervalId);
	}

	fetchDetailsBySymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			this.setState({ loading: true });
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`);
			this.setState({ symbolDetail: data, loading: false, lastUpdateTimeOut: 60 }, () => {
				Animated.timing(this.state.display, {
					toValue: data.latestPrice,
					duration: 600,
					useNativeDriver: true,
				}).start();
			});
		} catch (error) {
			console.log("fetchDetailsBySymbol error:", error);
			this.setState({ loading: false });
		}
	};

	updateDetailsBySymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			this.setState({ updating: true });
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`);
			this.setState({ symbolDetail: data, updating: false, lastUpdateTimeOut: 60 }, () => {
				Animated.timing(this.state.display, {
					toValue: data.latestPrice,
					duration: 600,
					useNativeDriver: true,
				}).start();
			});
		} catch (error) {
			console.log("fetchDetailsBySymbol error:", error);
			this.setState({ updating: false });
		}
	};

	loadChartForSymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/chart/dynamic`);
			this.setState({ symbolChart: data.data });
		} catch (error) {
			console.log("loadChartForSymbol error:", error);
			this.setState({ loading: false });
		}
	};

	numberWithCommas = x => {
		return Number(x).toLocaleString("pt-BR", {
			style: "decimal",
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		});
	};

	toggleDetails = () => {
		const newState = !this.state.showDetails;
		if (newState) {
			this.loadChartForSymbol(this.props.symbol);
		}
		this.setState({ showDetails: newState });
	};

	removeSymbol = async () => {
		Alert.alert(
			"Deseja remover?",
			"Você tem certeza que deseja remover o simbolo selecionado?",
			[
				{ text: "Cancelar", onPress: () => {}, style: "cancel" },
				{
					text: "REMOVER",
					onPress: async () => {
						const { symbol } = this.props;
						const userSymbolsString = await AsyncStorage.getItem("userSymbols");
						let userSymbols = JSON.parse(userSymbolsString);
						userSymbols = _.filter(
							userSymbols,
							s => String(s).toUpperCase() !== String(symbol).toUpperCase(),
						);

						this.props.dispatch({
							type: "UPDATE_USER_SYMBOLS",
							data: userSymbols,
						});

						await AsyncStorage.setItem("userSymbols", JSON.stringify(userSymbols));
					},
				},
			],
			{ cancelable: false },
		);
	};

	renderDetails() {
		const { symbolChart } = this.state;

		if (!_.size(symbolChart) > 0) {
			return (
				<View>
					<Text style={{ textAlign: "center", color: "#657786" }}>Carregando graficos...</Text>
				</View>
			);
		}

		const max = _.max(symbolChart, item => {
			return item.average;
		}).average;

		let updatesCount = 8;

		return (
			<View>
				<VictoryChart
					theme={VictoryTheme.material}
					minDomain={{ y: 0 }}
					maxDomain={{ y: parseInt(max + 100) }}
					height={Dimensions.get("window").height * 0.5}>
					<VictoryArea
						interpolation="natural"
						style={{
							data: { fill: "#0047bb" },
						}}
						labels={datum => datum.y}
						data={_.chain(symbolChart)
							.last(updatesCount)
							.map((item, idx) => ({ x: item.minute, y: parseInt(item.average) }))
							.value()}
					/>
				</VictoryChart>
				<Text style={{ paddingHorizontal: 20, color: "#657786" }}>
					Exibindo as ultimas {updatesCount} atualizações.
				</Text>
			</View>
		);
	}

	render() {
		const valueToRender = this.numberWithCommas(this.state.value.toFixed(this.state.fixed));
		const { loading, symbolDetail, showDetails, lastUpdateTimeOut, updating } = this.state;
		return (
			<View>
				<TouchableOpacity onLongPress={() => this.removeSymbol()} onPress={() => this.toggleDetails()}>
					<View style={styles.priceSection}>
						<Text style={[styles.priceSectionTop]}>
							{this.props.symbol && `${this.props.symbol} `}
							{!loading && valueToRender}
						</Text>
						<Text style={[styles.priceSectionBottom]}>
							{loading ? "Carregando informações..." : symbolDetail.companyName}
						</Text>
						<Text style={[styles.priceSectionBottom]}>
							{updating
								? "Atualizando..."
								: !loading && lastUpdateTimeOut > 0 && `Atualizando em ${lastUpdateTimeOut}s.`}
						</Text>
					</View>
				</TouchableOpacity>
				{showDetails && this.renderDetails()}
			</View>
		);
	}
}

const mapStateToProps = state => {
	return { ...state };
};

export default connect(mapStateToProps)(ActionsSectionComponent);
