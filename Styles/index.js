import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export default StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		flex: 1,
	},
	containerFlex: {
		backgroundColor: "#fff",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	slider: {
		width: "100%",
	},
	priceSection: {
		width: "100%",
		padding: 16,
	},
	priceSectionTop: {
		color: "#0047bb",
		fontSize: 32,
	},
	priceSectionBottom: {
		color: "#657786",
		fontSize: 12,
		marginTop: 2,
	},
	searchRow: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		width,
	},
	imgLogo: {
		width: width * .5,
		height: width * .5,
        resizeMode: "contain",
    },
    imgLogoInput: {
		width: width * .15,
        height: width * .15,
        margin: 10,
	},
	searchInput: {
		width: width * 0.9,
		borderColor: "#0047bb",
		borderWidth: 1,
		backgroundColor: "#fff",
		padding: 10,
	},
	noActionsText: {
		textAlign: "center",
		fontSize: 22,
	},
	defaultPadding: {
		padding: 20,
	},
});
