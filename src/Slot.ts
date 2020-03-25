import { Tile } from "./Tile";
import { Propagator } from "./Propagator";
import { BaseTopology } from "./Topology";
export class Slot {
	entropy: number;
	confirmedTile: undefined | Tile;
	tiles: Array<Tile>;

	debugInstance: Part;
	tilesDisplay: TextLabel;
	entropyDisplay: TextLabel;

	private propagator: Readonly<Propagator<BaseTopology>>;

	constructor(
		public pos: Vector3,
		tiles: Array<Tile>,
		propagator: Propagator<BaseTopology>,
		public tileHealth: {
			[direction: string]: {
				[Index: string]: number;
			};
		},
	) {
		this.tiles = tiles.copy();

		this.entropy = this.CalculateEntropy();

		const DebugInst = new Instance("Part");
		DebugInst.Size = new Vector3(5, 5, 5);
		DebugInst.Transparency = 0.8;
		DebugInst.Position = pos;
		DebugInst.Anchored = true;
		DebugInst.Parent = game.Workspace;

		const DebugDisplay = new Instance("SurfaceGui");
		DebugDisplay.Face = Enum.NormalId.Top;
		DebugDisplay.Parent = DebugInst;

		const tilesDisplay = new Instance("TextLabel");
		tilesDisplay.Parent = DebugDisplay;
		tilesDisplay.Size = new UDim2(1, 0, 0.5, 0);
		tilesDisplay.BackgroundTransparency = 1;
		tilesDisplay.TextScaled = true;
		tilesDisplay.Text = tostring(this.tiles.size());

		const entropyDisplay = new Instance("TextLabel");
		entropyDisplay.Parent = DebugDisplay;
		entropyDisplay.BackgroundTransparency = 1;
		entropyDisplay.Size = new UDim2(1, 0, 0.5, 0);
		entropyDisplay.Position = new UDim2(0, 0, 0.5, 0);
		entropyDisplay.TextScaled = true;
		entropyDisplay.Text = tostring(this.entropy);

		this.debugInstance = DebugInst;
		this.tilesDisplay = tilesDisplay;
		this.entropyDisplay = entropyDisplay;

		this.propagator = propagator;
	}

	CalculateEntropy() {
		const totalProbability = this.tiles.reduce((accumulator, tile) => {
			return accumulator + tile.probability;
		}, 0);

		const totalPLogP = this.tiles.reduce((accumulator, tile) => {
			return accumulator + tile.pLogP;
		}, 0);

		return (-1 / totalProbability) * totalPLogP + math.log(totalProbability);
	}

	Collapse(tile: Tile) {
		this.confirmedTile = tile;

		//I don't want to mutate the original tiles
		const excessTiles = this.tiles.filter((item) => {
			return item !== this.confirmedTile;
		});

		this.RemoveTiles(excessTiles);

		//physically build
		const clone = this.confirmedTile.model.Clone();
		clone.SetPrimaryPartCFrame(new CFrame(this.pos));
		clone.Parent = game.Workspace;

		this.debugInstance.Destroy();
	}

	ContainsTile(tileIndex: string) {
		return this.tiles.find((tile) => {
			return tile.index === tileIndex;
		});
	}

	RemoveTiles(tiles: Array<Tile>, recursive = true) {
		//Might be useful to cache this somewhere later
		const slotNeighbors = this.propagator.topology.GetNeighbors(this.pos);

		for (const [dir, neighborCoord] of Object.entries(slotNeighbors)) {
			const inverseDirName = this.propagator.model.GetInverseDirection(dir);

			// eslint-disable-next-line roblox-ts/no-object-math
			const neighbor = this.propagator.slots.find((slot) => slot.pos === neighborCoord);

			if (neighbor) {
				for (const tile of tiles) {
					for (const possibleNeighbor of tile.possibleNeighbors[dir]) {
						const possibleNeighborTile = neighbor.ContainsTile(possibleNeighbor);
						if (neighbor.tileHealth[inverseDirName][possibleNeighbor] === 1 && possibleNeighborTile) {
							this.propagator.RemovalQueue.push({
								tile: possibleNeighborTile,
								slot: neighbor,
							});
						}

						neighbor.tileHealth[inverseDirName][possibleNeighbor]--;
					}
				}
			}
		}

		for (const tile of tiles) {
			const tileIndex = this.tiles.indexOf(tile);
			//Now we mutate >:)
			this.tiles.remove(tileIndex);
		}

		if (this.tiles.size() <= 0) {
			this.propagator.SetContradiction();
			return;
		}

		if (recursive) {
			this.propagator.FinishRemovalQueue();
		}
	}

	//Test
	CollapseRandom() {
		if (this.tiles.size() <= 0) {
			this.propagator.SetContradiction();
			return;
		}

		if (this.confirmedTile) {
			error("This slot is already collapsed");
		}

		let totalWeight = 0;

		for (const tile of this.tiles) {
			totalWeight += tile.probability;
		}

		let random = this.propagator.random.NextInteger(1, totalWeight);

		for (const tile of this.tiles) {
			if (random <= tile.probability) {
				this.Collapse(tile);
				return;
			} else {
				random -= tile.probability;
			}
		}

		const firstTile = this.tiles.find((x) => x !== undefined);

		if (firstTile) {
			this.Collapse(firstTile);
		}
	}
}
