package ua.betterdating.backend.configuration

import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientConfigurationsInitializer
import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.redis.reactiveRedis
import org.springframework.fu.kofu.session.reactiveRedis
import org.springframework.fu.kofu.session.session
import org.springframework.fu.kofu.webflux.security
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.ReactiveAuthenticationManager
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthorizationCodeAuthenticationToken
import org.springframework.security.oauth2.client.authentication.OAuth2LoginReactiveAuthenticationManager
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest
import org.springframework.security.oauth2.client.endpoint.ReactiveOAuth2AccessTokenResponseClient
import org.springframework.security.oauth2.client.endpoint.WebClientReactiveAuthorizationCodeTokenResponseClient
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.client.web.server.ServerAuthorizationRequestRepository
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizationCodeAuthenticationTokenConverter
import org.springframework.security.oauth2.client.web.server.WebSessionOAuth2ServerAuthorizationRequestRepository
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2AuthorizationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.server.WebFilterExchange
import org.springframework.security.web.server.authentication.AuthenticationWebFilter
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationFailureHandler
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter
import org.springframework.security.web.server.authentication.logout.DelegatingServerLogoutHandler
import org.springframework.security.web.server.authentication.logout.HeaderWriterServerLogoutHandler
import org.springframework.security.web.server.authentication.logout.HttpStatusReturningServerLogoutSuccessHandler
import org.springframework.security.web.server.authentication.logout.SecurityContextServerLogoutHandler
import org.springframework.security.web.server.authorization.HttpStatusServerAccessDeniedHandler
import org.springframework.security.web.server.context.ServerSecurityContextRepository
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository
import org.springframework.security.web.server.header.ClearSiteDataServerHttpHeadersWriter
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import org.springframework.web.server.adapter.ForwardedHeaderTransformer
import reactor.core.publisher.Mono
import ua.betterdating.backend.*
import ua.betterdating.backend.handlers.createAuth
import java.net.URLEncoder.encode
import java.nio.charset.Charset.defaultCharset

fun securityConfig(emailRepository: EmailRepository, roleRepository: UserRoleRepository) = configuration {
    val securityContextRepository = WebSessionServerSecurityContextRepository()
    val delegatingLogoutHandler = logoutHandler()
    beans {
        bean<PasswordEncoder> {
            val idForEncode = "bcrypt"
            DelegatingPasswordEncoder(idForEncode, mapOf(idForEncode to BCryptPasswordEncoder(13)))
        }
        bean<ServerSecurityContextRepository> { securityContextRepository }
        bean<ForwardedHeaderTransformer>("forwardedHeaderTransformer")
        bean { delegatingLogoutHandler }
    }

    reactiveRedis {
        lettuce()
    }
    session {
        reactiveRedis()
    }

    val oauth2ClientProperties = configurationProperties<OAuth2ClientProperties>(prefix = "spring.security.oauth2.client")
    val clientRegistrationRepository = ReactiveOAuth2ClientConfigurationsInitializer.clientRegistrationRepository(oauth2ClientProperties)
    val authenticationManager = OAuth2SimpleAuthenticationManager(
            WebClientReactiveAuthorizationCodeTokenResponseClient(),
            DefaultReactiveOAuth2UserService(),
            emailRepository, roleRepository
    )
    val authorizationRequestRepository = WebSessionOAuth2ServerAuthorizationRequestRepository()
    val authorizationRequestResolver = DefaultServerOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository,
            // GET of this url initiates authorization flow by redirecting to OAuth 2.0 provider
            // "/oauth2/authorization/{registrationId}" by default
            PathPatternParserServerWebExchangeMatcher("/api/auth/login/oauth2/authorization/{registrationId}")
    )
    authorizationRequestResolver.setAuthorizationRequestCustomizer {
        // Vk returns not encoded "state" param which (if, for example, "=" is there in default base64 with padding encoding)
        // causes problems when ForwardedHeaderTransformer tries to do its job
        // while decoding this value in authorization callback
        it.state(generateUrlSafeToken())
    }

    security {
        securityCustomizer = {
            it.securityContextRepository(securityContextRepository)

            val simpleLoginWebFilter = simpleOAuth2LoginWebFilter(
                    authenticationManager,
                    authenticationConverter(clientRegistrationRepository, authorizationRequestRepository),
                    securityContextRepository
            )

            it.addFilterBefore(simpleLoginWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            it.addFilterAfter(AccessDeniedFilter(), SecurityWebFiltersOrder.EXCEPTION_TRANSLATION)
        }
        http = {
            csrf {
                csrfTokenRepository = CookieServerCsrfTokenRepository.withHttpOnlyFalse()
            }
            formLogin { disable() }
            logout {
                logoutUrl = "/api/auth/logout"
                logoutHandler = delegatingLogoutHandler
                logoutSuccessHandler = HttpStatusReturningServerLogoutSuccessHandler()
            }
            oauth2Login {
                this.authorizationRequestRepository = authorizationRequestRepository
                this.authorizationRequestResolver = authorizationRequestResolver
                this.clientRegistrationRepository = clientRegistrationRepository
            }

            authorizeExchange {
                // [internal] Health
                authorize("/actuator/health", permitAll)

                // Registration & Email verification / triggering new verification / contact
                authorize(pathMatchers(HttpMethod.POST, "/api/user/profile"), permitAll)
                authorize("/api/user/email/**", permitAll)

                // Login
                authorize(pathMatchers(HttpMethod.POST, "/api/auth/login-link"), permitAll) // consider having web client credentials
                authorize(pathMatchers(HttpMethod.POST, "/api/auth/login"), permitAll)
                authorize("/api/support/csrf", permitAll)
                authorize("/api/auth/me", hasAuthority("ROLE_USER"))

                // Profile
                authorize("/api/user/profile/**", hasAuthority("ROLE_USER"))

                // Administration
                authorize("/api/admin/**", hasAuthority("ROLE_ADMIN"))

                // Deny rest
                authorize(anyExchange, denyAll)
            }
        }
        oauth2ClientBeans {
            this.oauth2ClientProperties = oauth2ClientProperties
            this.reactiveClientRegistrationRepository = clientRegistrationRepository
        }
    }
}

fun simpleOAuth2LoginWebFilter(authenticationManager: ReactiveAuthenticationManager, authenticationConverter: ServerAuthenticationConverter, securityContextRepository: ServerSecurityContextRepository): OAuth2SimpleLoginWebFilter {
    // superseding OAuth2LoginAuthenticationWebFilter which does too much (for example, saves AuthorizedClients)
    val oAuthWebFilter = OAuth2SimpleLoginWebFilter(authenticationManager)
    // Redirect uri that will receive code from the OAuth 2.0 provider
    // "/login/oauth2/code/{registrationId}" by default (in oauth2Login's authentication filter)
    val authenticationMatcher = PathPatternParserServerWebExchangeMatcher("/api/auth/login/oauth2/code/{registrationId}")
    oAuthWebFilter.setRequiresAuthenticationMatcher(authenticationMatcher)

    // path from request cache by default (in oauth2Login's authentication filter)
    val authenticationSuccessHandler = RedirectServerAuthenticationSuccessHandler("/${encode("профиль", defaultCharset())}")
    oAuthWebFilter.setAuthenticationSuccessHandler(authenticationSuccessHandler)

    // "/login?error" by default (in oauth2Login's authentication filter)
    val authenticationFailureHandler = object : RedirectServerAuthenticationFailureHandler("/${encode("вход", defaultCharset())}?oauth-error") {
        override fun onAuthenticationFailure(webFilterExchange: WebFilterExchange?, exception: AuthenticationException?): Mono<Void> {
            if (exception is EmailNotRegisteredException) {
                // redirect to sign up page
                return RedirectServerAuthenticationFailureHandler("/${encode("регистрация", defaultCharset())}?email=${exception.email}").onAuthenticationFailure(webFilterExchange, exception)
            }
            return super.onAuthenticationFailure(webFilterExchange, exception)
        }
    }
    oAuthWebFilter.setAuthenticationFailureHandler(authenticationFailureHandler)
    oAuthWebFilter.setServerAuthenticationConverter(authenticationConverter)
    oAuthWebFilter.setSecurityContextRepository(securityContextRepository)

    return oAuthWebFilter
}

/**
 * @see ServerHttpSecurity::getAuthenticationConverter
 */
private fun authenticationConverter(clientRegistrationRepository: ReactiveClientRegistrationRepository, authorizationRequestRepository: ServerAuthorizationRequestRepository<OAuth2AuthorizationRequest>): ServerAuthenticationConverter {
    val delegate = ServerOAuth2AuthorizationCodeAuthenticationTokenConverter(clientRegistrationRepository)
    delegate.setAuthorizationRequestRepository(authorizationRequestRepository)
    return ServerAuthenticationConverter { exchange: ServerWebExchange? ->
        delegate.convert(exchange).onErrorMap(OAuth2AuthorizationException::class.java) { e ->
            OAuth2AuthenticationException(e.error, e.error.toString())
        }
    }
}

class OAuth2SimpleLoginWebFilter(authenticationManager: ReactiveAuthenticationManager) : AuthenticationWebFilter(authenticationManager)

class OAuth2SimpleAuthenticationManager(
        client: ReactiveOAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest>,
        userService: ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User>,
        private val emailRepository: EmailRepository,
        private val roleRepository: UserRoleRepository
) : OAuth2LoginReactiveAuthenticationManager(client, userService) {
    override fun authenticate(authentication: Authentication?): Mono<Authentication> {
        val token = authentication as OAuth2AuthorizationCodeAuthenticationToken
        val vkAuth = token.clientRegistration.registrationId == "vk"
        val emailMono = if (vkAuth) authenticateVk(token) else {
            // generic auth flow
            super.authenticate(authentication)
                    .flatMap {
                        (it.principal as? OAuth2User)?.let { oauthUser ->
                            val email = oauthUser.attributes["email"] as? String
                            if (email == null) Mono.error(EmailWasNotProvidedException()) // access to email wasn't provided
                            else Mono.just(email)
                        } ?: Mono.empty()
                    }
        }

        return emailMono.flatMap { email ->
            emailRepository.findByEmailMono(email)
                    .flatMap { profile ->
                        if (!profile.verified) {
                            profile.verified = true // implicitly verify email assuming OAuth providers ensure that
                            emailRepository.updateMono(profile)
                        } else {
                            Mono.empty()
                        }.then(roleRepository.findAllMono(profile.id).map { roles ->
                            createAuth(profile.id.toString(), roles)
                        })
                    }.switchIfEmpty(Mono.error(EmailNotRegisteredException(email)))
        }
    }
}

/**
 * @return user email
 */
fun authenticateVk(token: OAuth2AuthorizationCodeAuthenticationToken): Mono<String> {
    // see parts of OAuth2AuthorizationCodeReactiveAuthenticationManager::authenticate
    val authorizationResponse = token.authorizationExchange.authorizationResponse
    if (authorizationResponse.statusError()) {
        return Mono.error(OAuth2AuthorizationException(authorizationResponse.error))
    }

    val authorizationRequest = token.authorizationExchange.authorizationRequest
    if (authorizationResponse.state != authorizationRequest.state) {
        val oauth2Error = OAuth2Error("invalid_state_parameter")
        return Mono.error(OAuth2AuthorizationException(oauth2Error))
    }
    // end of copy-paste from aforementioned class

    // https://vk.com/dev/authcode_flow_user
    val redirectUri = authorizationRequest.redirectUri
    val code = authorizationResponse.code
    val clientId = token.clientRegistration.clientId
    val clientSecret = token.clientRegistration.clientSecret

    class VkToken(val access_token: String, val expires_in: Int, val user_id: Int, val email: String?)

    return WebClient.builder().build().get()
            .uri(token.clientRegistration.providerDetails.tokenUri) {
                it.queryParam("client_id", clientId)
                        .queryParam("redirect_uri", redirectUri)
                        .queryParam("client_secret", clientSecret)
                        .queryParam("code", code)
                        .build()
            }.exchange()
            .flatMap { response -> response.bodyToMono(VkToken::class.java) }
            .flatMap { accessToken ->
                if (accessToken.email == null) Mono.error(EmailWasNotProvidedException()) // access to email wasn't provided
                else Mono.just(accessToken.email)
            }
}

fun logoutHandler(): DelegatingServerLogoutHandler {
    val securityContext = SecurityContextServerLogoutHandler()
    val writer = ClearSiteDataServerHttpHeadersWriter(ClearSiteDataServerHttpHeadersWriter.Directive.CACHE, ClearSiteDataServerHttpHeadersWriter.Directive.COOKIES)
    val clearSiteData = HeaderWriterServerLogoutHandler(writer)
    return DelegatingServerLogoutHandler(securityContext, clearSiteData)
}

// see also ExceptionTranslationWebFilter
// the difference here is that we don't try to redirect to login page
// inspired by https://stackoverflow.com/a/46515905/13751488
class AccessDeniedFilter : WebFilter {
    private val accessDeniedHandler = HttpStatusServerAccessDeniedHandler(HttpStatus.FORBIDDEN)

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        return chain.filter(exchange)
                .onErrorResume(org.springframework.security.access.AccessDeniedException::class.java) {
                    accessDeniedHandler.handle(exchange, it)
                }
    }
}
