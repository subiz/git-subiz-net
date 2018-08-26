var index = require("./index.js")

test('remove pre slash', () => {
	expect(index.removePrefixSlash("/a")).toBe("a")
	expect(index.removePrefixSlash("///a")).toBe("a")
	expect(index.removePrefixSlash(" //a")).toBe("a")
});

test('get repo url', () => {
	expect(index.getRepoUrl("account")).toBe("https://bitbucket.org/subiz/account.git")
	expect(index.getRepoUrl("idgen")).toBe("https://source.developers.google.com/p/subiz-version-4/r/idgen")
})
