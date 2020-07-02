export interface GridOptions {
	gridSize: Vector3;
	slotSize: Vector3;
}

export interface GeneratorOptions {
	updateRate?: number;
	debug?: boolean;
}

export interface Tile<Rules> {
	probability: number;
	model: Model;
	rules: Rules;
}
