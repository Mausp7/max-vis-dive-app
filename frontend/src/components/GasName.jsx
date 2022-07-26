import React from "react";

const GasName = ({ gas }) => {
	const getGasName = () => {
		if (gas.he2 === 0) {
			switch (gas.o2) {
				case 0.21:
					return "Air";
				case 1:
					return "Oxigen";
				default:
					return `Nitrox ${(gas.o2 * 100).toFixed(0)}%`;
			}
		} else {
			return `Trimix ${(gas.o2 * 100).toFixed(0)}/${(gas.he2 * 100).toFixed(
				0
			)}`;
		}
	};

	return <>{getGasName()}</>;
};

export default GasName;
