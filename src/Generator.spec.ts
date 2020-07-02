import { Workspace } from "@rbxts/services";
import { Generator } from "./Generator";
import { FaceConnectionModel } from "./AdjacencyModels";
import * as Options from "./types/Options";
import * as tileTypes from "./types/Tilesets";

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const Tilesets = Workspace.WaitForChild("tilesets") as tileTypes.Tilesets;

function createFakeTileModel(color: Color3, transparency?: number): Model {
	const part = new Instance("Part");
	part.Color = color;
	part.Transparency = transparency !== undefined ? 1 : 0;
	part.Size = new Vector3(5, 5, 5);
	part.Anchored = true;
	part.CanCollide = false;

	const model = new Instance("Model");

	part.Parent = model;
	model.Parent = Workspace;
	model.PrimaryPart = part;

	return model;
}

export = () => {
	const tiles = [
		{
			probability: 1,
			model: Tilesets.Roads.uno,
			rules: {
				Left: "2",
				Right: "2",
				Front: "0",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.dos,
			rules: {
				Left: "2",
				Right: "2",
				Front: "2",
				Back: "2",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.thres,
			rules: {
				Left: "0",
				Right: "0",
				Front: "2",
				Back: "2",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 20,
			model: Tilesets.Roads.quatro,
			rules: {
				Left: "0",
				Right: "0",
				Front: "0",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.fifth,
			rules: {
				Left: "2",
				Right: "0",
				Front: "2",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.sixth,
			rules: {
				Left: "2",
				Right: "0",
				Front: "0",
				Back: "2",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.seventh,
			rules: {
				Left: "0",
				Right: "2",
				Front: "0",
				Back: "2",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.eight,
			rules: {
				Left: "0",
				Right: "2",
				Front: "2",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.ninth,
			rules: {
				Left: "2",
				Right: "2",
				Front: "0",
				Back: "2",
				Top: "0",
				Bottom: "0",
			},
		},
		{
			probability: 1,
			model: Tilesets.Roads.tenth,
			rules: {
				Left: "2",
				Right: "2",
				Front: "2",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
	];
	const adjacency = new FaceConnectionModel(tiles);
	const gen = new Generator(
		{
			gridSize: new Vector3(8, 1, 8),
			slotSize: new Vector3(5, 5, 5),
		},
		adjacency,
	);
	it("correctly generates initial tile enablers", () => {
		const tileEnablers = gen["createInitialTileEnablers"](adjacency.tiles);
		expect(tileEnablers).to.be.a("table");

		for (const [dir, enablers] of Object.entries(tileEnablers)) {
			expect(dir).to.be.a("string");
		}
	});
};
