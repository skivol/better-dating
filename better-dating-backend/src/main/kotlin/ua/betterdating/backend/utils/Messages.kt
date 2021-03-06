package ua.betterdating.backend.utils

const val automaticDateAndTime = "Так как одна из целей системы поощрение незамедлительной встречи пользователей в жизни, дата и время свидания выбраны автоматически, что, конечно, имеет свои преимущества и ограничения."
const val automaticPlaceDateAndTime = "Так как одна из целей системы поощрение незамедлительной встречи пользователей в жизни, место, дата и время свидания выбраны автоматически, что, конечно, имеет свои преимущества и ограничения."
const val striveToComeToTheDate = "Погода, настроение или что-либо ещё может быть не на высоте, но цель должна быть выше всех этих мелочей - постарайтесь не смотря ни на что прийти на свидание ;)."
const val beResponsibleAndAttentive =
    "Отнеситесь, однако, к нему ответственно и помните, что нужно быть внимательными и осторожными (доверяй, но проверяй)."
const val additionalInfoCanBeFoundOnSite = "А дополнительные советы можно будет прочитать на странице посвященной свиданиям на сайте."

fun bodyWithVerificationToken(body: String, dateVerificationToken: String) =
    "$body <br/><h3>Код для подтверждения свидания, который нужно будет передать второму пользователю: </h3><h2>$dateVerificationToken</h2>"
fun bodyMentioningVerificationToken(body: String) =
    "$body <br/><h3>Для подтверждения свидания нужно будет ввести код полученный другим пользователем.</h3>"
