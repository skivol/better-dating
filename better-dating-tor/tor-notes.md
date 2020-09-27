# Tor (for development/test environment)
1. [Setting up Tor Proxy and Hidden Services in Linux](https://www.devdungeon.com/content/setting-tor-proxy-and-hidden-services-linux)
2. [Using CURL with TOR as a Proxy on CentOs](https://stackoverflow.com/questions/39257293/using-curl-with-tor-as-a-proxy-on-centos)

  
## docker-compose.yml
```
 bd-tor:
   build: ./better-dating-tor
   image: skivol/better-dating-tor:latest
   container_name: "bd-prod-tor"
   deploy:
     resources:
       limits:
         cpus: '0.25'
         memory: 50M
       reservations:
         cpus: '0.05'
         memory: 20M
     restart_policy:
       condition: any
       delay: 10s
       max_attempts: 2
       window: 120s
```
 
## reactor-netty
```
private fun proxyConnector(proxySettings: ProxySettings): ReactorClientHttpConnector {
    // inspired by https://github.com/reactor/reactor-netty/issues/887
    val httpClient = HttpClient.create()
            .proxy {
                it.type(ProxyProvider.Proxy.SOCKS5)
                        .host(proxySettings.host)
                        .port(proxySettings.port)
            }
    return ReactorClientHttpConnector(httpClient)
}
```
