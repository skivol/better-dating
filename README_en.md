[Русский README](https://github.com/skivol/better-dating/blob/master/README.md)

# Code repository for sites [смотрины.укр](https://смотрины.укр) and [смотрины.рус](https://смотрины.рус)
Self-Development, Dating/Relationships, Family

## Description of current functions of site "Смотрины"
(next plans can be found in [tasks.md](https://github.com/skivol/better-dating/blob/master/docs/tasks.md))

### Description of idea and feedback
[Proposal](https://смотрины.укр/предложение)

### [Registration](https://смотрины.укр/регистрация)
* saving of registration form fill in progress in local storage with possibility to clear it.

### [Privacy Policy](https://смотрины.укр/политика-конфиденциальности)

### [User Agreement](https://смотрины.укр/пользовательское-соглашение)

### Email confirmation
* and possibility to receive one more token for email confirmation in case of expired previous one.

### Login to the profile
* simultaneously with email confirmation;
* with the help of one time token, sent as email;
* with the help of profile in social sites as [Facebook](https://facebook.com/) and [Vk](https://vk.com/).

### View / update / remove / analyze own profile
When email is changed, the letter is sent to the previous address, and the new one needs to be verified again.
Some data has history of saving (height, weight, activity frequency, profile evaluation).

### View / analyze profile of author

### Administration page
* statistics on number of registered profiles and their removal;
* possibility to send a test letter.

### Logout from profile

## Non-functional requirements
* Encryption during transfer (https) and storage of data (Windows BitLocker, Linux Luks);
* SEO (Sitemap.xml, meta tags);
* SSR (styles, icons, server-side navigation);
* Offline support.

## Technologies
Technologies used are mentioned on the page [acknowledgements](https://смотрины.укр/благодарности), programming languages in section "Languages" on the current page.

## Development
* Docker
* Postgres - `bd-database-docker-build`, `bd-db-run` in [dev-aliases.sh](https://github.com/skivol/better-dating/blob/master/scripts/dev-aliases.sh);
* Redis - `bd-cache-docker-build`, `bd-cache-run`;
* Browser application - `bd-ui-server`;
* One needs to create `.env-dev` in the project's root from `.template-env` and fill in the variables' values;
* Add `.db-password` and `.mail-password`;
* Download [skivol/spring-fu](https://github.com/skivol/spring-fu) and run `spring-fu-publish-to-local`;
* Server application - `bd-backend-server` (this command launches server without integration with email service, instead letters will be printed to console);
* Application should be available by link http://localhost:3000/.

## Help
Help is welcomed in form of:
* suggestions on the improvements of site's functions and the information laid down in it;
* spreading and usage of the information present on the site, preferably with mention of the source;
* other actions promoting wholesome development of the ideas and goals designated on the site.

## [License](https://github.com/skivol/better-dating/blob/master/LICENSE)
