import * as Kiawe from "./index";

const Workspace = game.GetService("Workspace");

export = () => {
	HACK_NO_XPCALL();

	it("exports base classes, adjacencymodel, and the propagator", () => {
		expect(Kiawe["BaseTopology"]).to.be.ok();
		expect(Kiawe["AdjacencyModel"]).to.be.ok();
		expect(Kiawe["Propagator"]).to.be.ok();
	});

	it("Simply works", () => {
		const Topology = new Kiawe.GridTopology(new Vector3(10, 1, 10), new Vector3(5, 5, 5));

		const placeholderModel1 = new Instance("Model");

		const placeholderPart = new Instance("Part");
		placeholderPart.Anchored = true;
		placeholderPart.Size = new Vector3(5, 5, 5);
		placeholderPart.Color = Color3.fromRGB(255, 0, 0);
		placeholderPart.Parent = placeholderModel1;

		placeholderModel1.PrimaryPart = placeholderPart;

		const placeholderModel2 = new Instance("Model");
		const placeholderPart2 = new Instance("Part");
		placeholderPart2.Anchored = true;
		placeholderPart2.Size = new Vector3(5, 5, 5);
		placeholderPart2.Color = Color3.fromRGB(0, 255, 0);
		placeholderPart2.Parent = placeholderModel2;

		placeholderModel2.PrimaryPart = placeholderPart2;

		const AdjacencyModel = new Kiawe.AdjacencyModel(Topology, [
			{
				probability: 3,
				model: Workspace.Tilesets.Roads.uno,
				rules: {
					Left: "2",
					Right: "2",
					Front: "0",
					Back: "0",
					Top: "0",
					Bottom: "0",
				},
				index: "1",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.dos,
				rules: {
					Left: "2",
					Right: "2",
					Front: "2",
					Back: "2",
					Top: "1",
					Bottom: "1",
				},
				index: "2",
			},
			{
				probability: 3,
				model: Workspace.Tilesets.Roads.thres,
				rules: {
					Left: "0",
					Right: "0",
					Front: "2",
					Back: "2",
					Top: "0",
					Bottom: "0",
				},
				index: "3",
			},

			{
				probability: 10,
				model: Workspace.Tilesets.Roads.quatro,
				rules: {
					Left: "0",
					Right: "0",
					Front: "0",
					Back: "0",
					Top: "0",
					Bottom: "0",
				},
				index: "4",
			},

			{
				probability: 1,
				model: Workspace.Tilesets.Roads.fifth,
				rules: {
					Left: "2",
					Right: "0",
					Front: "2",
					Back: "0",
					Top: "0",
					Bottom: "0",
				},
				index: "5",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.sixth,
				rules: {
					Left: "2",
					Right: "0",
					Front: "0",
					Back: "2",
					Top: "0",
					Bottom: "0",
				},
				index: "6",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.seventh,
				rules: {
					Left: "0",
					Right: "2",
					Front: "0",
					Back: "2",
					Top: "0",
					Bottom: "0",
				},
				index: "7",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.eight,
				rules: {
					Left: "0",
					Right: "2",
					Front: "2",
					Back: "0",
					Top: "0",
					Bottom: "0",
				},
				index: "8",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.ninth,
				rules: {
					Left: "2",
					Right: "2",
					Front: "0",
					Back: "2",
					Top: "0",
					Bottom: "0",
				},
				index: "9",
			},
			{
				probability: 1,
				model: Workspace.Tilesets.Roads.tenth,
				rules: {
					Left: "2",
					Right: "2",
					Front: "2",
					Back: "0",
					Top: "0",
					Bottom: "0",
				},
				index: "10",
			},
		]);


		print("Adjacency model created");

		const Propagator = new Kiawe.Propagator(Topology, AdjacencyModel, {
			Debug: true,
		});

		print("Propagator created");

		Propagator.Run();

		print("Propagator ran");
	});
};
