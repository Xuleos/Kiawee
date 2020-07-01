import { RunService } from "@rbxts/services";
import Slot from "./Slot";
import { AdjacencyModel } from "./AdjacencyModels";
import { DirectionNames, directionVectors, getInverseDir, DirectionNameUnion } from "./Directions";
import * as Options from "./types/options";
import { InternalTile, TileEnablers } from "./types/Internal";

const DEFAULT_UPDATE_RATE = 1;

const STARTING_TILE_ENABLERS: TileEnablers = {
	Left: [],
	Right: [],
	Front: [],
	Back: [],
	Top: [],
	Bottom: [],
};

export class Generator<T> {
	private slots: Array<Slot<T>>;
	private orderedSlots: Array<Slot<T>>;
	private gridOptions: Options.GridOptions;

	private heartbeatConnection: RBXScriptConnection;

	private updateRate: number;

	private adjacencyModel: AdjacencyModel<T>;

	public constructor(
		gridOptions: Options.GridOptions,
		adjacencyModel: AdjacencyModel<T>,
		options?: Options.GeneratorOptions,
	) {
		this.gridOptions = gridOptions;
		this.slots = [];
		this.adjacencyModel = adjacencyModel;

		const gridSize = gridOptions.gridSize;
		const slotSize = gridOptions.slotSize;

		const initialTileEnablers = this.createInitialTileEnablers(adjacencyModel.tiles);

		for (let x = 0; x < gridSize.X; x++) {
			for (let y = 0; y < gridSize.Y; y++) {
				for (let z = 0; z < gridSize.Z; z++) {
					const slotPos = new Vector3(x * slotSize.X, y * slotSize.Y, z * slotSize.Z);

					this.slots.push(new Slot(slotPos, adjacencyModel.tiles, initialTileEnablers));
				}
			}
		}

		this.orderedSlots = this.slots.copy();

		//Update loop
		this.updateRate = options !== undefined ? options.updateRate : DEFAULT_UPDATE_RATE;

		let totalStep = 0;
		this.heartbeatConnection = RunService.Heartbeat.Connect((step) => {
			totalStep += step;

			if (totalStep >= this.updateRate) {
				totalStep = 0;

				if (!this.orderedSlots.isEmpty()) {
					this.update();
				}
			}
		});
	}

	private update() {}

	private createInitialTileEnablers<T>(tiles: Array<InternalTile<T>>): TileEnablers {
		const initialEnablers = Object.deepCopy(STARTING_TILE_ENABLERS);

		for (let i = 0; i < 6; i++) {
			const dirName = DirectionNames[i];
			const enablersForDir = initialEnablers[dirName];

			const inverseDir = getInverseDir(i);

			for (let index = 0; index < tiles.size(); index++) {
				const possibleNeighbors = this.adjacencyModel.getPossibleNeighbors(index);

				for (const possibleNeighborIndex of possibleNeighbors[inverseDir]) {
					if (enablersForDir[possibleNeighborIndex] === undefined) {
						enablersForDir[possibleNeighborIndex] = 0;
					}

					enablersForDir[possibleNeighborIndex]++;
				}
			}
		}

		return initialEnablers;
	}
}
