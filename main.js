var url = require('url');

exports.git = (req, res) => {
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
		var ps = path.split("/")
		if (ps.length > 2) path = `/${ps[1]}`;
		res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<title>${path}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="git.subiz.net${path} git https://source.developers.google.com/p/subiz-version-4/r${path}">
<meta http-equiv="refresh" content="0"; url="https://console.cloud.google.com/code/develop/browse${path}/master?project=subiz-version-4"/>
</head>
<body>
Nothing to see here; <a href="https://console.cloud.google.com/code/develop/browse${path}/master?project=subiz-version-4">move along</a>.
</body>
</html>`)
		return
	} else if (path.endsWith("/info/refs")) {
		res.writeHead(302, {
			'Location': `https://source.developers.google.com/p/subiz-version-4/r${url_parts.path}`
		})
		res.end()
		return
	}
	res.writeHead(301, {
		'Location': `https://console.cloud.google.com/code/develop/repo?project=subiz-version-4`
	})
	res.end()
};
