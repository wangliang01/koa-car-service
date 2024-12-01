# 声明构建阶段的镜像
FROM node:16


# 设置维护者信息
LABEL maintainer="wl1392830717@gmail.com"

# 设置工作目录
WORKDIR /app

# 将当前目录内容复制到容器中
COPY . .

# 安装依赖并执行构建命令
RUN npm install --registry=https://registry.npmmirror.com


# 暴露端口
EXPOSE 12006

# 
VOLUME ["/app/public"]
# 这样写会有一个warning - JSONArgsRecommended: JSON arguments recommended for CMD to prevent unintended behavior related to OS signals

CMD ["npm", "run", "start"]


# docker run -d --name imoocbackend -p 12005:12005 imoocbackend:latest 
