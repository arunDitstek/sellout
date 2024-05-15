# Sets up services and installs needed dependencies.
setup:
	@cd ${SELLOUT_SRC} \
	&& mkdir -p local-db/mongo \
	&& mkdir -p local-db/nats-server \
	&& cd SelloutPlatform/common \
	&& npm install \
	&& npm link \
	&& cd ../scripts \
	&& npm install \
	&& node forEachService.js "npm install" \
	&& node forEachService.js "npm link @sellout/sellout-common" \


# Opens 3 terminal tabs to run mongo, gnats, and each service
start-local:
	@case "$(shell uname -s)" in \
		Linux*) \
			gnome-terminal --tab --command "mongod --dbpath ${SELLOUT_SRC}/local-db/mongo" \
			--tab --command "nats-server" \
			--tab --execute bash -c "cd ${SELLOUT_SRC}/SelloutPlatform/;lerna run start --parallel;bash";; \
		Darwin*) \
			ttab -w "mongod --dbpath ${SELLOUT_SRC}/local-db/mongo" \
			&& ttab -w "nats-server" \
			&& ttab -w "cd ${SELLOUT_SRC}/SelloutPlatform;lerna run start --parallel;bash";; \
		*) \
			echo "Terminal not yet supported"; \
	esac

# Opens 3 terminal tabs to run mongo, gnats, and each service
start:
	@case "$(shell uname -s)" in \
		Linux*) \
			gnome-terminal --tab --command "kubectl port-forward sellout-data-mongodb-replicaset-0 27017:27017" \
			--tab --command "nats-server" \
			--tab --execute bash -c "cd ${SELLOUT_SRC}/SelloutPlatform/scripts;lerna run start --parallel;bash";; \
		Darwin*) \
			ttab "kubectl port-forward sellout-data-mongodb-replicaset-0 27017:27017" \
			&& ttab "nats-server" \
			&& ttab "cd ${SELLOUT_SRC}/SelloutPlatform;lerna run start --parallel;bash";; \
		*) \
			echo "Terminal not yet supported"; \
	esac

# Opens a terminal and only runs the services.
services:
	@case "$(shell uname -s)" in \
		Linux*) \
			gnome-terminal --tab --execute bash -c "cd ${SELLOUT_SRC}/SelloutPlatform/scripts;node forEachService.js \"npm run start\";bash";; \
		Darwin*) \
			ttab -w "cd ${SELLOUT_SRC}/SelloutPlatform/scripts;node forEachService.js \"npm run start\";bash";; \
		*) \
			echo "Terminal not yet supported"; \
	esac

publish:
	@cd ${SELLOUT_SRC}/SelloutPlatform/common \
	&& npm run build \
	&& cd ${SELLOUT_SRC}/SelloutPlatform/scripts \
	&& node updateCommon.js common \
	&& cd ${SELLOUT_SRC}/SelloutPlatform/common \
	&& npm publish \
	&& cd ${SELLOUT_SRC}/SelloutPlatform/scripts \
	&& node updateCommon services \


mongo:
	kubectl port-forward sellout-data-mongodb-replicaset-0 27017:27017

curl:
	kubectl run curl --image=radial/busyboxplus:curl -i --tty --rm

scale:
	kubectl scale deployment sellout-email sellout-graphql sellout-organization sellout-user sellout-user-profile sellout-order sellout-stripe sellout-plivo sellout-artist sellout-venue sellout-event sellout-role sellout-file-upload sellout-task-queue sellout-web-flow sellout-fee sellout-seating --replicas=$(replicas)

lint:
	node scripts/forEachService.js "./node_modules/.bin/tslint src/*.ts --fix"
