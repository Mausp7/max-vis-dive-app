const getMod = (o2, ppO2Max) => {
	return Math.floor((ppO2Max / o2 - 1) * 100) / 10;
};

const GasMix = class {
	constructor(o2 = 0.21, he2 = 0) {
		this.o2 = o2;
		this.he2 = he2;
		this.n2 = Number((1 - o2 - he2).toFixed(2));
		this.diveMod = getMod(this.o2, 1.4);
		this.decoMod = getMod(this.o2, 1.6);
	}
};

export default GasMix;