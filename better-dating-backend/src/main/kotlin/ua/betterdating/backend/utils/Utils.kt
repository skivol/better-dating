package ua.betterdating.backend

import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import java.net.IDN

fun host(request: ServerRequest): String = request.uri().host
fun unicodeHostHeader(request: ServerRequest): String = IDN.toUnicode(host(request))
fun renderTemplate(
        templateConfigurationFactory: FreeMarkerConfigurationFactoryBean, templateName: String, param: Any
): String {
    val template = templateConfigurationFactory.createConfiguration().getTemplate(templateName)
    return FreeMarkerTemplateUtils.processTemplateIntoString(template, param)
}

suspend fun okEmptyJsonObject() = ServerResponse.ok().json().bodyValueAndAwait("{}")
