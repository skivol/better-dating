package ua.betterdating.backend

import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import java.net.IDN

fun hostHeader(request: ServerRequest): String = request.headers().header("Host")[0]
fun unicodeHostHeader(request: ServerRequest): String = IDN.toUnicode(hostHeader(request))
fun renderTemplate(
        templateConfigurationFactory: FreeMarkerConfigurationFactoryBean, templateName: String, param: Any
): String {
    val template = templateConfigurationFactory.createConfiguration().getTemplate(templateName)
    return FreeMarkerTemplateUtils.processTemplateIntoString(template, param)
}

suspend fun okEmptyJsonObject() = ServerResponse.ok().json().bodyValueAndAwait("{}")
