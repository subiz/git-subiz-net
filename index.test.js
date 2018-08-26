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

test('handle go-get', () => {
	expect(index.handleGoGet("account")).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/account git https:\/\/bitbucket.org\/subiz\/account\.git\">/)
	expect(index.handleGoGet("idgen")).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/idgen git https:\/\/source\.developers\.google\.com\/p\/subiz-version-4\/r\/idgen\">/)
	expect(index.handleGoGet("payment")).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/payment git https:\/\/gitlab.com\/subiz\/payment\.git\">/)
	expect(index.handleGoGet("goutils/conv")).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/goutils\/conv git https:\/\/gitlab.com\/subiz\/goutils\.git\">/)
})

test('handle git', () => {
	expect(index.handleGit("account/info/refs", "?service=git-upload-pack")).toBe("https://bitbucket.org/subiz/account.git/info/refs?service=git-upload-pack")
	expect(index.handleGit("account", "?service=git-upload-pack")).toBe("https://bitbucket.org/subiz/account.git/info/refs?service=git-upload-pack")
	expect(index.handleGit("payment/info/refs", "?service=git-upload-pack")).toBe("https://gitlab.com/subiz/payment.git/info/refs?service=git-upload-pack")
})
