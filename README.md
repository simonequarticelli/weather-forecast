# Weather Forecast

## Introduction

Shows the weather based on the city entered

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

List things you need to install the software and how to install them:
* Docker

### Installation

A step by step series of examples that tell you how to get a development env running.

First, clone the repository to your local machine:
``` bash
git clone https://github.com/simonequarticelli/weather-forecast.git cd weather-forecast
```

Then build and run your Docker containers:
``` bash
docker-compose up --build -d
```

Open your local browser and go to
``` bash
http://localhost:8000
```

## Usage

![prescription-choose-service-registry.gif](..%2Fprescription-choose-service-registry.gif)

## Tests

``` bash
npm test
```

## Built With

* [Docker](https://www.docker.com/) - Used to containerize the application.
* [Vue](https://vuejs.org/) - Used to develop the application.

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.
