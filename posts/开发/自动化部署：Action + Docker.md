@meta

```json
{
	"id": "cicd",
	"createTime": "2025-11-01 19:18",
	"key": ["CI/CD", "github", "gitea", "action", "docker", "next.js", "rust"],
	"background": "https://api.file.caiwen.work/picture/2025/11/01/20251101192050784.png"
}
```

## 1. 前言

最近由于成都上游服务器厂商倒闭，服务器数据差点丢了。为了保险起见，我打算改用一个国外的厂商的日本服务器。迁移的过程中突然想到了一些痛点：现在我的博客是 Next.js 写的，之前都是手动部署的，如果博客发生了一些修改，那么就要重新打包，传到服务器上，然后再解压，中间还要确保原来的一些配置文件不动，总之就很麻烦，也在一定程度上打消了开发博客的积极性。而我最近恰好在开发小程序时体验到了 CI/CD 的便利，于是打算也将博客和其他的一些项目进行自动化部署，并写下本文章记录一下。

我们希望最终要达成的目的是，当我对代码进行更改后，提交到 Github 仓库，然后 Github 上自动运行 Action，对项目进行编译，然后部署到服务器上。这样我们只需要提交代码，部署的事情全部自动完成，不需要再操心了。

## 2. Action

### 2.1 概览

Action 可以在仓库发生特定事件之后执行一系列自动化行为。我们可以使用 Action 来对代码进行检查和构建。考虑到如果我们还要自动部署的话，一般会构建成一个 Docker 镜像。

在 yaml 文件中，`name` 可以设置这个 Action 的名称：

```yaml
name: Build and Deploy
```

我们还可以在 `on` 中设置触发条件：

- 向 master 分支提交后触发：

```yaml
on:
  push:
    branches:
      - master
```

- 发布 release 之后触发：

```yaml
on:
  release:
    types: [published]
```

一个 Action 可以有多个 Job，一个 Job 又包含若干个 Steps。

```yaml
jobs:
	job1:
		runs-on: ...
		env:
			...
        steps:
        	...
    job2:
 		...
    job3:
    	...
```

其中 `runs-on` 指明了这个 Action 要在哪个 Runner 上运行。在 Github 上可以直接设置为 `ubuntu-latest`。

`env` 可以设置当前 Job 的环境变量。

`steps` 里填写当前 Job 执行的各种行为。

注意，Job 之间是隔离的，在一个 Job 里做出的修改不会影响到另一个 Job（可以视为不同 Job 位于不同的容器）

Action 中可能需要使用变量/密钥，我们可以在仓库中设置。然后使用 `{{secrets.KEY}}` 或是 `{{vars.KEY}}` 这样的形式来在 yaml 中引用。

### 2.2 直接运行指令

```yaml
- name: Do Something
  run: |
    ...(这里可以写多行的指令)
```

### 2.3 Checkout

Job 默认不会直接拉取当前仓库，需要我们手动使用 `checkout` 这个 action：

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

由于 Job 之间的隔离，在一个 Job 中 checkout 了，另一个 job 如果需要，还要重新 checkout。

### 2.4 语言相关

#### 2.4.1 Node.js

这里还使用 `yarn` 作为包管理工具：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: "22"
    cache: "yarn"
- name: Install dependencies
  run: yarn install --frozen-lockfile
```

注意，如果只是 `yarn install`，则 yarn 则会根据 `package.json` 来安装依赖。如果使用 `--frozen-lockfile` 参数，则会严格使用 `yarn.lock`。

#### 2.4.2 Rust

```yaml
- name: Setup Toolchain
  uses: actions-rust-lang/setup-rust-toolchain@v1
  with:
    toolchain: stable
    target: x86_64-unknown-linux-musl
    components: clippy, rustfmt
    cache-all-crates: "true"
```

这里使用 musl ，具体原因会在后面说。同时别忘了后面 `build` 的时候传入 `--target x86_64-unknown-linux-musl` 参数。

### 2.5 Docker

使用 Docker 前可能需要连接到 Registry

```yaml
- name: Login to Docker Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ vars.DOCKER_SERVER }}
    username: ${{ vars.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

然后可以 build 当前的 Dockerfile 并推送到已经连接到的 Registry

```yaml
- name: Build and Push Docker Image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: Dockerfile
    push: true
    tags: ${{ vars.DOCKER_SERVER }}/镜像名称:镜像版本
```

### 2.6 SSH 相关

一般我们使用 ssh 密钥的方式连接到生产环境。设置密钥：

```yaml
- name: Setup SSH
  uses: shimataro/ssh-key-action@v2
  with:
    key: ${{ secrets.SSH_KEY }}
    known_hosts: unnecessary
```

而后就可以直接通过命令行连接服务器了：

```yaml
- name: Deploy
  run: |
    ssh -o StrictHostKeyChecking=no ${{ vars.SSH_USER }}@${{ vars.SSH_HOST }} << 'EOF'
    ...
    EOF
```

最后的那个 EOF 表示中断 SSH 连接。

使用 `sshpass` 来上传文件到服务器：

```yaml
- name: Deploy to Server
  run: |
    apt-get install -y sshpass
    sshpass scp -o StrictHostKeyChecking=no \
      -P 22 target/x86_64-unknown-linux-musl/release/${{ github.event.repository.name }} \
      ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_SERVER }}:${{ vars.DEPLOY_DIR }}/
    EOF
```

### 2.7 跨 Job 传输文件

由于 Job 之间的隔离，如果你想把一个 Job 的产物给下一个 Job 接着用的话，需要先上传：

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: deploy-artifacts
    path: deploy/
```

然后再在另一个 Job 中下载：

```yaml
- uses: actions/download-artifact@v4
  with:
    name: deploy-artifacts
    path: deploy/
```

## 3. Docker

Docker 允许我们将自己的项目放入容器内运行，这样容器和宿主系统之间就是隔离的，我们就不用担心容器和宿主系统之间的影响，而只需要考虑不应被隔离的部分，如将容器内部的端口映射到宿主的哪个端口，以及容器内的文件/文件夹应该映射到宿主的哪个位置。

### 3.1 Dockerfile

Action 会根据 Dockerfile 来构建 Docker 镜像。Dockerfile 中主要配置运行的环境之类的，这里就简单列举一下不同语言大致的模板

#### 3.1.1 Python

```dockerfile
FROM python:3.14.0rc3-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
...
```

#### 3.1.2 Node.js

```dockerfile
FROM node:iron-trixie-slim
WORKDIR /app
```

### 3.2 Docker Registry

Action 构建好镜像之后需要把镜像传到一个仓库中。虽然 Github 提供 docker 仓库，但如果你的服务器在国内的话可能会有网络问题。一个办法是自己在服务器上搭建 docker registry。

首先创建一个 `auth` 目录，并在其中生成一个 `htpasswd` 用来配置 docker registry 的登录认证：

```shell
mkdir auth
sudo apt install apache2-utils
htpasswd -Bbn 用户名 密码 > auth/htpasswd
```

然后执行

```shell
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  -v 上面创建的auth目录的地址:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  -v registry数据存放的目录:/var/lib/registry \
  registry:2.7.0
```

不出意外的话 registry 就跑起来了。

docker registry 默认是 http 的，但这样的话，你在别的地方登录自己的 registry 时会报错，让你用 https。如果你执意要用 http 的话需要把自己的 registry 地址添加到 docker 的配置文件中然后再重启 docker 服务，非常麻烦。简单起见我们还是考虑配置 https，使用反向代理即可。

需要注意的是，如果你使用 nginx 的话，还需要调整一下最大上传大小：

```
client_max_body_size 1024m;
```

### 3.3 DockerCompose

直接运行 Docker 容器的话，如果启动容器需要的配置多了起来，那么启动容器的命令就会很长。同时，我们的项目可能由多个组件构成，比如可能还会用到 MySQL，Redis，Meilisearch，或者对于 Next.js 项目可能除了运行一个 Next.js 还需要运行一个 Rust 后端，此时再单个容器地管理就比较困难了，而把这些组件全部放入一个容器中也不是一个好选择（容器应该满足单一职责）。 而 DockerCompose 可以让我们把多个容器看成整体地管理。

DockerCompose 是一个 yaml 文件。在一个目录中创建一个 `docker-compose.yaml`，那么这个目录就成为了一个”项目目录“，我们可以在这个目录下运行 `docker-compose up` 来启动整个项目，或是 `docker-compose down` 来终止整个项目。

`docker-compose.yaml` 中需要填写整个项目需要的容器及配置，如：

```yaml
version: '3'
services:
	container1:
        image: 镜像的名称
        container_name: 容器名称
        restart: unless-stopped # 重启策略
        # 设置容器内的环境变量
        env_file:
          - .env
        environment:
          - key=value
      	ports:
          ... # 映射的端口
      	volumes:
      	  ... # 挂载卷
  	container2:
        depends_on:
          - container1 # 设置依赖的容器，只有依赖的容器启动好之后才会启动当前这个容器
```

`docker-compose pull` 会检查当前项目所涉及到的所有容器是否存在更新，如果有更新的话则会拉取最新的镜像（只拉取需要更新的）因此使用 docker compose 之后，Action 中的部署过程就会非常简单：我们直接 ssh 连接到生产环境，然后 cd 到项目目录，然后：

```shell
docker-compose down
docker-compose pull
docker-compose up -d
docker container prune -f
docker rmi -f $(docker images | grep '<none>' | awk '{print $3}')
docker image prune -a -f
```

其中最后三行则会清理无用的容器和镜像（Docker 中拉取新的镜像后，原来的镜像还保留，需要手动删除。

使用 docker compose 还需要注意一个问题。位于同一个 docker compose 的容器之间进行网络通信的话，需要使用 service 的名称来当地址。比如原来连接 MySQL 可能是 `localhost:3306` ，现在把 MySQL 作为位于同一 docker compose 的容器，并且定义该容器的 service 名称为 `db`，那么就需要使用 `db:3306` 来连接。

## 4. 其他问题

### 4.1 Next.js 项目

对于 Next.js 项目，我一般会使用 standalone 方式进行部署。在项目的 `next.config.ts` 中设置：

```ts
const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
};
```

然后需要复制文件：

```yaml
- name: Prepare artifacts
  run: |
    mkdir -p deploy
    cp -r public deploy/
    cp -r .next/standalone/{.[!.]*,*} deploy/
    cp -r .next/static deploy/.next/static/
```

由于 Next.js 的编译产物中有一些 `.` 开头的文件/文件，这使得我们在复制的时候需要使用 `{.[!.]*,*}` 避免 `cp` 忽略了这些文件。

同理，如果我们需要 `actions/upload-artifact@v4`，那么还需要：

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: deploy-artifacts
    path: deploy/
    include-hidden-files: true #这里
```

### 4.2 Rust 静态编译

Rust 在 Linux 上编译时默认使用 glibc。而 glibc 是动态链接的，这导致如果你的生产环境上的 glibc 版本较低时就无法运行了。如果你不方便更新 glibc 版本的话，就需要考虑 musl 了，musl 是静态链接的。

首先需要安装一些工具：

```shell
apt-get install -y musl-tools
```

然后按 `2.4.2` 中所述，设置 `target: x86_64-unknown-linux-musl`，再编译就可以了。

有些 crate 使用了 `openssl` 而不是 `rustls` ，此时使用 `musl` 编译会出现问题。解决办法是在 `Cargo.toml` 中添加：

```toml
[target.'cfg(not(windows))'.dependencies]
openssl = { version = "0.10", features = ["vendored"] }
```

### 4.2 自建 Gitea 引发的问题

上面的内容在 Github 上面进行应该是问题不大的。但如果你选择了自建 Gitea，则会有新的注意事项。

#### 4.2.1 网络问题

我们的 Gitea 是放在国内服务器上的，因此会出现一些网络问题。

**Action**

Action 中引用的外部 action 默认都是从 github 上拉取的。我们的解决方案是在 gitee 上建一个镜像仓库，然后引用 gitee 上的 action。

**rust**

为 rustup 和 cargo 设置镜像。同时我们把 `2.4.2` 的内容整合在一起，形成了新的 action：

```yaml
name: Setup Toolchain

runs:
  using: "composite"
  steps:
    - name: Rustup Mirror
      run: |
        echo "RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup" >> $GITHUB_ENV
        echo "RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup" >> $GITHUB_ENV

    - name: Setup Toolchain
      uses: https://gitee.com/skr2005/setup-rust-toolchain@main
      with:
        toolchain: stable
        target: x86_64-unknown-linux-musl
        components: clippy, rustfmt
        cache-all-crates: "true"

    - run: echo "/root/.cargo/bin" >> $GITHUB_PATH

    - name: Crates Mirror
      run: |
        mkdir -vp ${CARGO_HOME:-$HOME/.cargo}

        cat << EOF | tee -a ${CARGO_HOME:-$HOME/.cargo}/config.toml
        [source.crates-io]
        replace-with = 'ustc'

        [source.ustc]
        registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"

        [registries.ustc]
        index = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
        EOF
```

**python**

为 `pip` 设置镜像：

```shell
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.mirrors.ustc.edu.cn/simple/
```

**apt**

我们还需要为 action runner 中的 apt 添加镜像。我们同时整合了设置 `musl-tools`，得到了如下的 Dockerfile：

```dockerfile
FROM gitea/runner-images:ubuntu-22.04

# 设置 TUNA 清华源、清除不需要的源，安装 musl-tools
RUN sed -i 's|http://.*.ubuntu.com|http://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list \
    && rm -f /etc/apt/sources.list.d/* \
    && apt-get update \
    && apt-get install -y musl-tools # \
```

构建上述镜像，并设置 `musl-ubuntu:ubuntu-22.04` 的 tag。在 gitea 的配置文件中设置：

```yaml
labels:
  - "ubuntu-22.04:docker://musl-ubuntu:ubuntu-22.04"
```

类似的方法还可以用在其他需要用到 apt 的 Dockerfile 中。

#### 4.2.2 跨 Job 传输文件

这个事我们已经在 `2.7` 中说了。但是需要注意一点，这个 `actions/upload-artifact@v4` 是将文件从 action runner 中上传到 gitea 所在的服务器的。如果 runner 和 gitea 不在一个服务器上，那么这个过程可能会很慢。
