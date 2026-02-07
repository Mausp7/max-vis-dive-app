export type DepthChangeData = Record<"depthChangeDuration" | "depthChangePressure", number>

export class Utils {
	static getPressure(depth: number): number {
		return (depth / 10) + 1;
	}

	static getDepth(pressure: number): number {
		return (pressure - 1) * 10;
	}

	static getDepthChange(startDepth: number, targetDepth: number, descentSpeed: number, ascentSpeed: number): DepthChangeData {
		const speed: number = startDepth < targetDepth ? descentSpeed : ascentSpeed;
		const depthChange: number = Math.abs(startDepth - targetDepth);
	
		const depthChangeDuration = Math.ceil(depthChange / speed);
			
		const depthChangePressure = Utils.getPressure((startDepth + targetDepth) / 2);
	
		return {depthChangeDuration, depthChangePressure};
	}

	static getGasConsumption(ambientPressure: number, duration: number, gasConsumption: number, depthChangeDuration: number = 0, depthChangePressure: number = ambientPressure): number {
		return Math.ceil((depthChangePressure * depthChangeDuration + ambientPressure * (duration - depthChangeDuration)) * gasConsumption);
	}
}


