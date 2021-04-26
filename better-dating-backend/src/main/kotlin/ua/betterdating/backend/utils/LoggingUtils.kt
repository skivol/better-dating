package ua.betterdating.backend.utils

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.properties.ReadOnlyProperty
import kotlin.reflect.KProperty

// https://www.baeldung.com/kotlin/logging
fun getLogger(forClass: Class<*>): Logger = LoggerFactory.getLogger(forClass)
class LoggerDelegate<in R : Any> : ReadOnlyProperty<R, Logger> {
    override fun getValue(thisRef: R, property: KProperty<*>)
            = getLogger(thisRef.javaClass)
}
