export const youngerThan20 =
  "Для тех кто моложе 20 лет индекс может быть не точным.";
export const bodyMassIndexInfo = (
  value: string,
  message: string,
  range: string
) => `
**Индекс массы тела** (без учета пола и возраста, кг/м^2)

Немного грубый, но хороший ориентировочный показатель здоровья учитывающий рост и вес.

Значение: **${value}**

Оценка: **${message}** (*${range}*)
`;
export const bodyMassIndex =
  "Индекс массы тела (без учета пола и возраста, кг/м^2)";
export const bmiDescription =
  "Немного грубый, но хороший ориентировочный показатель здоровья учитывающий рост и вес.";
export const value = "Значение:";
export const evaluation = "Оценка:";

export const massDeficiency = "Выраженный дефицит массы тела";
export const underWeight = "Недостаточная (дефицит) масса тела";
export const normal = "Норма";
export const preOverweight = "Избыточная масса тела (предожирение)";
export const overweight = "Ожирение";
export const severeOverweight = "Ожирение резкое";
export const verySevereOverweight = "Очень резкое ожирение";

export const bmiMotivation = `
Так как, легкость и радость движения зависят от умеренного веса тела и хорошего состояния мышц,
стоит всегда обращать внимание на питание (например, **медленно-углеводная диета**) и
физические упражнения (например, **со своим собственным весом**, см. примечание к "Физические упражнения").
В случае необходимости, более подробно эти темы будут раскрыты в статьях на сайте позднее.
`;

export const someProsOfKeepingGoodWeight = `
Некоторые преимущества поддержания умеренного веса тела:
* Стройная фигура
* Легкость движения
* Здоровье
* Хороший пример окружающим
`;

export const tipsOnHeightExercises = `
При желании, рост также можно стимулировать правильным питанием и определенными физическими упражнениями
(например, [Методика Лонского](https://yarasty.ru/58-uprazhneniya-metodika-uvelicheniya-rosta-lonskogo.html))
`;

export const physicalExerciseRecommendation = `
Оптимальной частотой целенаправленных физических упражнений (с точки зрения системы),
является не реже нескольких раз в неделю, так как в противном случае продвижение вперед
и улучшение физических показателей затруднено. В то же время, физическая форма не должна
становиться самоцелью и следует искать баланс между затраченным временем и получаемым результатом.
`;

export const physicalExerciseInfo = `
Эффективная (с точки зрения соотношения затрачиваемого времени и получаемого долгосрочного результата),
развивающая силу и достойная упоминания система прогрессивных упражнений с собственным весом
(таким образом подходит вне зависимости от пола)
изложена в книге **Пола Уэйда "Тренировочная зона"** ("Convict Conditioning" Paul Wade).

Ключевые идеи:
* 6 видов упражнений, направленных на разные группы мышц;
* по 10 разновидностей в каждом виде с изменяющейся сложностью, в которой 1 уровень доступен
для выполнения практически каждому человеку вне зависимости от пола/возраста/состояния,
а 10-й вызовет трудности у большинства атлетов;
* большая часть упражнений не требует никакого дополнительного оборудования;

Также стоит упомянуть растяжку мышц для снятия зажимов и болевых ощущений
(например, видео ["Упражнения для спины и суставов | Полный комплекс лучших упражнений доктора Божьева"](https://youtu.be/C0JHF77GGkY)).
`;

export const someProsOfKeepingGoodPhysicalShape = `
Некоторые преимущества поддержания хорошей физической формы:
* Красивое, стройное, подтянутое тело
* Легкость движения и физической активности
* Здоровье
* Хороший пример окружающим
`;

export const smokingWarning = `
Курение (или употребление никотина любым другим способом) занимает внимание, отнимает время, энергию и деньги
у человека который этим занимается, в то же время ухудшая его/её здоровье, а также здоровье окружающих
(пассивное курение, плохой пример) и потомков (нарушения ДНК и прочее).
`;
export const smokingInfo = `
Книга **Аллена Карра "Легкий способ бросить курить"**, развеивает все мифы и заблуждения
связанные с курением и достойна внимания тех, кто решился избавиться от этой зависимости
(но как и любая книга, требует терпения и внимательного прочтения).
Написана бывшим заядлым курильщиком с 33 летним стажем и будет полезна даже некурящим для
формирования более четкой позиции по этому вопросу и лучшего понимания курящих людей.

Для общего понимания причин возникновения зависимости от наркотических веществ рекомендуется
видео - [Лекция Марины Грибановой - "Правда о наркотиках"](https://youtu.be/QU3TQZD0e0U)
`;

export const alcoholWarning = `
Прием алкоголя не является необходимым для полноценной жизни человека и
обладает схожими отрицательными последствиями с другими вредными зависимостями
(например, никотиновой).
`;
export const alcoholInfo = `
Подход Аллена Карра также применим и к алкогольной зависимости и изложен
в его книге **"Легкий способ бросить пить"**.
`;

export const computerGamesWarning = `
Компьютерные/видео игры сложно однозначно категоризировать как хорошее или плохое времяпрепровождение в связи с большим
разнообразием игр, разной частотой с которой люди в них играют и разными причинами по каким они это делают.
Если рассматривать их с точки зрения эффективного личностного развития и продвижения человека вперед в реальном мире, то у большинства из них слабый потенциал, поэтому
с точки зрения системы, они не достойны затрат времени/энергии, более того в некоторых случаях они вызывают зависимость.
`;
export const computerGamesInfo = `
Однако возможности и эффективность образовательного программного обеспечения могут быть усилены
с помощью использования игровых элементов.

Дополнительная информация: [Зависимость от компьютерных игр](https://ru.wikipedia.org/wiki/Зависимость_от_компьютерных_игр)
`;

export const gamblingWarning = `
Азартные игры не приносят реальной пользы участникам и делают упор на случай,
а не на умения и навыки (таким образом демотивирует их развитие),
участие в них (на деньги) искривляет понимание причинно-следственных связей во
время правильного денежного оборота (когда деньги человек получает за предоставленные товары/услуги).
`;

export const haircutWarning = `
Зачем человеку волосы ? Не зная ответ на этот вопрос не стоит их обрезать,
так как незнание не освобождает от последствий.
В ряде древних источников волосы связывают со здоровьем и умственными способностями,
а их обрезание с потерей соответствующих качеств.
В придачу к этому люди с длинными волосами выглядят здраво, взросло и красиво.
`;
export const haircutInfo = `
Эта тема будет, вероятно, подробнее разбираться отдельно, но вот несколько интересных наблюдений:
* волосы имеют разную ограниченную наибольшую естественную длину на разных участках тела;
* некоторое количество волос выпадает ежедневно и это нормально;
* скорость роста волос у мужчин и женщин разная ([познавательная статья](https://expertpovolosam.com/uhod/rost/ckorost))
`;

export const hairColoringWarning = `
И снова, какая функция у волос ? Каким образом мы воспринимаем разные объекты в разном цвете ?
Цвет - это воспринимаемая нами определенным образом отраженная часть света, в то время как другая
часть была поглощена объектом. Таким образом, изменение цвета волос меняет излучение которое они
поглощают нарушая естественный для данного человека энергетический обмен.
`;
export const hairColoringInfo = `
Также изменение цвета волос вводит в заблуждение окружающих,
требует применения химических красителей у которых могут быть побочные эффекты (например, ухудшение состояния волос),
требует регулярного докрашивания (т.к. волосы растут)
и может стать дополнительной причиной для короткой стрижки.
`;

export const makeupWarning = `
Желание хорошо выглядеть вполне естественно, однако следует отдавать предпочтение честным и правильным подходам,
таким как поддержание отличного здоровья и физической формы, вместо пудры/румян, туши, теней, карандашей, помады,
корректирующего фигуру белья и прочих вещей которые вводят окружающих в заблуждение.
Также косметика содержит химические вещества вредящие здоровью ([например](https://zen.yandex.ru/media/zdoroveika/vliianie-kosmetiki-i-gigienicheskih-sredstv-na-zdorove-cheloveka-5daeb74cc05c7100adaabe18)).
`;
export const makeupInfo = `
Интересно, что во время овуляции:
* кожа у девушек и женщин становится гладкой, бархатистой, матовой ([источник](https://aif.ru/health/secrets/1156713))
* губы полнее, само лицо розовее ([источник](https://trv-science.ru/2016/05/31/obraz-ovulyacii/))
`;

export const intimateRelationsOutsideOfMarriageWarning = `
Какие обстоятельства влияют на зачатие ребенка ? Что играет существенную роль в здоровье новорожденного/новорожденной ?
Одним из таких обстоятельств является, в современной терминологии, телегония.
Суть этого явления (в понимании автора системы) в том, что на энергетическом уровне
мужчина оставляет отпечаток (образ духа и крови) на женщине, причем первый - наиболее сильный,
а образы последующих интимных партнеров наслаиваются и, в большинстве случаев, привносят только,
сравнительно, незначительное количество информации,
среди которой однако, помимо прочего, генетическая предрасположенность к болезням.
Поэтому для здоровья детей будущим родителям стоит воздержаться от интимных отношений вне их новой семьи.
`;
export const intimateRelationsOutsideOfMarriageInfo = `
Не смотря на то, что отпечаток остается на женщине, ответственность за внесемейные интимные
отношения несут обе участвующие стороны.
Стоит задуматься, должны ли дети расплачиваться за такое "удовольствие" своих будущих родителей ?

Для тех кто не знал и хочет исправить положение можно посоветовать к прочтению книги "Сущность и Разум"
([Т.1](http://levashov.info/книги/сущность-и-разум/#1) и [Т.2](http://levashov.info/книги/сущность-и-разум/#2))
для улучшения понимания происходящего в организме человека на энергетическом уровне,
а также сеансы по снятию блокировок Николая Левашова (например, [здесь](https://youtu.be/mVF4rm2Y56o)).
`;

export const pornographyWatchingWarning = `
Просмотр порнографии, помимо прочего, искажает восприятие действительности
и снижает вероятность создания семьи,
посредством обмана естественной необходимости человека состоящей в продолжении рода.
Таким образом вместо этого стоит сосредоточить внимание и усилия на саморазвитии
и отношениях с реальными людьми.
`;
export const pornographyWatchingInfo = `
Вещи о которых хорошо бы задуматься:
* возможность блокировать/рассеивать возбуждение через осознание нереальности/неуместности происходящего;
* осознание, преимуществ прекращения просмотра порно/рукоблудия и принятие соответствующего решения (например, [Великие Люди про Половое Воздержание. Польза Воздержания.](https://youtu.be/TwHmz7cRGLs));
* изучение материалов на эту тему (есть ряд YouTube каналов, Reddit сообщества предоставляющие качественную информацию, а также форумы и сайты, например,
    [АнтиО](https://antio.ru), [ПОРНОГРАФИЯ - ОРУЖИЕ ГЕНОЦИДА!](https://www.pravdu.info/зло/оружия-геноцида-ii/порнография-оружие/)
    и [Онанизм – враг всего живого!](http://малышева.ru-an.info/новости/онанизм-враг-всего-живого/));
* тренировка лобково-копчиковой мышцы (Упражнение Кегеля);
* понимание естественных процессов в организме, таких как инстинкт продолжения рода, менструации, поллюции и т.д.

Сообщите если чего-то не хватает, или что-то можно улучшить !
`;

export const results = "Итоги анализа";
export const starProfile = "Выдающийся профиль!";
export const goodProfileButCanBeImproved =
  "Хороший профиль, но можно кое-что улучшить! ;)";

export const save = "Сохранить";
export const analyze = "Проанализировать";
export const hideAnalysis = "Скрыть анализ";

export const nonEligibleForSecondStageReason =
  "Для перехода на следующий этап нужно заполнить всю информацию запрашиваемую на текущем этапе";
export const nextLevel = "Перейти к следующему этапу";
export const removeProfile = "Удалить профиль";
export const viewAuthorsProfile = "Профиль автора";

export const personalHealthEvaluationCriteria =
  "Критерии: состояние кожи / волос / ногтей / глаз, радость от движения, легкость выполнения физических упражнений, гибкость мышления, управление вниманием, легкость принятия волевых решений.";
export const awful = "Ужасное";
export const soSo = "Так себе";
export const weak = "Слабое";
export const notBad = "Ничего";
export const normalHealth = "Нормальное";
export const aboveAverage = "Выше среднего";
export const good = "Хорошее";
export const goodPlus = "Хорошее+";
export const wonderful = "Замечательное";
export const cantBeBetter = "Лучше некуда";
