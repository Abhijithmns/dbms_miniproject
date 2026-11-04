FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /getit-api .

FROM alpine:3.21
RUN adduser -D -H getit
COPY --from=build /getit-api /getit-api
USER getit
EXPOSE 8080
ENTRYPOINT ["/getit-api"]
