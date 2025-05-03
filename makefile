FOLDER_DOCKER_YAMLS := docker
FOLDER_BACKEND := backend
FOLDER_FRONTEND := frontend


# Target to build and start the Docker containers in detached mode
build_and_up_containers:
	@echo "Create folders volumes if not exist..."
	mkdir -p ${FOLDER_DOCKER_YAMLS}/volumes
	@echo "Create folder postgres if not exist..."
	mkdir -p ${FOLDER_DOCKER_YAMLS}/volumes/postgres
	mkdir -p ${FOLDER_DOCKER_YAMLS}/volumes/postgres/data
	@echo "Building and starting containers..."
	docker compose -f ${FOLDER_DOCKER_YAMLS}/config.yml -f ${FOLDER_DOCKER_YAMLS}/development.yml up -d

# Target to stop and remove the running Docker containers
stop_containers:
	@echo "Stopping containers..."
	docker compose -f ${FOLDER_DOCKER_YAMLS}/config.yml -f ${FOLDER_DOCKER_YAMLS}/development.yml down


# Target to stop containers and remove images and volumes !! ONLY RUN THIS IF YOU WANT TO CLEAR EVERYTHING !!
# YOU CAN LOSE DATA
clear_images_and_volumes: 
	@echo "Clearing images and volumes..."
	docker compose -f ${FOLDER_DOCKER_YAMLS}/config.yml -f ${FOLDER_DOCKER_YAMLS}/development.yml down --rmi all --volumes
	docker system prune -f --volumes

# Target to install backend dependencies and run database migrations
install_and_migrate_database:
	@echo "Installing and migrating database..."
	cd ${FOLDER_BACKEND} && \
		npm install
	cd ${FOLDER_BACKEND} && \
		npm run build
	cd ${FOLDER_BACKEND} && \
		npm run db:migrate
	cd ${FOLDER_BACKEND} && \
		npm run db:seed

build_front_end:
	@echo "Building frontend..."
	cd ${FOLDER_FRONTEND} && \
		npm install -f

run_front_end:
	@echo "Running frontend with PM2..."
	cd ${FOLDER_FRONTEND} && \
		pm2 start npm --name "frontend-v2" -- run start:devlinux

run_backend:
	@echo "Running backend with PM2..."
	cd ${FOLDER_BACKEND} && \
		pm2 start npm --name "backend-v2" -- run dev:server

run_development: run_backend run_front_end
	echo "Running development..."

down_and_clean_development:
	@echo "Stopping development..."
	cd ${FOLDER_BACKEND} && \
		pm2 stop backend-v2 && \
		pm2 delete backend-v2
	cd ${FOLDER_FRONTEND} && \
		pm2 stop frontend-v2 && \
		pm2 delete frontend-v2

clean_node_modules:
	@echo "Cleaning node_modules..."
	cd ${FOLDER_BACKEND} && \
		rm -rf node_modules
	cd ${FOLDER_FRONTEND} && \
		rm -rf node_modules
	cd ${FOLDER_BACKEND} && \