- возможность предложить организацию нового свидания в текущей паре позже; (отмена свидания, продолжение / если текущее свидание просрочено)
- Описать почему была сформирована пара
- учитывать наличие оценок правдивости профиля при организации свиданий;
- добавить возможность отметить комментарий (о не соответствии профиля действительности) как исправленный; или предложение по улучшению - как принят к выполнению или отвергнут;
- возможность обновлять свои комментарии к другим профилям ?
- place_rating (profile_id, place_id, score, motivation) ? (ease of communication / finding, publicity, near cafe / parks, other criteria ?) / возможность сообщить о проблеме (flag) связанной с местом
- возможность обновления (например, уточнение места или названия) существующих мест встречи (расположение имеет смысл менять только незначительно, если это версии одного и того же места);
- напоминания (нужно добавить/проверить место, скоро свидание и т.д.)
- возможность блокировать пользователя;
- Демо-режим
- Уточнения
  ** --> Естественность, осмысленность, целесообразность, целеустремленность ; трудная, но полноценная и осмысленная жизнь
  ** в описании сайта упомянуть "эффективные" / "результативные" свидания
  ** упомянуть что незнание/игнорирование/отрицание принципов и законов не освобождает от последствий/соответствующих результатов
  ** график: здоровье во времени (приближение)
- Экспортировать данные профиля в, например, json / изображение (export)
- слайдеры для веса/роста
- добавить иконки CentOS, Docker, React, Fort Awesome, GitHub в благодарности ?
- Дополнительные способы входа (Google? / Ok.ru?) (social login) / Viber / Telegram ?
- Возможность голосовать за темы новых постов ?
- Дополнительные поля в профиле
  ** Возможность приехать в другой город для встречи
  ** Дополнительны(й/е) языки
  ** наркотики ? болезни, состояние глаз/зубов?, страхи ? Комментарий к оценке ? Еда (повседневная, конфеты/сахар, ГМО?, кофе?, прививки?...) ? Гигиена (душ, чистка зубов) ?, сон, психологический/эмоциональный стресс ? (вид упражнений: силовые со своим весом / растяжка / бег / спортзал ?)
  ** Какие поля обязательны сразу ?
  ** (обратная связь) Причина почему не зарегистрировался/ася ?
  ** поля необязательных комментариев к действиям ?

  ** Фото (не обязательно?)
  ** Длина волос / борода
  ** Татуировки? Пирсинг (кроме сережек)?
  ** Состоял(а) ранее в серьезных отношениях (да / нет) (телегония)
  ** Есть дети (?) / Семья
  ** Духи / одеколон
  ** Корсет / бюстгалтер / корректирующее белье (утягивающее бельё)
  ** Пластическая хирургия
  ...

- не удалять профиль сразу, давать, например, 30 дней на отмену решения ?

- Улучшить внешний вид
- визуализировать этапы пользования системой с помощью timeline ? (https://material-ui.com/ru/components/timeline/)
- дополнительные цели встреч (желание поделиться опытом саморазвития / желание поделиться семейным опытом / желание увидеть потенциальных зятей-невесток :) )
- мотивирующие цитаты ?
- Fail2Ban
  ** https://unix.stackexchange.com/questions/88744/what-is-the-centos-equivalent-of-var-log-syslog-on-ubuntu
  ** https://www.digitalocean.com/community/tutorials/how-fail2ban-works-to-protect-services-on-a-linux-server#the-basic-concept
  ** https://www.digitalocean.com/community/tutorials/how-to-protect-an-nginx-server-with-fail2ban-on-ubuntu-14-04
  ** https://github.com/fail2ban/fail2ban/issues/1593

- continue developing the concept
- > > gamification... rebrand to a game ? (with scores visible only to you etc) <<
- limit parallel mail sending
- добавить уровни сложности ? (более простой режим использования мог бы для начала упускать некоторую информацию/данные?)
- добавить детей к иконке символизирующей семью ?

- fix og:image https://webmaster.yandex.ru/tools/microtest/ (ОШИБКА: поле http://ogp.me/ns#image отсутствует или пусто)
- integration tests using cypress

- LEGAL questions (trademark/non-profitable-entity, user agreement / rules / GDPR ?)

- SEO (checkout https://mangools.com/)
- protect from DDOS attacks: https://javapipe.com/blog/iptables-ddos-protection/
- fix caching in Nginx etc
- figure out Java Modules usage...
- checkout GraalVM (https://spring.io/blog/2020/06/10/the-path-towards-spring-boot-native-applications) / openJ9 (https://github.com/eclipse/openj9)
- analytics/stats (https://github.com/GoogleChrome/web-vitals)
- checkout @zeit/next-bundle-analyzer
- generate sitemap (for example, https://dev.to/embiem/auto-generate-sitemapxml-in-nextjs-2nh1)
- подумать насчет рекламы сайта (только нужно правильно сформулировать и выделить из потока "продажных" реклам... есть сомнения, смотрит/слушает их кто-либо)
- checkout webauthn (https://github.com/webauthn4j/webauthn4j-spring-security)

# On leisure

- попытаться переиспользовать SuccessHandler из социального логина в логине с помощью токена
- edge / facebook login
- древний/прописной шрифт для названия сайта
- checkout ReactiveCrudRepository ? https://docs.spring.io/spring-data/r2dbc/docs/1.0.0.M2/reference/html/#r2dbc.repositories
- checkout reverse proxy written in rust: https://github.com/sozu-proxy/sozu
- update dev proxy: https://github.com/chimurai/http-proxy-middleware

# Goods / design

- design print business cards (QR-code, name / description / "pass on"/spread the word instruction ;), contact email)
- T-shirts / wear with logo/name of the site (QR-code, url, саморазвитие + свидания + семья), обе стороны ? цвет, иконка ? направление / размер текста

# Content

- contacts/help page? / technologies used / licenses. https://github.github.com/gfm/
- add article about beauty / good qualities;
- add description of development process;
- add questionnaire ?
- reference Wikipedia's article and picture: https://ru.wikipedia.org/wiki/Смотрины ?
- Publicity / SEO: Facebook, Wikipedia, Reddit, Youtube, Wordpress, Linkedin, Vk, Dating sites (tinder, love.ua etc)?.
- форматировать статьи в LaTeX книгу 5/27/2020 5:19
- https://www.jetbrains.com/community/opensource/#support

# Things to consider

- consider using `redux-starter-kit` (https://redux-starter-kit.js.org)
- consider reCAPCHA ?
- Push notifications instead (or as an alternative?) of mail messages ? / Viber ?
- consider using Docker Registry (https://hub.docker.com/)
- consider registering Belarusian domain (.бел)
- mail delivery service ? (e.g. https://pepipost.com/ or https://developers.sendinblue.com/docs/send-a-transactional-email (https://themeisle.com/blog/best-free-email-marketing-services/))

# Optimise

# Recurring tasks

- [recurring] pay for email / virtual machine / domain names;
- periodic clean up of non-verified emails ?
- use crontab for periodic db backups
- backup ssh key

# Library bugs ?

## (React) Final Form

- In Field type="radio" meta.value is always? undefined
- form.getFieldState('fieldName') differs from field's own meta passed in, for example, validate callback (when, for example, initialValues changed after submit).
- (I use this behavior atm) form reset on change of initialValues
- dirtyAfterLastSubmit doesn't seem to take into account latest submitted values, but initialValues instead.
- "submitting" flag doesn't work ? (the component isn't re-rendered)

## spring-data-r2dbc

- one vs first

## material-ui

- ToggleButton passes "disableElevation" and "fullWidth" props to underlying button element (should, probably, handle them like "Button" does).
