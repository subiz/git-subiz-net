var url = require('url');

let repo_map = {
	"idgen": name => `https://source.developers.google.com/p/subiz-version-4/r/${name}`,
	"git-subiz-net": name => `https://source.developers.google.com/p/subiz-version-4/r/${name}`,
	"account": name => `https://bitbucket.org/subiz/${name}.git`,
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
<title>git.subiz.net (0.1.3) ${firstname} ${name}  ${path}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="git.subiz.net/${firstname} git ${path}">
<meta http-equiv="refresh" content="0"; url="https://console.cloud.google.com/code/develop/browse${path}/master?project=subiz-version-4"/>
</head>
<body>
Nothing to see here; <a href="https://console.cloud.google.com/code/develop/browse${name}/master?project=subiz-version-4">move along</a>.
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
			'Location': 'https://console.cloud.google.com/code/develop/repo?project=subiz-version-4'
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
		'Location': `https://console.cloud.google.com/code/develop/repo?project=subiz-version-4`
	})
	res.end()
};
