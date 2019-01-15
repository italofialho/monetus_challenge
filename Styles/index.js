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
		color: "#000",
		fontSize: 32,
	},
	priceSectionBottom: {
		color: "#000",
		fontSize: 12,
		marginTop: 2,
	},
	searchRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		width,
	},
	searchLogo: {
		flex: 1,
		height: undefined,
		width: undefined,
		margin: 20,
	},
	searchInput: {
		width: width * 0.9,
		borderColor: "#dedede",
		borderWidth: 1,
		backgroundColor: "#fff",
		borderRadius: 5,
        elevation: 3,
        padding: 10
    },
    noActionsText:{
        textAlign: "center",
        fontSize: 22,
    }
});
