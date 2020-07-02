import { Workspace } from "@rbxts/services";
import { Generator } from "./Generator";
import { FaceConnectionModel } from "./AdjacencyModels";
import * as Options from "./types/Options";

function createFakeTileModel(color: Color3): Model {
	const part = new Instance("Part");
	part.Color = color;
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
			model: createFakeTileModel(new Color3(1, 0, 0)),
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
			model: createFakeTileModel(new Color3(1, 0, 0)),
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
			model: createFakeTileModel(new Color3(1, 0, 0)),
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
			probability: 1,
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			model: createFakeTileModel(new Color3(1, 0, 0)),
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
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			model: createFakeTileModel(new Color3(0, 0, 0)),
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
			gridSize: new Vector3(3, 3, 3),
			slotSize: new Vector3(5, 5, 5),
		},
		adjacency,
	);
	it("correctly generates initial tile enablers", () => {
		const tileEnablers = gen["createInitialTileEnablers"](adjacency.tiles);
		expect(tileEnablers).to.be.a("table");

		for (const [dir, enablers] of Object.entries(tileEnablers)) {
			expect(dir).to.be.a("string");

			for (const [neighborIndex, enablerCount] of Object.entries(enablers)) {
				expect(enablerCount).to.be.equal(tiles.size());
			}
		}
	});
};
