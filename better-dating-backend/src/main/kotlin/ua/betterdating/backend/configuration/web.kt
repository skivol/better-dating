package ua.betterdating.backend.configuration

import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientConfigurationsInitializer
import org.springframework.fu.kofu.configuration
import org.springframework.fu.kofu.redis.reactiveRedis
import org.springframework.fu.kofu.session.reactiveRedis
import org.springframework.fu.kofu.session.session
import org.springframework.fu.kofu.webflux.security
import org.springframework.fu.kofu.webflux.webFlux
import org.springframework.http.HttpMethod
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.client.endpoint.WebClientReactiveAuthorizationCodeTokenResponseClient
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.client.web.server.WebSessionOAuth2ServerAuthorizationRequestRepository
import org.springframework.security.web.server.authentication.logout.HttpStatusReturningServerLogoutSuccessHandler
import org.springframework.security.web.server.context.ServerSecurityContextRepository
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository
import org.springframework.security.web.server.csrf.CsrfToken
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import org.springframework.web.server.adapter.ForwardedHeaderTransformer
import reactor.core.publisher.Mono
import ua.betterdating.backend.data.EmailRepository
import ua.betterdating.backend.data.UserRoleRepository
import ua.betterdating.backend.generateUrlSafeToken
import ua.betterdating.backend.handlers.*

fun webConfig(emailRepository: EmailRepository, roleRepository: UserRoleRepository) = configuration {
    val securityContextRepository = WebSessionServerSecurityContextRepository()
    val delegatingLogoutHandler = logoutHandler()

    beans {
        bean<EmailHandler>()
        bean<UserProfileHandler>()
        bean<PopulatedLocalitiesHandler>()
        bean<LanguagesHandler>()
        bean<InterestsHandler>()
        bean<PersonalQualitiesHandler>()
        bean<AdminHandler>()
        bean<AuthHandler>()
        bean<HealthHandler>()
        bean(::routes)

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

    webFlux {
        port = if (profiles.contains("test")) 8181 else 8080
        netty()
        codecs {
            string()
            jackson()
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
                it.addFilterAfter(CsrfFilter(), SecurityWebFiltersOrder.CSRF)
            }
            http {
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
                    authorize(ServerWebExchangeMatchers.pathMatchers(HttpMethod.POST, "/api/user/profile"), permitAll)
                    authorize("/api/user/email/**", permitAll)

                    // Login
                    authorize(ServerWebExchangeMatchers.pathMatchers(HttpMethod.POST, "/api/auth/login-link"), permitAll) // consider having web client credentials
                    authorize(ServerWebExchangeMatchers.pathMatchers(HttpMethod.POST, "/api/auth/login"), permitAll)
                    authorize("/api/support/csrf", permitAll)
                    authorize("/api/auth/me", hasAuthority("ROLE_USER"))

                    // Profile
                    authorize("/api/user/profile/**", hasAuthority("ROLE_USER"))
                    authorize("/api/populated-localities/**", hasAuthority("ROLE_USER"))
                    authorize("/api/languages/**", hasAuthority("ROLE_USER"))
                    authorize("/api/interests/**", hasAuthority("ROLE_USER"))
                    authorize("/api/personal-qualities/**", hasAuthority("ROLE_USER"))

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
}

class CsrfFilter : WebFilter { // https://github.com/spring-projects/spring-security/issues/5766
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        return (exchange.getAttribute<Mono<CsrfToken>>(CsrfToken::class.java.name) ?: Mono.empty())
                .doOnSuccess {} // do nothing, just subscribe :/
                .then(chain.filter(exchange))
    }
}
