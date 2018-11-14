var index = require('./index.js')

test('get github commit', async () => {
	let [commit, err] = await index.getGithubCommit('octocat/Hello-World', 'master')
	expect(err).toBe(undefined)
	expect(commit).toBe('7fd1a60b01f91b314f59955a4e4d4e80d8edf11d')
})

test('get gitlab commit', async () => {
	let token = process.env.GITLAB_TOKEN
	let [commit, err] = await index.getGitlabCommit(token, 'thanhpk/testcommit', 'master')
	expect(err).toBe(undefined)
	expect(commit).toBe('7297e8eb5ffdd8bdbfa578206d0e01435fac4183')
})
