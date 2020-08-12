package ua.betterdating.backend.configuration

import java.io.File

fun readPassword(profiles: Array<String>, path: String) = if (profiles.contains("test")) "" else File(path).readText().trim()
