FROM node:14

# Install Java JDK
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME and add to PATH
RUN JAVA_HOME_DIR=$(dirname $(dirname $(readlink -f $(which javac)))) && \
    echo "export JAVA_HOME=$JAVA_HOME_DIR" >> /etc/profile && \
    echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile

ENV ANDROID_HOME /usr/local/android-sdk
ENV PATH ${PATH}:${ANDROID_HOME}/platform-tools

# Install dependencies
RUN apt-get update && apt-get install -y wget unzip && \
    mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-7302050_latest.zip && \
    unzip commandlinetools-linux-7302050_latest.zip && \
    rm commandlinetools-linux-7302050_latest.zip && \
    mv cmdline-tools latest && \
    yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses && \
    ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager "platform-tools"

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install dependencies
RUN apt-get update && apt-get install -y openjdk-11-jdk && rm -rf /var/lib/apt/lists/*

# Set a working directory
WORKDIR /usr/src/app

# Install global dependencies
RUN npm install -g react-native-cli

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install project dependencies
RUN yarn install --frozen-lockfile

# Setup shared volumes
# Note: to use caching, run docker commands like:
# docker run -it -v $(pwd):/app -v yarn-cache:/cache/yarn -v gradle-cache:/cache/gradle -p 8081:8081 partner-demo-app
VOLUME ["/app", "/cache/yarn", "/cache/gradle"]

# Copy the rest of the project files
COPY . .

# Open desired port
EXPOSE 8081
EXPOSE 5037

# Command to run when the container starts
CMD ["adb", "connect", "host.docker.internal:5037"]
