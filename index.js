var url = require('url');

let github = name => `https://github.com/subiz/${name}.git`
let bbk = name => `https://bitbucket.org/subiz/${name}.git`

let repo_map = {
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
	return `<!DOCTYPE html>
<html>
<head>
<title>git.subiz.net (0.1.6) ${firstname} ${name} ${path}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="git.subiz.net/${firstname} git ${path}">
<meta http-equiv="refresh" content="0"; url="${path}"/>
</head>
<body>
Nothing to see here; <a href="${path}">move along</a>.
</body>
</html>`
}

function handleGit(path, search) {
	let name = removePrefixSlash(path).split("/")[0]
	return `${getRepoUrl(name)}/info/refs${search}`
}

function git(req, res) {
	let url_parts = url.parse(req.url, true);
	let query = url_parts.query;
	let path = url_parts.pathname

	if (!path) {
		res.writeHead(301, {
			'Location': 'https://gitlab.com/subiz'
		});
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
	}
	res.writeHead(301, {
		'Location': `https://gitlab.com/subiz`
	})
	res.end()
};
