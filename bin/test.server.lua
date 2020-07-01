local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TestEZ = require(ReplicatedStorage:WaitForChild("TestEZ"))

local results = TestEZ.TestBootstrap:run({ReplicatedStorage.Kiawee}, TestEZ.Reporters.TextReporter)

local statusCode = results.failureCount == 0 and 0 or 1

if __LEMUR__ then
    if results.failureCount > 0 then
		os.exit(statusCode)
	end
end
