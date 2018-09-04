var url = require('url')
var request = require('request-promise');

let g_gitlabtoken = process.env.GITLAB_TOKEN
let github = name => `https://github.com/subiz/${name}.git`
let bbk = name => `https://bitbucket.org/subiz/${name}.git`

let repo_map = {
	"ajax": github,
	"git-subiz-net": github,
	"builder-docker": github,
	"cloudbuild-trigger": github,
	"configmap": github,
	"account":bbk,
	"api": bbk,
	"conversation":bbk,
	"user": bbk,
	"webhook": bbk,
	"ws": bbk,
	"fabikon": bbk,
	"mailkon": bbk,
	"kv": bbk,
	"pubsub": bbk,
	"auth": bbk,
}

module.exports = {
	removePrefixSlash,
	getRepoUrl,
	git,
	handleGoGet,
	handleGit,
	getGithubCommit,
	getGitlabCommit,
}

function removePrefixSlash(str) {
	if (!str) return ""

	let out = str.trim()
	if (out.startsWith("/")) {
		out = out.substring(1)
		return removePrefixSlash(out)
	}
	return out
}

function getRepoUrl(name) {
	name = removePrefixSlash(name)
	let path = repo_map[name]
	if (!path) {
		return `https://gitlab.com/subiz/${name}.git`
	}
	return path(name)
}

function handleGoGet(name) {
	name = removePrefixSlash(name)
	let firstname = name.split("/")[0]
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

function handleGit(path, search) {
	let name = removePrefixSlash(path).split("/")[0]
	return `${getRepoUrl(name)}/info/refs${search}`
}

async function git(req, res) {
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	let path = url_parts.pathname

	if (!path) {
		res.writeHead(301, {'Location': 'https://gitlab.com/subiz'});
		res.end()
		return;
	}
	// for go get
	if (req.method == "GET" && query['go-get'] == '1') {
		let html = handleGoGet(path)
		res.status(200).send(html)
		return
	} else if (path.endsWith("/info/refs")) {
		res.writeHead(302, {
			'Location': handleGit(path, url_parts.search),
		})
		res.end()
		return
	} else if (path.endsWith("/branches/master")) {
		let [commit, err] = await getCommitFromMaster(path, g_gitlabtoken)
		if (err) {
			res.status(400).send(err)
			return
		}

		res.status(200).send(commit)
		return
	}
	res.writeHead(301, {'Location': `https://gitlab.com/subiz`})
	res.end()
}

async function getCommitFromMaster(name, gitlabtoken) {
	name = removePrefixSlash(name)
	let firstname = name.split("/")[0]
	let path = getRepoUrl(firstname)
	firstname = "subiz/" + firstname

	if (path.startsWith("https://github.com")) {
		return getGithubCommit(firstname, "master")
	} else if (path.startsWith("https://gitlab.com")) {
		return getGitlabCommit(gitlabtoken, firstname, "master")
	} else if (path.startsWith("https://bitbucket")) {
		return ["", "doesn't support bitbucket"]
	}
	return ["", "unknown 3rd api"]
}

async function getGithubCommit(repo, branch) {
	try {
		let out = await request.get({
			url: `https://api.github.com/repos/${repo}/branches/${branch}`,
			headers: {'User-Agent': "subiz-request"},
		})
		out = JSON.parse(out)
		return [out.commit.sha, undefined]
	} catch(e) {
		return [undefined, e]
	}
}

async function getGitlabCommit(token, repo, branch) {
	try {
		repo = encodeURIComponent(repo)
		console.log(repo)
		let out = await request.get({
			url: `https://gitlab.com/api/v4/projects/${repo}/repository/branches/${branch}`,
			headers: {
				'User-Agent': 'subiz-request',
				'Private-Token': token,
			},
		})
		out = JSON.parse(out)
		return [out.commit.id, undefined]
	} catch(e) {
		return [undefined, e]
	}
}
