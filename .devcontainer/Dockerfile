FROM ubuntu:latest
# Pré requisitos
RUN apt update && apt upgrade -y
RUN apt update && apt install -y ffmpeg curl git wget tree imagemagick git-flow vim nano
# Instala o docker
RUN apt-get install ca-certificates curl
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
RUN chmod a+r /etc/apt/keyrings/docker.asc
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin unzip
# Copia o id do usuário docker da maquina host (para usar o CLI no devcontainer) esse argumento é passado na construção da imagem
ARG HOST_DOCKER_GROUP_ID
RUN groupmod -g $HOST_DOCKER_GROUP_ID docker 
# Adiciona o usuário ubuntu ao grupo do docker
RUN usermod -aG docker ubuntu
# Atualiza os grupos do usuário ubuntu
RUN newgrp docker
# Instala o google chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt install ./google-chrome-stable_current_amd64.deb -y
# Usuario de desenvolvimento
USER ubuntu
WORKDIR /home/developer
RUN mkdir /home/developer/dev
# installs nvm (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# activate fnm
ENV PATH="/home/ubuntu/.nvm/:$PATH"
# Carrega o nvm e instala o Node.js
RUN bash -c "source /home/ubuntu/.nvm/nvm.sh && nvm install 22"