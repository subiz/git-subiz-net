var url = require('url')
var request = require('request-promise')

let g_gitlabtoken = process.env.GITLAB_TOKEN
let github = name => `https://github.com/subiz/${name}.git`

// map repository name to host
let repo_map = {
	'ajax': github,
	'builder-docker': github,
	'buildtrigger': github,
	'cassandra': github,
	'cloudbuild-trigger': github,
	'configmap': github,
	'executor': github,
	'errors': github,
	'fsm': github,
	'git-subiz-net': github,
	'goutils': github,
	'header': github,
	'idgen': github,
	'kafpc': github,
	'kafka': github,
	'lang': github,
	'vue-modal': github,
	'perm': github,
	'smq': github,
	'squasher': github,
	'sync-modal': github,
	'tokenhelper': github,
	'type': github,
	'wsclient': github,
	'wkhtmltopdf': github,
	'geoip': github,
}

module.exports = {
	removeLeadingSlashes,
	getRepoUrl,
	git,
	handleGoGet,
	handleGit,
	getGithubCommit,
	getGitlabCommit,
}

// return a string without leading slashes
function removeLeadingSlashes (str) {
	if (!str) return ''
	let out = str.trim()
	while (out.startsWith('/')) out = out.substring(1)
	return out
}

// lookup hosting URL of a repo by its name in repo map
// unknown name will go to gitlab.com
function getRepoUrl (name) {
	name = removeLeadingSlashes(name)
	let path = repo_map[name]
	return path ? path(name) : `https://gitlab.com/subiz/${name}.git`
}

function handleGoGet (name) {
	name = removeLeadingSlashes(name)
	let firstname = name.split('/')[0]
	let path = getRepoUrl(firstname)
	return `<!DOCTYPE html><html>
<head>
<title>git.subiz.net (0.1.6) ${firstname} ${name} ${path}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="git.subiz.net/${firstname} git ${path}">
<meta http-equiv="refresh" content="0"; url="${path}"/>
</head>
<body>Nothing to see here; <a href="${path}">move along</a>.</body>
</html>`
}

function handleGit (path, search) {
	let name = removeLeadingSlashes(path).split('/')[0]
	return `${getRepoUrl(name)}/info/refs${search}`
}

async function handle (method, uri) {
	let urlParts = url.parse(uri, true)
	let query = urlParts.query
	let path = urlParts.pathname
	if (!path) return [301, { Location: 'https://gitlab.com/subiz' }, null]

	if (path === '/ping') return [200, null, 'gittt!!']

	// for go get
	if (method === 'GET' && query['go-get'] == '1') {
		let html = handleGoGet(path)
		return [200, undefined, html]
	} else if (path.endsWith('/info/refs')) {
		return [302, { Location: handleGit(path, urlParts.search) }, null]
	} else if (path.endsWith('/branches/master')) {
		let [commit, err] = await getCommitFromMaster(path, g_gitlabtoken)
		if (err) return [400, null, err]
		return [200, null, commit]
	}
	return [301, { Location: `https://gitlab.com/subiz` }, null]
}

async function git (req, res) {
	const VERSION = 1.236
	let [code, head, body] = await handle(req.method, req.url)
	head = Object.assign({ 'X-VERSION': VERSION }, head)
	res.writeHead(code, head)
	res.end(body)
}

async function getCommitFromMaster (name, gitlabtoken) {
	name = removeLeadingSlashes(name)
	let firstname = name.split('/')[0]
	let path = getRepoUrl(firstname)
	firstname = 'subiz/' + firstname

	if (path.startsWith('https://github.com')) {
		return getGithubCommit(firstname, 'master')
	} else if (path.startsWith('https://gitlab.com')) {
		return getGitlabCommit(gitlabtoken, firstname, 'master')
	} else if (path.startsWith('https://bitbucket')) {
		return ['', "doesn't support bitbucket"]
	}
	return ['', 'unknown 3rd api']
}

async function getGithubCommit (repo, branch) {
	try {
		let out = await request.get({
			url: `https://api.github.com/repos/${repo}/branches/${branch}`,
			headers: { 'User-Agent': 'subiz-request' },
		})
		out = JSON.parse(out)
		return [out.commit.sha, undefined]
	} catch (e) {
		return [undefined, e]
	}
}

async function getGitlabCommit (token, repo, branch) {
	try {
		repo = encodeURIComponent(repo)
		let out = await request.get({
			url: `https://gitlab.com/api/v4/projects/${repo}/repository/branches/${branch}`,
			headers: {
				'User-Agent': 'subiz-request',
				'Private-Token': token,
			},
		})
		out = JSON.parse(out)
		return [out.commit.id, undefined]
	} catch (e) {
		return [undefined, e]
	}
}
