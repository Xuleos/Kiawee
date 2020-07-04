import { RunService, Workspace } from "@rbxts/services";
import Slot from "./Slot";
import { AdjacencyModel, STARTING_POSSIBLE_NEIGHBORS } from "./AdjacencyModels";
import { DirectionNames, directionVectors, getInverseDir, DirectionNameUnion } from "./Directions";
import * as Options from "./types/options";
import { InternalTile, TileEnablers, possibleNeighborsType, Neighbors } from "./types/Internal";

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
	public history: Array<{
		//slot index : removed tiles
		removedTiles: Map<number, Array<InternalTile<T>>>;
		slotIndex: number;
	}>;
	public buildQueue: Array<{
		slot: Slot<T>;
		tile: InternalTile<T>;
	}>;
	public currentStep = 0;
	public slots: Array<Slot<T>>;
	public adjacencyModel: AdjacencyModel<T>;
	public gridOptions: Options.GridOptions;

	private uncollapsedSlots: Array<Slot<T>>;

	private heartbeatConnection: RBXScriptConnection;
	private updateRate: number;

	private debug = false;

	public constructor(
		gridOptions: Options.GridOptions,
		adjacencyModel: AdjacencyModel<T>,
		options?: Options.GeneratorOptions,
	) {
		this.gridOptions = gridOptions;
		this.slots = [];
		this.adjacencyModel = adjacencyModel;
		this.history = [];
		this.buildQueue = [];

		const gridSize = gridOptions.gridSize;
		const slotSize = gridOptions.slotSize;

		const initialTileEnablers = this.createInitialTileEnablers(adjacencyModel.tiles);

		const random = new Random();

		if (options && options.debug) {
			this.debug = true;
		}

		for (let x = 0; x < gridSize.X; x++) {
			for (let y = 0; y < gridSize.Y; y++) {
				for (let z = 0; z < gridSize.Z; z++) {
					const slotPos = new Vector3(x * slotSize.X, y * slotSize.Y, z * slotSize.Z);

					//this.slots.size() might work weird?
					this.slots.push(
						new Slot(
							slotPos,
							this.slots.size(),
							this,
							adjacencyModel.tiles.copy(),
							Object.deepCopy(initialTileEnablers),
							random,
							this.debug,
						),
					);
				}
			}
		}

		this.uncollapsedSlots = this.slots.copy();

		//Update loop
		this.updateRate = options !== undefined && options.updateRate ? options.updateRate : DEFAULT_UPDATE_RATE;

		let totalStep = 0;
		this.heartbeatConnection = RunService.Heartbeat.Connect((step) => {
			totalStep += step;

			if (totalStep >= this.updateRate) {
				totalStep = 0;

				if (!this.uncollapsedSlots.isEmpty()) {
					this.update();
				}
			}
		});
	}

	public getNeighbors(pos: Vector3): Neighbors {
		const neighbors: Neighbors = {};

		if (this.debug) {
			const thisSlot = this.slots.find((slot) => {
				return slot.position === pos;
			});

			if (thisSlot && thisSlot.debugParts) {
				thisSlot.debugParts.part.Color = new Color3(0, 1, 0);
			}
		}

		for (let i = 0; i < 6; i++) {
			const dirName = DirectionNames[i];
			const dirVector = directionVectors[i];

			const neighborPos = pos.add(dirVector.mul(this.gridOptions.slotSize));

			const neighbor = this.slots.find((slot) => {
				return slot.position === neighborPos;
			});

			if (neighbor) {
				if (neighbor.debugParts) {
					neighbor.debugParts.part.Color = new Color3(1, 0, 0);
				}
				neighbors[dirName] = neighbor.index;
			}
		}

		return neighbors;
	}

	private update() {
		this.currentStep++;

		this.sortSlots();

		const lowestEntropy = this.uncollapsedSlots.pop();

		if (lowestEntropy) {
			lowestEntropy.collapseRandom();
		} else {
			error("Could not find slot with lowest entropy");
		}

		if (this.debug) {
			for (const slot of this.slots) {
				if (slot.debugParts) {
					slot.debugParts.tileDisplay.Text = tostring(slot["tiles"].size());
				}
			}
		}

		const first = this.buildQueue.remove(0);

		if (first) {
			if (first.slot.debugParts) {
				first.slot.debugParts.part.Destroy();
			}
			const model = first.tile.model.Clone();
			model.SetPrimaryPartCFrame(new CFrame(first.slot.position));
			model.Parent = Workspace;
		}
	}

	private sortSlots() {
		this.uncollapsedSlots = this.uncollapsedSlots.sort((a, b) => {
			return a.getEntroy() > b.getEntroy();
		});
	}

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
