[Русский README](https://github.com/skivol/better-dating/blob/master/README.md)

# Code repository for sites [смотрины.укр](https://смотрины.укр) and [смотрины.рус](https://смотрины.рус)

Self-Development, Dating/Relationships, Family

## Description of current functions of site "Смотрины"

(next plans can be found in [tasks.md](https://github.com/skivol/better-dating/blob/master/docs/tasks.md))

### Description of idea and feedback

[Proposal](https://смотрины.укр/предложение)

### [Registration](https://смотрины.укр/регистрация)

- saving of registration form fill in progress in local storage with possibility to clear it.

### [Privacy Policy](https://смотрины.укр/политика-конфиденциальности)

### [User Agreement](https://смотрины.укр/пользовательское-соглашение)

### Email confirmation

- and possibility to receive one more token for email confirmation in case of expired previous one.

### [Login to the profile](https://смотрины.укр/вход)

- simultaneously with email confirmation;
- with the help of one time token, sent as email;
- with the help of profile in social sites as [Facebook](https://facebook.com/) and [Vk](https://vk.com/).

![Login Box](/docs/images/login.png)

### View / update / remove / analyze own profile

When email is changed, the letter is sent to the previous address, and the new one needs to be verified again.
Some data has history of saving (height, weight, activity frequency, profile evaluation).

BMI analysis example:

![BMI analysis example](/docs/images/bmi-analysis-example.png)

### Activate second stage

Profile menu -> _Перейти к следующему этапу_ (becomes available when all first stage information is provided).
![Profile menu](/docs/images/profile-menu.png)

#### Second stage activation dialog:

![Second stage activation dialog](/docs/images/second-stage-activation-dialog.png)
![Second stage activation dialog 2](/docs/images/second-stage-activation-dialog-2.png)

### Automated pair matching algorythm (for _"Поиск второй половинки"_ (to find soul mate) goal)

- users have verified emails;
- users participate in automated pair matching;
- users are _not_ in active pair at the moment;
- participants of different gender;
- from same BMI category;
- age - male participant can be within 7 years older or 2 years younger of female participant;
- height - male participant can be (within) 25 cm higher or 5 cm lower female participant;
- intentions in regards to some habits related to nicotine, alcohole intake, pornography watching and intimate relations outside of marriage should match (that is, users both are not going to do this in future, or both are going to do it to some extent; if participant hasn't decided yet, then he/she can match anyone in regards to this parameter);
- one and the same appearance type;
- from the same populated locality (to ease date organization, in initial version);
- native language should match (or one of them should match);
- processing in order of registration.

In code this logic can be found in [PairMatcherTask.kt file](/blob/master/better-dating-backend/src/main/kotlin/ua/betterdating/backend/tasks/PairMatcherTask.kt) and in [PairsRepository.kt](/blob/master/better-dating-backend/src/main/kotlin/ua/betterdating/backend/data/PairsRepository.kt).

### View formed pairs / organized dates

With help of user menu _"Пары и Свидания"_ (Pairs and Dates) one can view corresponding information.

![Pairs and Dates](/docs/images/pairs-and-dates__scheduled_date.png)

![What's next ?](/docs/images/whats-next.png)

### View / analyze participant's profile with whom the pair was formed

One time profile view links are generated and sent via email when the pair is formed. It can additionally be generated using pair menu _"Посмотреть профиль ..."_ (view profile ...).

![Pair Menu](/docs/images/pair-menu.png)

### Date related actions

- _Я на месте_ (check in) - option to mark the arrival to date;
- _Подтвердить свидание_ (verify date) - provides possibility to enter date verification code received by other user;
- _Оценить профиль_ (evaluate profile) - truthfullness evaluation, suggestions in profile improvement / also possibility to view corresponding evaluation/suggestions of own profile;
- _Не получается прийти_ (cannot come) - actions in case impossibility to come to the date.

![Date Menu](/docs/images/date-menu.png)

### Pair decision

One can add _"Решение"_ (decision) in regards to the pair with the help of corresponding pair menu option, provided at least 1 verified date.

![Pair Decision](/docs/images/pair-decision.png)

### Adding / verifying / viewing dating place

In case when available dating place (in corresponding populated locality) and free time slot for automated date organization are missing, user gets opportunity to suggest such a place which should be checked and approved by the second user.

![Date status which needs place suggestion](/docs/images/add-place-status.png)

![Adding dating place](/docs/images/add-dating-place.png)

### Events view

There's a possibility to view _"События"_ (Events) (option in user menu) connected to the profile, for example, its views by other users.

![User Menu](/docs/images/user-menu.png)

### View / analyze profile of author

### Administration page

- statistics on number of registered profiles and their removal;
- possibility to send a test letter.

### Logout from profile

## Non-functional requirements

- Encryption during transfer (https) and storage of data (Windows BitLocker, Linux Luks);
- SEO (Sitemap.xml, meta tags);
- SSR (styles, icons, server-side navigation);
- Offline support.

## Technologies

Technologies used are mentioned on the page [acknowledgements](https://смотрины.укр/благодарности), programming languages in section "Languages" on the current page.

## Development

- Docker
- Postgres - `bd-database-docker-build`, `bd-db-run` in [dev-aliases.sh](https://github.com/skivol/better-dating/blob/master/scripts/dev-aliases.sh);
- Redis - `bd-cache-docker-build`, `bd-cache-run`;
- Browser application - `bd-ui-server`;
- One needs to create `.env-dev` in the project's root from `.template-env` and fill in the variables' values;
- Add `.db-password` and `.mail-password`;
- Download [skivol/spring-fu](https://github.com/skivol/spring-fu) and run `spring-fu-publish-to-local`;
- Server application - `bd-backend-server` (this command launches server without integration with email service, instead letters will be printed to console);
- Application should be available by link http://localhost:3000/.

## Help

Help is welcomed in form of:

- suggestions on the improvements of site's functions and the information laid down in it;
- spreading and usage of the information present on the site, preferably with mention of the source;
- other actions promoting wholesome development of the ideas and goals designated on the site.

## [License](https://github.com/skivol/better-dating/blob/master/LICENSE)
