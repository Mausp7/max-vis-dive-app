function getPressure(depth)
{
	return (depth / 10) + 1;
}

function getDepthChange(startDepth, targetDepth, descentSpeed, ascentSpeed) {
	const depthChangeDuration = Math.ceil(
		startDepth < targetDepth ?
			(targetDepth - startDepth) / descentSpeed :
			(startDepth - targetDepth) / ascentSpeed
	);
	const depthChangePressure = getPressure(Math.abs(startDepth - targetDepth));

	return {depthChangeDuration, depthChangePressure};
}

function getGasConsumption(depthChangePressure, depthChangeDuration, ambientPressure, duration, gasConsumption) {
	return Math.ceil((depthChangePressure * depthChangeDuration + ambientPressure * (duration - depthChangeDuration)) * gasConsumption);
}


module.exports = { getPressure, getDepthChange, getGasConsumption };