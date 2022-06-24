<p align="center">
  <p align="center">
    <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
      <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
    </a>
  </p>
  <p align="center">
    Users and logs provide clues. Sentry provides answers.
  </p>
</p>

# What's Sentry?

Sentry is a service that helps you monitor and fix crashes
in realtime. The server is in Python, but it contains a full API for
sending events from any language, in any application.

<p align="center">
  <img src="https://github.com/getsentry/sentry/raw/master/docs/screenshots/thumb-1.png" width="270">
  <img src="https://github.com/getsentry/sentry/raw/master/docs/screenshots/thumb-2.png" width="270">
  <img src="https://github.com/getsentry/sentry/raw/master/docs/screenshots/thumb-3.png" width="270">
</p>

## Official Sentry SDKs

  - [JavaScript](https://github.com/getsentry/sentry-javascript)
  - [React-Native](https://github.com/getsentry/sentry-react-native)
  - [Python](https://github.com/getsentry/sentry-python)
  - [Ruby](https://github.com/getsentry/sentry-ruby)
  - [PHP](https://github.com/getsentry/sentry-php)
  - [Go](https://github.com/getsentry/sentry-go)
  - [Rust](https://github.com/getsentry/sentry-rust)
  - [Java/Kotlin](https://github.com/getsentry/sentry-java)
  - [Objective-C/Swift](https://github.com/getsentry/sentry-cocoa)
  - [C\#/F\#](https://github.com/getsentry/sentry-dotnet)
  - [C/C++](https://github.com/getsentry/sentry-native)
  - [Dart](https://github.com/getsentry/sentry-dart)
  - [Perl](https://github.com/getsentry/perl-raven)
  - [Clojure](https://github.com/getsentry/sentry-clj/)
  - [Elixir](https://github.com/getsentry/sentry-elixir)
  - [Unity](https://github.com/getsentry/sentry-unity)
  - [Laravel](https://github.com/getsentry/sentry-laravel)
  - [Electron](https://github.com/getsentry/sentry-electron/)

# Resources

  - [Documentation](https://docs.sentry.io/)
  - [Community](https://forum.sentry.io/) (Bugs, feature requests,
    general questions)
  - [Discord](https://discord.gg/PXa5Apfe7K)
  - [Contributing](https://docs.sentry.io/internal/contributing/)
  - [Bug Tracker](https://github.com/getsentry/sentry/issues)
  - [Code](https://github.com/getsentry/sentry)
  - [Transifex](https://www.transifex.com/getsentry/sentry/) (Translate
    Sentry\!)

# Manual

1. Pull 3 images

docker pull  redis
docker pull postgres
docker pull getsentry/sentry:nightly

2. Run redis

docker run -d --name sentry-redis redis

3. Create Postgres Database

docker run  --name sentry-postgres --restart always -e POSTGRES_PASSWORD='postgres123' -e ALLOW_IP_RANGE=0.0.0.0/0 -v /data/postgresql:/var/lib/postgresql -p 5432:5432 --privileged -d postgres


4. Create SENTRY_SECRET_KEY to <secrect_key>

docker run --rm sentry config generate-secret-key 

5. when initial db, must to use "upgrade"

docker run -it --rm --name sentry e  SENTRY_SECRET_KEY=‘<secret_key>'  --link sentry-postgres:postgres --link sentry-redis:redis  -p 9000:9000  getsentry/sentry:nightly  upgrade

6. Run sentry formly

docker run -it -d --name sentry -e  SENTRY_SECRET_KEY='<secret_key>'  --link sentry-postgres:postgres --link sentry-redis:redis  -p 9000:9000  getsentry/sentry:nightly

7. Configuring the initial user, If you did not create a superuser during upgrade, use the following to create one:

docker run -it --rm -e SENTRY_SECRET_KEY=‘<secret_key>' --link sentry-redis:redis --link sentry-postgres:postgres sentry createuser  --superuser


8. create cron and work
The default config needs a celery beat and celery workers, start as many workers as you need (each with a unique name)

 docker run -d --name sentry-cron -e SENTRY_SECRET_KEY=‘<secret_key>' --link sentry-postgres:postgres --link sentry-redis:redis sentry run cron

 docker run -d --name sentry-worker-1 -e SENTRY_SECRET_KEY=‘<secret_key>' --link sentry-postgres:postgres --link sentry-redis:redis sentry run worker


9. open browser to http://ip:9000
