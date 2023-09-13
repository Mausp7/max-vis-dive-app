class GasMix {
	constructor(o2 = 0.21, he2 = 0, divePpO2Max= 1.4,decoPpO2Max = 1.6) {
		this._o2 = o2;
		this._he2 = he2;
		this._n2 = Number((1 - o2 - he2).toFixed(2));
		this._diveMod = this.getMod(this.o2, divePpO2Max);
		this._decoMod = this.getMod(this.o2, decoPpO2Max);
	};

	getMod = (o2, ppO2Max) => {
		return  Math.floor((ppO2Max / o2 - 1) * 100) /10;
	}

	get o2() {
		return this._o2;
	}

	get he2() {
		return this._he2;
	}

	get n2() {
		return this._n2;
	}

	get diveMod() {
		return this._diveMod;
	}

	get decoMod() {
		return this._decoMod;
	}
}

module.exports = GasMix;