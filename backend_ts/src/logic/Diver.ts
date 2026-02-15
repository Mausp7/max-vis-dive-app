import {TissueProperty, TissueSettings} from './TissueSettings';
import {Tissue} from './Tissue';
import {GasMix} from './GasMix';
import { Utils } from './Utils';

export type DiveTableEntry = Record<"depth" | "limit", number>

export type DiveData = {
	"depth": number,
	"duration": number,
	"gasMix": GasMix,
}

export class Diver {
	private _tissues: Tissue[];
	private _gasMix: GasMix;
	private _maxPPO2: number = 1.4;

	constructor(startPressure: number = 1, gasMix: GasMix = new GasMix, tissueSettings: TissueProperty[] = TissueSettings) {
		this._gasMix = gasMix;
		this._tissues = this.initTissues(startPressure, tissueSettings);
	}

	public get maxPPO2(): number {
		return this._maxPPO2;
	}

	public setMaxPPO2(maxPPO2: number): Diver{
		if (1.2 < maxPPO2 && maxPPO2 < 2)
		{
			this._maxPPO2
		}
		
		return this;
	}

	public switchGasMix(gasMix: GasMix): Diver {
		this._gasMix = gasMix;

		for (const tissue of this._tissues)
		{
			tissue.switchGasMix(this._gasMix);
		}

		return this;
	}

	private initTissues(startPressure: number, tissueSettings: TissueProperty[]): Tissue[] {
		const tissues = [];

		for (const t of tissueSettings) {
			tissues.push(new Tissue(t.halfTime, t.mValue, startPressure, this._gasMix));
		}
		
		return tissues;
	}
	
	private get ceiling(): number {
		return Number(this._tissues.reduce((lowest, tissue) => tissue.ceiling > lowest ? tissue.ceiling : lowest, 0).toFixed(1));
	}

	private reset(): Diver {
		for (const tissue of this._tissues) {
			tissue.reset();
		}

		return this;
	};

	private saturateTissues(ambientPressure: number, duration: number, gradFactor = 1): Diver {
		for (const tissue of this._tissues)
		{
			tissue.saturate(ambientPressure, duration, gradFactor);
		}

		return this;
	}

	private getNoDecompressionLimit (depth: number, gradientFactor: number = 1): number {
		this.reset();

		const ambientPressure = (depth / 10) + 1;
		const limits = [];

		for (const tissue of this._tissues) {
			if (ambientPressure * this._gasMix.fN2 > tissue.mValue * gradientFactor) {
				let limit = -1;
				while (tissue.tissueLoad.N2 <= tissue.mValue * gradientFactor) {
					tissue.saturate(ambientPressure, 1, this._gasMix.fN2);
					limit += 1;
				}

				limits.push(limit > -1 ? limit : null);
			}
		}

		return limits.length === 0 ? null : limits.reduce((min, limit) => limit < min ? limit : min);
	};

	private createDiveTable(maxDepth: number = 40, gradientFactor: number = 1, steps: number = 3): DiveTableEntry[] {
		const diveTable: DiveTableEntry[] = [];

		for (let depth: number = 6; depth <= maxDepth; depth += steps) {
			const limit = this.getNoDecompressionLimit(depth, gradientFactor)

			if (depth > this._gasMix.MOD(this._maxPPO2)) {
				break;
			} else {
				diveTable.push({depth, limit})
			}
		}

		return diveTable;
	};

	public noDecompressionDiveTable(maxDepth: number = 40, gradientFactor: number = 1, steps: number = 3, ): DiveTableEntry[] {
        return this.createDiveTable(maxDepth, gradientFactor, steps);
    }

    public dive (dives: Partial<DiveData>[], descentSpeed = 18, ascentSpeed = 9, gasConsumption = {dive: 20, deco: 16}, gradFLow = 1, gradFHigh = 1){
        let startDepth = 0;

        for (const dive of dives) {
            const ambientPressure = Utils.getPressure(dive.depth);
            const {depthChangeDuration, depthChangePressure} = Utils.getDepthChange(startDepth, dive.depth, descentSpeed, ascentSpeed);
            startDepth = dive.depth

            this.saturateTissues(depthChangePressure, depthChangeDuration, this._gasMix.fN2);
            this.saturateTissues(ambientPressure, dive.duration - depthChangeDuration, this._gasMix.fN2)

            dive.gasMix = this._gasMix;

            dive.gasConsumption = Utils.getGasConsumption(depthChangePressure, depthChangeDuration, ambientPressure, dive.duration, gasConsumption.dive);

            if (dive.depth > gases.bottomMix.diveMod) {
                dive.alert = {mod: gases.bottomMix.diveMod}
            }

            dive.ceiling = this._model.ceiling;
        }

        return dives;
    }

	createDecoPlan(gases, startDepth, ascentSpeed = 9, gasConsumption = {dive: 18, deco: 16}, gradientFLow = 1, gradientFHigh = 1) {

		let lowestCeiling = this.ceiling;
		if (model.ceiling === 0) return [];

		let decoPlan = [];
		let decoStartDepth = Math.ceil(lowestCeiling / 3) * 3;

		let actualDepth = startDepth;
		let actualPressure = Utils.getPressure(actualDepth);

		let gradientF = gradientFLow;
		const gradientIncrement = (gradientFHigh - gradientFLow) / (decoStartDepth / 3);

		while (actualDepth > 0) {
			let decoTime = 0;
			gradientF += gradientIncrement;

			while (model.ceiling > decoStartDepth - 3) {
				const decoStartPressure = Utils.getPressure(decoStartDepth);
				const {depthChangeDuration, depthChangePressure} = Utils.getDepthChange(actualDepth, decoStartDepth, ascentSpeed, ascentSpeed);

				if (depthChangeDuration !== 0) {
					decoPlan.push({
						action: "ascent",
						depth: Number(decoStartDepth.toFixed(0)),
						duration: depthChangeDuration,
						gases: gases,
						gasConsumption: Math.ceil(gasConsumption.deco * depthChangeDuration * depthChangePressure)
					});

					model.saturateTissues(depthChangePressure, depthChangeDuration, gases.bottomMix.n2, gradientF)

					actualPressure = decoStartPressure;
					actualDepth = decoStartDepth;

				} else {
					model.saturateTissues(actualPressure, 1, gases.bottomMix.n2, gradientF)
					decoTime += 1;
				}

				if (decoStartDepth === 0) break;
			}

			if (decoTime > 0) {
				decoPlan.push({
					action: "stop",
					depth: Number(actualDepth.toFixed(0)),
					duration: decoTime,
					gases: gases,
					gasConsumption: Math.ceil(gasConsumption.deco * decoTime * actualPressure)
				});
			}

			decoStartDepth -= 3;
		}

		return decoPlan;
	}
}

// console.log((new Diver).switchGasMix(new GasMix(0.32)).createDiveTable(56))