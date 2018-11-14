var index = require('./index.js')

test('remove pre slash', () => {
	expect(index.removeLeadingSlashes('/a')).toBe('a')
	expect(index.removeLeadingSlashes('///a')).toBe('a')
	expect(index.removeLeadingSlashes(' //a')).toBe('a')
});

test('get repo url', () => {
	expect(index.getRepoUrl('account')).toBe('https://gitlab.com/subiz/account.git')
	expect(index.getRepoUrl('idgen')).toBe('https://github.com/subiz/idgen.git')
})

test('handle go-get', () => {
	expect(index.handleGoGet('idgen')).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/idgen git https:\/\/github.com\/subiz\/idgen\.git\">/)
	expect(index.handleGoGet('payment')).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/payment git https:\/\/gitlab.com\/subiz\/payment\.git\">/)
	expect(index.handleGoGet('goutils/conv')).toMatch(/<meta name=\"go-import\" content=\"git\.subiz\.net\/goutils git https:\/\/github.com\/subiz\/goutils\.git\">/)
})

test('handle git', () => {
	expect(index.handleGit('account/info/refs', '?service=git-upload-pack')).toBe('https://gitlab.com/subiz/account.git/info/refs?service=git-upload-pack')
	expect(index.handleGit('account', '?service=git-upload-pack')).toBe('https://gitlab.com/subiz/account.git/info/refs?service=git-upload-pack')
	expect(index.handleGit('payment/info/refs', '?service=git-upload-pack')).toBe('https://gitlab.com/subiz/payment.git/info/refs?service=git-upload-pack')
})
