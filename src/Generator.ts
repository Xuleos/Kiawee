import { RunService } from "@rbxts/services";
import Slot from "./Slot";
import { AdjacencyModel, InternalTile } from "./AdjacencyModels";
import { DirectionNames, directionVectors, getInverseDir, DirectionNameUnion } from "./Directions";

interface IGridOptions {
	gridSize: Vector3;
	slotSize: Vector3;
}

interface IGeneratorOptions {
	updateRate: number;
}

type TileEnablers = {
	[dirtype in DirectionNameUnion]: {
		[index: number]: number;
	};
};

const DEFAULT_UPDATE_RATE = 1;

export default class Generator<T> {
	private slots: Array<Slot>;
	private orderedSlots: Array<Slot>;
	private gridOptions: IGridOptions;

	private heartbeatConnection: RBXScriptConnection;

	private updateRate: number;

	private adjacencyModel: AdjacencyModel<T>;

	public constructor(gridOptions: IGridOptions, adjacencyModel: AdjacencyModel<T>, options?: IGeneratorOptions) {
		this.gridOptions = gridOptions;
		this.slots = [];
		this.adjacencyModel = adjacencyModel;

		const gridSize = gridOptions.gridSize;
		const slotSize = gridOptions.slotSize;

		const initialTileEnablers = this.createInitialTileEnablers(adjacencyModel.tiles);

		for (let x = 0; x < gridSize.X; x++) {
			for (let y = 0; y < gridSize.Y; y++) {
				for (let z = 0; z < gridSize.Z; z++) {
					this.slots.push(new Slot(new Vector3(x * slotSize.X, y * slotSize.Y, z * slotSize.Z)));
				}
			}
		}

		this.orderedSlots = this.slots.copy();

		//TODO: Initialize slots with classes. We actually probably should avoid classes ngl. Just have solid data

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
		const initialEnablers: TileEnablers = {};

		for (let i = 0; i < 6; i++) {
			const dirName = DirectionNames[i];
			initialEnablers[dirName] = {};

			const enablersForDir = initialEnablers[dirName];

			const inverseDir = getInverseDir(i);

			for (const index of Object.keys(tiles)) {
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
