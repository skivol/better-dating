* Авторизация (базовая - пользователь:пароль с каждым запросом / сессия в печеньках - реквизиты первый раз, потом номер сессии с каждым запросом / токен в печеньках - реквизиты первый раз, токен доступа с каждым последующим запросом)
    ** Войти с помощью социальных сетей (Facebook / Vk ? / GitHub / Google ?) (social login) / Viber / Telegram ?
    ** Отправить ссылку для входа на почту OAuth 2.0 ? email login
* "Обработка персональных данных" - https://tilda.cc/ru/privacy-generator/
* Авторизироваться одновременно с подтверждением почты
* Просмотреть профиль другого учасника / автора системы
* Дополнительные поля в профиле
    ** Псевдоним (ник) ? наркотики ? болезни, состояние глаз/зубов?, страхи ? Комментарий к оценке ? Еда (повседневная, конфеты/сахар, ГМО?, кофе?...) ? Гигиена (душ, чистка зубов) ?, сон, психологический/эмоциональный стресс ? (вид упражнений: силовые со своим весом / растяжка / бег / спортзал ?)
    ** Какие поля обязательны сразу ?
    ** (обратная связь) Причина почему не зарегистрировался/ася ?
    ** поля необязательных комментариев к действиям ?
* registration for 1-st stage.
    Meta для страницы с формой регистрации ??
    Сохранять прогресс заполнения формы регистрации в локальном хранилище ?
* админка (количество зарегистрированных людей, количество удалений профилей)
* график: здоровье во времени (приближение)
* в описании сайта упомянуть "эффективные" / "результативные" свидания
* упомянуть что не знание/игнорирование/отрицание принципов и законов не освобождает от последствий/соответствующих результатов
* Удалить профиль (подтверждение через почту) - вести статистику количества удаленных профилей ?

* Второй этап
    Цель встреч (поиск второй половинки / желание поделиться семейным опытом / желание увидеть потенциальных зятей-невесток :) )
    Имя (не обязательно?)
    Фото (не обязательно?)
    Город проживания (для облегчения организации свиданий) / возможность приехать в другой город для встречи
    Родн(ой/ые) язык(и)
    Дополнительны(й/е) языки
    Тип внешности (love.ua: Европейская, Азиатская, Кавказская, Индийская, Темнокожая, Испанская, Ближневосточная, Американская, Смешанная;)
    Естественный цвет волос / глаз ? (https://zen.yandex.ru/media/womanmag/sovremennoe-okrashivanie-vidy-tehniki-i-cvet-volos-5b2cabc66628cb00a8199536)
    Естественный цвет волос / длина / борода
    Татуировки? Пирсинг (кроме сережек)?
    Состоял(а) ранее в серьезных отношениях (да / нет) (телегония)
    Есть дети (?) / Семья
    Интересы (прогулки, чтение, музыка, фильмы и т.д.)
    Что нравится в себе и в окружающих людях
    Духи / одеколон
    Корсет / бюстгалтер / корректирующее белье (утягивающее бельё)
    Пластическая хирургия
    ...
* Экспортировать данные профиля в, например, json (export)

* continue developing the concept
* >> gamification... rebrand to a game ? (with scores visible only to you etc) <<
* limit parallel mail sending

* fix README file.
* fix og:image https://webmaster.yandex.ru/tools/microtest/ (ОШИБКА: поле http://ogp.me/ns#image отсутствует или пусто)
* integration tests using kotlin jgiven / cypress

* LEGAL questions (trademark/non-profitable-entity, user agreement / rules ?)
** https://choosealicense.com
** https://choosealicense.com/no-permission/
* protect from DDOS attacks: https://javapipe.com/blog/iptables-ddos-protection/
* fix caching in Nginx etc
* add profiles to activate Flyway on demand
* figure out Java Modules usage...
* checkout GraalVM
* analytics/stats (https://github.com/GoogleChrome/web-vitals)
* checkout @zeit/next-bundle-analyzer
* generate sitemap (for example, https://dev.to/embiem/auto-generate-sitemapxml-in-nextjs-2nh1)

# On leisure
* fails to register with self-signed certificate... (serviceWorker.ts:106 Error during service worker registration: TypeError: Failed to register a ServiceWorker: ServiceWorker script evaluation failed)
* investigate other ways to formulate a query: https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#reference
* checkout ReactiveCrudRepository ? https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#r2dbc.repositories
* nextjs HMR in WSL 2 doesn't work...


# Goods / design
* update site icon (e.g. https://www.flaticon.com)
* design print business cards (QR-code, name / description / "pass on"/spread the word instruction ;), contact email)
* T-shirts / wear with logo/name of the site (QR-code, url, саморазвитие + свидания + семья), обе стороны ? цвет, иконка ? направление / размер текста

# Content
* contacts/help page? / technologies used / licenses. https://github.github.com/gfm/
* add article about beauty / good qualities;
* add description of development process;
* add questionnaire ?
* reference Wikipedia's article and picture: https://ru.wikipedia.org/wiki/Смотрины ?
* Publicity / SEO: Facebook, Wikipedia, Reddit, Youtube, Wordpress, Linkedin, Vk, Dating sites (tinder, love.ua etc)?.
* форматировать статьи в LaTeX книгу 5/27/2020 5:19

# Things to consider
* consider using `redux-starter-kit` (https://redux-starter-kit.js.org)
* consider reCAPCHA ?
* Push notifications instead (or as an alternative?) of mail messages ? / Viber ?
* consider using Docker Registry
* consider registering Belarusian domain (.бел)

# Optimise

# Recurring tasks
* [recurring] pay for email / virtual machine / domain names;
* periodic clean up of non-verified emails ?
* use crontab for periodic certificates/db backups
* backup ssh key


# Library bugs ?
## (React) Final Form
* In Field type="radio" meta.value is always? undefined
* form.getFieldState('fieldName') differs from field's own meta passed in, for example, validate callback (when, for example, initialValues changed after submit).
* (I use this behavior atm) form reset on change of initialValues
* dirtyAfterLastSubmit doesn't seem to take into account latest submitted values, but initialValues instead.
