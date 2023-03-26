# Classplus Boilerplate

A boilerplate to help start Node.js projects quickly and effectively. Packaged with Typescript, Docker, Kubernetes, PM2, Eslint, Prettier, VSCode config, Winston, Typedoc, Nodemon, Mocha, chai, supertest, Editorconfig, OpenAPI/Swagger, Jaeger/Open Tracing, etc.

## Basic Concepts behind the architecture

1. All the code you write resides within `src` folder and gets built when you start the server in `dist` folder.
2. All configuration is stored against the respective environment in `.env` file in the root.
3. All your navigation routes are placed in `src/app/routes` folder. You can place as many js files as you want within.
4. All your logic is written in controllers placed within `src/app/controllers` folder.
5. If you have utility functions which you will use across controllers, put them in `src/app/utils` folder.
6. All the server side rendered template files are to be placed in `src/app/views` folder.
7. All your static files and content is to be placed in the `public` folder.

## Deployment instructions

### Normal Installation

1. Install node.js and git
2. Add them to path if not already in path.
3. Install typescript globally with `npm install typescript -g`
4. Run npm install to get all the dependencies installed
5. cd to the project directory and run tsc to build using typescript
6. Run `npm run-script start-dev`

### Cloning & Running with Docker

1. Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
2. Clone/Download the repository and CD to it
3. Run `docker-compose up` to get the containers installed and started.
4. Run `docker-compose -f docker-compose-prod.yml up` to get the containers installed and started in production environment.

### Running via PM2

1. Install node.js and [pm2](https://github.com/Unitech/pm2)
2. CD to the pm2 directory
3. Run `pm2 start pm2-dev.json` to start the development cluster

### Running with Kubernetes

The project comes with some default kubernetes deployment and service yaml configurations. To use it, do `kubectl apply -f kubernetes/deployment.yaml` and `kubectl apply -f kubernetes/service.yaml` once Kubernetes and Kubectl are installed onto your system and configured.

## Building the code

1. Run `npm run build` to build the typescript code, copy relevant files

## Logging Middleware

Logs can be added by using the log function from error.utils by specifying the log level, payload, SPAN if using Jaeger and a tag object with key-value pairs.

```
log('info', {
  message: 'Log message here',
  key1: value1,
  key2: value2
});
```

Use the toggles provided in config to decide where you want to write logs. By default, console logging is enabled and file logging is disabled but this can be changed by using the config.

## Static Files

You can place all your static files in the `public` directory and that will get served by the server directly

## Formatting

The project comes with prettier configs and extensions built in.

You can format the project manually by running the command `npm run format` and prettier will format the project for you.

You may want to install an extension for your IDE though. More details on the same is available at https://prettier.io

## Linting

You can customize rules if needed using the .eslintrc file placed in the root directory. If you are using VSCode, you can have the ESLint extension installed. While linting is run everytime you build/start the server, you can manually run it by `npm run lint`

## Generate API Documentation (Swagger)

This project auto generates API documentation. You need to extend `MasterController` for that. Check `swager.json` which contains basic detail for swagger.

## Generate Code Documentation

You can generate documentation based on your code by running `npm run document`. Once generated, you can find the documentation in the docs folder. See [this](http://typedoc.org/guides/doccomments/) to know how to document your code to be rendered by the doc generator.

## Editorconfig

A .editorconfig file has been added to the project to enable consistency in development across different IDEs used by different developers. Visit http://editorconfig.org for more information. You might have to install plugins in your editor to get this to work.

## Running Tests

You can run your tests by using `npm run test` command. The project is bundled with Mocha + chai as the test framework and uses supertest for API request.

## Environmental Variables

You can set up the environmental variables in the .env file and that will get used in files like docker-compose, Dockerfile, etc.

## Development vs Production Environment

The development and production environments has some notable differences in their implementation. Everything is handled automatically when run with the right compose file.

1. Use of `nodemon` in development and directly running with `node` in production
2. `Single Stage Build` for Docker image in development and `Multi Stage Build` for Docker image in production
3. `src` mounted as volume in development and `no volume mount` in production
4. `All files copied` to container in development and `only necessary files copied` to container in production
5. `devDependencies installed` in development but `devDependencies ignored` in production

## Compatibility

Since this project uses all the latest features of the node ecosystem, it requires Node >= v10.0.0
