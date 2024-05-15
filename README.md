# Sellout Platform 

This repository contains the platform that powers the Sellout event ticketing service. 

## General Tech Stack and Tools
- React
- React-Native
- Styled Components
- Protobuf
- Google Cloud
- Docker
- Kubernetes
- Protobuf
- MongoDB
- NodeJS
- Full stack Typescript
- Apollo GraphQL
- Stripe
- Twilio/Plivo
- Sendgrid
- IPstack
- NPM
- Mapbox
- Lerna
- Nginx
- Helm
- Micro-services
- Nats
- Sentry
- Intercom
- Redux
- Redux-Saga
- JWT
- ElasticSearch
- Logstash
- Kibana
- Prometheus
- Grafana
- Jaegar
- Segment
- Google Analytics
- MJML

If you want to more specifically see what tools Sellout uses, check out the `package.json` files in the different Sellout packages.

## Sellout Development team shake up and moving forward.
As of right now, the current development team at Sellout is moving on to other projects and the rest of the Sellout team is looking for people to finish off the new version of the platform and push it to production. The current master branch is what currently exists in production at [app.sellout.io](https://app.sellout.io/) and the new unreleased version exists on the branch `feature/lerna`. There are several things that need to happen before this branch can be pushed to production for Sellout users to use. They include but are not limited to:
- Publish the reskinned ticket scanning app in the IOS and Play store.
- Provide a frontend for refund metrics and functionality.
- Update the backend to support refunds for both Stripe Charges and Stripe Payment Intents.
- Redesign the emails
- Merge in the `feature/firebase-phone-auth` branch and clean up as well integrate front end code in the purhcase portal ui.
- Fully fix package versioning issue. There was a bug where the builds in google cloud were not building properly.
- Test app on various browsers with full funcitonality QA and fix issues.
- Fix seating bug where multiple seats were created for items such as a seated table.
- Issues with the 'no-permission' page flashing.
- QA the app with Joel Martin (Head of Product) and fix issues.
- Fix pagination issues.
- Create scanned in cards.
- Set up deployment stuff for the lerna branch to be ready for when it is pushed to production.
- Add QR code scanning functionality in backstage.

Other Items that may not be needed to release but will still be probably needed going forward are:
- Add global linting to the entire Sellout Platform as well as an auto formatter.
- Write Unit and integration tests.

We also maintain a [Notion](https://www.notion.so/) board with more detailed and specific items of what is left to do before this new platform can be released.



## Repository Structure

The `SelloutPlatform` repository contains most of the front and backend code and uses [Lerna](https://github.com/lerna/lerna) to make the management of every package easier within this single repository. This is the repository that contains the `feature/lerna` branch.

The `SelloutPromoterMobile` repository contains the React-Native code that allows promoters to scan QR codes and admit customers into an event. This app has been published on both the IOS and Play stores for users to download onto their phone. There is a unreleased, reskinned version that should be published to the respective stores.

The `SelloutOps` repository contains the code responsible for observability and deployment. There is a build trigger that gets run when pushing to the SelloutPlatform that updates the live staging environment but to push to production, you will have to manually update the `image-tags.yaml` file with the correct commit hash.

The other repositories are either deprecated or serve some other function such as educating people.


## Getting Started

You must have NPM, NodeJS, and Lerna installed to run the Sellout system. Follow the steps below:

1. Acquire all of the required permissions and install all of the needed dependencies.
2. Create the required directory structure, install and link service dependencies with:
   ```
   $ cd $SELLOUT_SRC/SelloutPlatform && lerna bootstrap
   ```
3. Start the platform with:
   ```
   $ make start
   ```

This last command will start both the web clients and the the micro services. After a minute or so, the platform should be fully running. There are also several other commands in the `Makefile` that perform various tasks such as running against a local databse or restarting the deployment clusters. Everything should work on both MacOS and Ubuntu. There may be additonal configuration required if not using either of these OS's.

The only entrypoint into the system is a single GraphQL endpoint that lives at http://localhost:4000/graphql. Viewing this link will bring up the GraphQL playground and allow you to see the available GraphQL calls.

## Common

The platform shares a decent amount of code and this code is all located in the `common` folder which contains NPM packages that are installed and used by both frontend and backend platforms. Here you will find all the protobuf definitions, icons, component libraries, the base service defintion, TypeScript interfaces and models, and some utility code.

### Publishing common

When the files in the common directory are updated, you must publish these changes before you push your changes to GitHub. In order to do this, commit your existing changes, but do not push them. In the root the `SelloutPlatform` directory, run `lerna publish`. This will publish the changes made to common to NPM and will update all the services with the new version. This will auotmatically trigger a a commit and push the commits to github with the updated version.


## System Architecture

This system is built using Microservice Oriented Architecture (MSOA).

#### Internal Communication
Services communicate internally via [NATS](https://nats.io/) and [protobuffers](https://developers.google.com/protocol-buffers/). Each service subscribes to message topics they are interested in processing. Before publishing a message, the service encodes the request body as a protobuffer. Protobuffers are extremely lightweight (smaller than JSON and XML) and perfect for transporting messages between services. When a service publishes a message, NATS routes the message to the correct processor. The receiving service then processes the message and reports back to the requesting service the results of processing the request. This is an asynchronous [request/response pattern](https://en.wikipedia.org/wiki/Request%E2%80%93response) implemented via [publish/subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) mechanisms. This implementation allows all services to provide the durability of the request/response paradigm while also allowing the flexibility to drop down to the publish/subscribe layer for activities that require it (such as broadcasting via [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), [HTTP Server Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push), etc) with minimal changes to the system and without special casing.

#### External Communication
Services communicate externally via GraphQL. This is the client application's entrypoint into the system. GraphQL solves several common problems with REST API's including [overfetching](https://stackoverflow.com/questions/44564905/what-is-over-fetching-or-under-fetching) and underfetching, the [N+1 problem](https://restfulapi.net/rest-api-n-1-problem/), and also provides a declarative [type system](https://graphql.org/learn/schema/) which simplifies writing queries. GraphQL will run as a service in the system. When a request is received, GraphQL will attempt to resolve the request based on a set of rules that define the available queries and by which service they can be resolved. This involves dispatching a request to the specified service, modifying the results to match the requested format, and sending the results back to the client. An external broadcasting system will likely be implemented in the future to provide real-time updates to live data.

#### Scaling
Scaling is a first class citizen in this system. The two primary scaling techniques used are Pod Autoscaling and Cluster Autoscaling. Pod Autoscaling facilitates the automatic deployment of additional Kuberentes Pods when the existing pods are above maximum capacity. Cluster Autoscaling comes in once the entire system is under maximum capacity and there are no resources to allocate new Pods. Cluster Autoscaling solves this problem by adding new nodes (computers) to the cluster, thus raising the total amount of compute power available. Cluster Autoscaling can also save money by remove nodes from the cluster when they are no longer needed.

## System Operation

#### Google Cloud Platform
This system runs on the google cloud platform and uses cloud build to facilitate deployments.

#### Docker
[Docker](https://www.docker.com/) is the industry standard in software application containerization technology. At its core, it is lightweight virtualization technology. A Docker container encapsulates a single application and its dependencies providing seperation from the operating and file systems. A container can be run nearly anywhere without having to worry about the underlying system architecture. Docker is easy to use, has a very active community, is contributed to by some of the largest technology companies in the world, and has first-class orchestration support via Kubernetes. Each of the services in this system will run inside its own Docker container. When changes are made to a service, the service will be containerized, and uploaded to Google Cloud Registry for storage. When a container has been thoroughly tested, it will be deployed to Kubernetes via Helm. Each version of the container is kept long-term as an artifact, allowing us to rollback to specific versions of each service if necessary. 

#### Kubernetes
[Kubernetes](https://kubernetes.io/) is production-grade container orchestration. Kubernetes facilitates the networking of multiple computers into a computer cluster, allowing us to run many of computers in parallel. Kubernetes defines a set of usable abstractions to make scaling software applications vertically and horizontally in the cloud easy. Kubernetes and Docker work hand in hand. Docker abstracts the runtime environment of the application and Kubernetes abstracts the physical compute power and networking protocols required to run the Docker container. Each service in the system will use Kubernetes application, networking, and storage abstractions to run and communicate with other parts of the system.

#### Helm
[Helm](https://helm.sh/) is the Kubernetes package manager. Helm facilitates the packaging of application components into Helm Charts, which can be deployed to Kubernetes with a single command. A Helm Chart contains everything Kubernetes needs to run a single service, including information on the Docker container to run, how it should be run, and what other services are relied on. Each service will have its own Helm Chart, and because Helm Charts are composable, it is possible to deploy our entire system with a single command.


## Security

#### Internal Security
TLS Certificates to connect to NATS server. Limited access to VPC.

#### Distributed Tracing with Jaeger
Tracing allows developers to track a request all the way through the system from start to finish and measure how each subcomponent of the system behaves. Distributed architectures add the complexity of tracing requests between processes boundaries. To solve this, we use [Jaeger](https://www.jaegertracing.io/). Jaeger facilitates transaction monitoring, the measurement of several types of latency, and the tracking of requests between services, all in real-time. Jaeger comes with a monitoring UI to easily interpret the gathered data. The Jaeger backend will run as a service in our system and aggregate the information gathered by other services. Each service will implement Jaeger tracing protocols via the Jaeger client, which simply means that when services make or receive requests, they will include context information that will be reported to the Jaeger backend. 

#### Application Metrics with Prometheus and Grafana
In addition to tracing, it is important to have insight into the amount of stress your system is placing on the hardware it is running on. [Prometheus](https://prometheus.io/) allows us to collect metrics on CPU usage and memory utilization on a per container basis to ensure our hardware is application is performing correctly. [Grafana](https://grafana.com/) is a time-series visualization tool that works with Prometheus to make the gathered metrics easy to interpret. 

#### Distributed logging with ELK
ElasticSearch, Logstash, and Kibana make up the ELK stack, a solution to distributed log aggregation, storage, and search. [Logz.io](https://logz.io/) has a hosted version of the ELK stack with anomaly detection and other security mechanisms.


## Analytics

#### Segment
[Segment](https://segment.com/) is analytics gathering platform that allows the tracking of customer actions and transportation of data to around 50 different analysis tools. Segment allows us to track a customers journey through our application, from first page load to checkout and everything in between. The promoters we work with will likely have a preferred method of analyzing customer data, and using Segment allows us to transport their users data to whichever platform they specify. We will also want to analyze user data, and Segment allows us to pick, choose, and change our analysis platform without having to worry about changing how we track user in the application. Segment does all the necessary transformations before transporting data to an analysis tool. Segment is a granular user analytics tool.

#### Sntry
[Sentry](https://sentry.io) provides us with a way to see crash reports in the production and staging environments as well as analytics on the crash. We have set up a Slack bot that alerts us when there are crashes in produciton.

#### Google Analytics
[Google Analytics](https://analytics.google.com/analytics)(GA) facilitates the tracking of many important metrics and provides a high level view of how our application is being used. Promoters may also want to upload their own GA tracking code to track how their advertisements are performing.

## Clients
### Backstage
Backstage is the web client for promoters and event staff to create and manage events.

#### Purchase-portal
Purchase Portal is how customers can purchase tickets to an event. We use an Iframe to be able to embed this site into any other site so promoters can have a 'Buy Tickets' button that never redirects customers off of the promoter website.

### Mobile Client
The mobile client is built using [React Native](https://facebook.github.io/react-native/) with Javascript and functions as a way to allow event staff to stan QR codes on tickets to admit people into the event.

### Marketing site and event hosting
The marketing site and event hosting is done via a Webflow site. We have aWwebflow integration built to be able to push a JSON object to webflow that can then be rendered accordingly for customers to click on and pop up the purchase portal.
 
Trigger full new build.
