package ua.betterdating.backend.utils

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.bodyValueAndAwait
import org.springframework.web.reactive.function.server.json
import ua.betterdating.backend.AppearanceType
import ua.betterdating.backend.Gender
import ua.betterdating.backend.Recurrence
import java.net.IDN
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun host(request: ServerRequest): String = request.uri().host
fun unicodeHostHeader(request: ServerRequest): String = IDN.toUnicode(host(request))
suspend fun renderTemplate(
    templateConfigurationFactory: FreeMarkerConfigurationFactoryBean, templateName: String, param: Any
): String = withContext(Dispatchers.IO) {
    val template = templateConfigurationFactory.createConfiguration().getTemplate(templateName)
    FreeMarkerTemplateUtils.processTemplateIntoString(template, param)
}

suspend fun okEmptyJsonObject() = ServerResponse.ok().json().bodyValueAndAwait("{}")

// String extensions
fun String.toRecurrence(): Recurrence = Recurrence.valueOf(this)
fun Any?.toGender(): Gender = Gender.valueOf(this as String)
fun Any?.toAppearanceType(): AppearanceType = AppearanceType.valueOf(this as String)

fun formatDateTime(localDateTime: LocalDateTime): String =
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(localDateTime)

