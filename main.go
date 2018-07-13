package main

import (
	"html/template"
	"log"
	"net/http"
	"strings"
)

var index = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="go-import" content="{{.Host}}/{{.Path}} git https://source.developers.google.com/p/subiz-version-4/r/{{.Path}}">
		<meta http-equiv="refresh" content="0"; url="https://console.cloud.google.com/code/develop/browse/{{.Path}}/master?project=subiz-version-4"/>
  </head>
  <body>
    Nothing to see here; <a href="https://console.cloud.google.com/code/develop/browse/{{.Path}}/master?project=subiz-version-4">move along</a>.
  </body>
</html>
`

type Index struct {
	Path string
	Host string
}

func main() {
	tmpl, err := template.New("index").Parse(index)
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		data := &Index{}
		data.Path = r.URL.Path[1:]
		data.Host = r.Host
		log.Println(r.Method, r.Host+"/"+data.Path+"?"+r.URL.RawQuery)

		if data.Path == "" {
			http.Redirect(w, r, "https://console.cloud.google.com/code/develop/repo?project=subiz-version-4", 301)
			return
		}
		// for go get
		if r.Method == "GET" && r.URL.Query().Get("go-get") == "1" {
			tmpl.Execute(w, data)
			return
		} else if strings.HasSuffix(data.Path, "/info/refs") {
			// for normal git traffic
			http.Redirect(w, r, "https://source.developers.google.com/p/subiz-version-4/r/"+data.Path+"?"+r.URL.RawQuery, 302)
			return
		}
		http.Redirect(w, r, "https://console.cloud.google.com/code/develop/repo?project=subiz-version-4", 301)
	})
	log.Println("server is listening at port 8021")
	log.Fatal(http.ListenAndServe(":8021", nil))
}
