# thanhpk/go.subiz.net
FROM golang:1.10.3-alpine3.7 AS build
WORKDIR /go/src/go.subiz.net

COPY . .
RUN CGO_ENABLED=0 go build -o main -ldflags="-s -w"

###
FROM alpine:3.6

RUN mkdir /app
WORKDIR /app
COPY --from=build /go/src/go.subiz.net/main ./
CMD ["./main"]
