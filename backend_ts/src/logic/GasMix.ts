export class GasMix {

	private _fO2: number;
	private _fHe2: number;
	private _fN2: number;

	constructor(fO2: number = 0.21, fHe2: number = 0) {
		this._fO2 = fO2;
		this._fHe2 = fHe2;
		this._fN2 = Math.round((1 - fO2 - fHe2) * 100) / 100;
	};

	get fO2():number {
		return this._fO2;
	}

	get fHe2():number {
		return this._fHe2;
	}

	get fN2():number {
		return this._fN2;
	}

	public MOD(ppO2: number = 1.4):number {
		return Math.floor((ppO2 / this._fO2 - 1) * 100) /10;
	}

	public END(ppN2: number = 3.4):number {
		return Math.floor((ppN2 / this._fN2 - 1) * 100) /10;
	}
}